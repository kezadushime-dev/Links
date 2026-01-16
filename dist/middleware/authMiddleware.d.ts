import { Request, Response, NextFunction } from 'express';
/**
 * Middleware yo kurinda inzira (Protect Routes)
 * Igenzura niba Token ari iy'ukuri ikongeramo user n'uruhushya (role)
 */
export declare const protect: (req: Request | any, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=authMiddleware.d.ts.map