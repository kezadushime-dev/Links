import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ijambo_ryihariye_321';

/**
 * Middleware to protect routes (Kurinda inzira)
 */
export const protect = async (req: any, res: Response, next: NextFunction) => {
    try {
        let token: string | undefined;

        // 1. Check if Token is in Headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // 2. If no token
        if (!token) {
            return res.status(401).json({ error: "Unauthorized - No token provided" });
        }

        // 3. Verify Token
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        // 4. Attach user info to request
        req.user = decoded.id;      
        req.userRole = decoded.role; 

        console.log(`✅ User ${req.user} authenticated as ${req.userRole}`);

        next(); 
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};

/**
 * Alias for protect middleware
 */
export const authMiddleware = protect;

/**
 * Role-based access control
 */
export const roleCheck = (...allowedRoles: string[]) => {
    return (req: any, res: Response, next: NextFunction) => {
        if (!allowedRoles.includes(req.userRole)) {
            return res.status(403).json({ error: "Forbidden - Insufficient permissions" });
        }
        next();
    };
};