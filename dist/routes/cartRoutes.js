"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cartController_1 = require("../controllers/cartController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.protect, cartController_1.getCart);
router.post('/', authMiddleware_1.protect, cartController_1.addToCart);
// Changed from '/clear/all' to '/clear' to match your Swagger @swagger /cart/clear
router.delete('/clear', authMiddleware_1.protect, cartController_1.clearCart);
router.delete('/:id', authMiddleware_1.protect, cartController_1.removeFromCart);
exports.default = router;
//# sourceMappingURL=cartRoutes.js.map