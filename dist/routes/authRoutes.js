"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
// Izi routes zisaba ko uba winjiye (Logged in)
router.get('/profile', authMiddleware_1.protect, authController_1.getProfile);
router.put('/change-password', authMiddleware_1.protect, authController_1.changePassword);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map