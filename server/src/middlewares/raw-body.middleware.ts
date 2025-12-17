import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to capture raw body for webhook signature verification
 * This should be used before express.json() middleware
 */
export const rawBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  let data = '';
  
  req.setEncoding('utf8');
  
  req.on('data', (chunk) => {
    data += chunk;
  });
  
  req.on('end', () => {
    (req as any).rawBody = data;
    next();
  });
};

/**
 * Alternative middleware that works with already parsed bodies
 * Converts the parsed body back to JSON string for signature verification
 */
export const rawBodyFromParsedMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // If body is already parsed, convert it back to JSON string
  if (req.body && typeof req.body === 'object') {
    (req as any).rawBody = JSON.stringify(req.body);
  } else if (typeof req.body === 'string') {
    (req as any).rawBody = req.body;
  } else {
    (req as any).rawBody = '';
  }
  
  console.log('Raw body from parsed middleware:', (req as any).rawBody);
  next();
};
