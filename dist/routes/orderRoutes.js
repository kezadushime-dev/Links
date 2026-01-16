"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.protect, orderController_1.createOrder); // Gukora commande
router.get('/', authMiddleware_1.protect, orderController_1.getMyOrders); // Reba commande zawe
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map