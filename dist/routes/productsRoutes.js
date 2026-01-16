"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware"); // <--- Ongeraho uyu murongo
const router = (0, express_1.Router)();
router.get('/', productController_1.getProducts);
router.post('/', authMiddleware_1.protect, (0, roleMiddleware_1.authorize)('Admin', 'Vendor'), productController_1.createProduct);
router.put('/:id', authMiddleware_1.protect, (0, roleMiddleware_1.authorize)('Admin', 'Vendor'), productController_1.updateProduct);
router.delete('/:id', authMiddleware_1.protect, (0, roleMiddleware_1.authorize)('Admin', 'Vendor'), productController_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=productsRoutes.js.map