import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const getClientIp = (req: Request): string => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // Get the first IP in the chain
    return Array.isArray(forwardedFor) 
      ? forwardedFor[0].split(',')[0].trim()
      : forwardedFor.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
};

export const userLogger = (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email} = req.body;
        const userId = email;
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const clientIp = getClientIp(req);
        
        // Get location from geoblock middleware if available
        const location = (req as any).geoLocation || null;
        
        logger.info('User Activity', {
            userId,
            ip: clientIp,
            userAgent,
            path: req.path,
            method: req.method,
            location: location ? {
                country: location.country,
                region: location.region,
                city: location.city,
                ll: location.ll
            } : null
        });
    } catch (error) {
        console.error('Error in user logger:', error);
    }
    
    next();
}; 