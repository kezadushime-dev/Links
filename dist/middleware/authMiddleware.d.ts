import { Response, NextFunction } from 'express';
/**
 * Middleware yo kurinda inzira (Protect Routes)
 */
export declare const protect: (req: any, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=authMiddleware.d.ts.map