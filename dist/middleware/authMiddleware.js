"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = "ijambo_ryihariye_321";
/**
 * Middleware yo kurinda inzira (Protect Routes)
 * Igenzura niba Token ari iy'ukuri ikongeramo user n'uruhushya (role)
 */
const protect = async (req, res, next) => {
    try {
        let token;
        // 1. Reba niba Token iri mu mitwe (Headers) ya Request
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            // Fata code ya token ukuyeho ijambo 'Bearer'
            token = req.headers.authorization.split(' ')[1];
        }
        // 2. Niba nta token ihari, hagarika request
        if (!token) {
            return res.status(401).json({ error: "Ntabwo wemerewe kwinjira, nta Token ihari" });
        }
        // 3. Gereranya Token na ya Secret yacu
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // 4. Shyira amakuru mu muryango wa 'req' kugira ngo izindi controller ziyakoreshe
        // Ibi ni ingenzi cyane kuri Task 3 (Cart) na Task 4 (RBAC)
        req.user = decoded.id; // Bika ID y'umuntu
        req.userRole = decoded.role; // Bika Role (Admin/Vendor/Customer)
        // Ibi bizagufasha kureba muri Terminal niba bikora
        console.log(`Uwinjiye afite Role: ${req.userRole}`);
        next(); // Reba ku nzira ikurikira (Controller)
    }
    catch (error) {
        // Niba token yararangiye (expired) cyangwa ari impimbano
        res.status(401).json({ error: "Token ntabwo ari yo cyangwa yararangiye" });
    }
};
exports.protect = protect;
//# sourceMappingURL=authMiddleware.js.map