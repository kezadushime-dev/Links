"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret';
/**
 * Middleware yo kurinda inzira (Protect Routes)
 */
const protect = async (req, res, next) => {
    try {
        let token;
        // 1. Reba niba Token iri mu Headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // 2. Niba nta token ihari
        if (!token) {
            return res.status(401).json({ error: "Ntabwo wemerewe kwinjira, nta Token ihari" });
        }
        // 3. Verify Token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // 4. Shyira amakuru muri req
        // Ibi bihura neza na controllers twubatse (req.user na req.userRole)
        req.user = decoded.id;
        req.userRole = decoded.role;
        console.log(`Log: User ${req.user} connected as ${req.userRole}`);
        next();
    }
    catch (error) {
        res.status(401).json({ error: "Token ntabwo ari yo cyangwa yararangiye" });
    }
};
exports.protect = protect;
//# sourceMappingURL=authMiddleware.js.map