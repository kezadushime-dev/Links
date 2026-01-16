"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware"); // <--- Ibi nibyo byari bibuze!
const router = (0, express_1.Router)();
// 1. PUBLIC: Umuntu wese ashobora kureba categories
router.get('/', categoryController_1.getCategories);
// 2. ADMIN ONLY: Mwarimu yavuze ko Admin ari we ucunga Categories gusa
// Twongeyeho authorize('Admin') kuko Vendor na Customer batabyemerewe
router.post('/', authMiddleware_1.protect, (0, roleMiddleware_1.authorize)('Admin'), categoryController_1.createCategory);
router.delete('/:id', authMiddleware_1.protect, (0, roleMiddleware_1.authorize)('Admin'), categoryController_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=categoryRoutes.js.map