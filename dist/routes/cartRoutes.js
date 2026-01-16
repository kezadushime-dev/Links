"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cartController_1 = require("../controllers/cartController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// ZOSE zirinzwe na 'protect' kuko isakoshi ni iy'umuntu winjiye gusa
router.get('/', authMiddleware_1.protect, cartController_1.getCart); // Reba isakoshi yawe
router.post('/', authMiddleware_1.protect, cartController_1.addToCart); // Ongeramo igicuruzwa
router.delete('/:id', authMiddleware_1.protect, cartController_1.removeFromCart); // Siba ikintu kimwe
router.delete('/clear/all', authMiddleware_1.protect, cartController_1.clearCart); // Siba isakoshi yose
exports.default = router;
//# sourceMappingURL=cartRoutes.js.map