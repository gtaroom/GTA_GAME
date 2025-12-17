import geoip from "geoip-lite";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error";
import { logger } from "../utils/logger";
import axios from 'axios';
import { Reader } from '@maxmind/geoip2-node';
import path from 'path';
import fs from 'fs';

// Restricted states with their full names for better logging
const restrictedStates = {
  "WA": "Washington",
  "ID": "Idaho",
  "NV": "Nevada",
  "LA": "Louisiana",
  "MI": "Michigan",
  "MT": "Montana",
  "NJ": "New Jersey",
  "CT": "Connecticut",
  "NY": "New York",
  "DE": "Delaware",
  "CA": "California"
} as const;

// Quebec is allowed, all other Canadian provinces are restricted
const QUEBEC_CODE = "QC";

// Cache for IP lookups to reduce API calls
const ipCache = new Map<string, {
  data: any,
  timestamp: number
}>();

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Initialize MaxMind reader
interface GeoIPReader extends Reader {
    city(ip: string): any;
}
let maxmindReader: GeoIPReader | null = null;
const maxmindDbPath = path.join(__dirname, '../../public/GeoLite2-City.mmdb');
if (fs.existsSync(maxmindDbPath)) {
    Reader.open(maxmindDbPath).then(reader => {
        maxmindReader = reader as GeoIPReader;
        logger.info('MaxMind GeoLite2 database initialized successfully');
    }).catch(err => {
        logger.error('Error initializing MaxMind:', err);
    });
} else {
    logger.error('GeoLite2 database file not found. Please download it from MaxMind.');
}

const getClientIp = (req: Request): string | null => {
  // Get all possible IP headers
  const forwardedFor = req.headers["x-forwarded-for"];
  const realIp = req.headers["x-real-ip"];
  const remoteAddress = req.socket.remoteAddress;

  logger.debug('IP Detection Headers', {
    forwardedFor,
    realIp,
    remoteAddress
  });

  // Function to validate IP format
  const isValidIp = (ip: string): boolean => {
    // IPv4 regex
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    // IPv6 regex (simplified)
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    // IPv6 with :: notation
    const ipv6CompressedRegex = /^([0-9a-fA-F]{1,4}:){0,6}(:[0-9a-fA-F]{1,4}){1,6}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ipv6CompressedRegex.test(ip);
  };

  // Function to clean and validate IP
  const cleanIp = (ip: string): string | null => {
    // Remove IPv6 prefix if present
    const cleanIp = ip.replace('::ffff:', '');
    return isValidIp(cleanIp) ? cleanIp : null;
  };

  // First try X-Real-IP (from Nginx)
  if (realIp) {
    const ip = cleanIp(realIp as string);
    if (ip) {
      logger.info('Using X-Real-IP from Nginx', { ip });
      return ip;
    }
  }

  // Then try X-Forwarded-For
  if (forwardedFor) {
    // Split the header into individual IPs
    const ips = Array.isArray(forwardedFor) 
      ? forwardedFor[0].split(',')
      : forwardedFor.split(',');
    
    // Get the first IP (original client IP)
    const firstIp = ips[0].trim();
    const validIp = cleanIp(firstIp);
    if (validIp) {
      logger.info('Using X-Forwarded-For IP', { 
        ip: validIp,
        fullChain: ips.join(', ')
      });
      return validIp;
    }
  }

  // Finally fall back to remote address
  if (remoteAddress) {
    const ip = cleanIp(remoteAddress);
    if (ip) {
      logger.info('Using Remote Address', { ip });
      return ip;
    }
  }

  logger.error('No valid IP address found', {
    headers: req.headers,
    remoteAddress: req.socket.remoteAddress
  });
  return null;
};

// Function to get accurate geo location
const getAccurateGeoLocation = async (ip: string) => {
  try {
    // Check cache first
    const cached = ipCache.get(ip);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // Use MaxMind mmdb for lookup
    if (maxmindReader) {
      const data = maxmindReader.city(ip);
      ipCache.set(ip, {
        data,
        timestamp: Date.now()
      });
      return data;
    }

    // Fallback to geoip-lite
    return geoip.lookup(ip);
  } catch (error) {
    logger.error('Error getting accurate geo location:', error);
    // Fallback to geoip-lite
    return geoip.lookup(ip);
  }
};

export const geoblock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip geoblock for webhook endpoints
    if (req.path.startsWith('/webhook/')) {
      return next();
    }

    // Only apply geoblock to register and login endpoints
    const isAuthEndpoint = req.path === '/register' || 
                          req.path === '/login';
    
    if (!isAuthEndpoint) {
      return next();
    }

    logger.info('Geo-block check for auth', { 
      path: req.path,
      method: req.method,
      headers: {
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-real-ip': req.headers['x-real-ip']
      }
    });

    // Development mode handling
    if (process.env.NODE_ENV === "development") {
           return next();
    }
    
    const ip = getClientIp(req);
    if (!ip) {
      // For auth endpoints, we'll be more lenient
      logger.warn("Unable to determine IP address for auth", { 
        path: req.path,
        headers: req.headers 
      });
      return next(); // Allow the request to proceed
    }

    const geo = await getAccurateGeoLocation(ip);
    if (!geo) {
      // For auth endpoints, we'll be more lenient
      logger.warn("Unable to lookup geo location for auth", { ip });
      return next(); // Allow the request to proceed
    }

    // Share location data with other middlewares
    (req as any).geoLocation = geo;
    const country = geo?.country?.isoCode || geo?.country;
    const state = geo?.subdivisions?.[0]?.isoCode || geo?.region;
    
    logger.info("Geo Location for auth", {
      ip,
      country: geo?.country?.isoCode || geo?.country,
      state: geo?.subdivisions?.[0]?.isoCode || geo?.region,
      city: geo?.city?.names?.en || geo?.city,
      isProxy: geo?.traits?.isAnonymousProxy,
      latitude: geo?.location?.latitude,
      longitude: geo?.location?.longitude,
      headers: {
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-real-ip': req.headers['x-real-ip']
      }
    });

    console.log('geo', geo);
    // Check country - allow US and Canada
    if (country !== "US") {
      logger.warn("Access denied: Non-US country", { ip, geo });
      return res.status(403).json({
        success: false,
        message: "Access denied: Not available in your country"
      });
    }

    // Check restricted US states
    if (country === "US" && state in restrictedStates) {
      logger.warn("Access denied: Restricted US state", { 
        ip, 
        geo,
        state: restrictedStates[state as keyof typeof restrictedStates]
      });
      return res.status(403).json({
        success: false,
        message: `Access denied: Not available in ${restrictedStates[state as keyof typeof restrictedStates]}`
      });
    }

    // Check Canadian provinces - only Quebec is allowed
    // if (country === "CA" && state !== QUEBEC_CODE) {
    //   logger.warn("Access denied: Restricted Canadian province", { 
    //     ip, 
    //     geo,
    //     province: state
    //   });
    //   return res.status(403).json({
    //     success: false,
    //     message: `Access denied: Not available in this Canadian province`
    //   });
    // }

    next();
  } catch (error) {
    logger.error('Error in geoblock middleware:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
