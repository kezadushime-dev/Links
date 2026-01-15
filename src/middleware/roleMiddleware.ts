import { Response, NextFunction } from 'express';

export const authorize = (...roles: string[]) => {
    return (req: any, res: Response, next: NextFunction) => {
        // 1. Genzura niba 'protect' middleware yaratanze req.userRole
        if (!req.userRole) {
            return res.status(401).json({ error: "Ntago tuzi role yawe, banza winjire (Login)" });
        }

        // 2. Genzura niba role y'umuntu winjiye iri mu zanditse kuri iyo route
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({ 
                error: `Ntabwo wemerewe gukoresha iyi nzira. Bisaba kuba uri: ${roles.join(' cyangwa ')}` 
            });
        }

        next(); // Niba role ye ihura, akomeza kuri controller
    };
};