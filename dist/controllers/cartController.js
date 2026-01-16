"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.addToCart = exports.getCart = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Cart_1 = __importDefault(require("../models/Cart"));
/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get logged-in user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart items retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to retrieve cart
 */
const getCart = async (req, res) => {
    try {
        const items = await Cart_1.default.find({ userId: req.user }).populate('productId');
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: "Ntibishoboye kuboneka" });
    }
};
exports.getCart = getCart;
/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add a product to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 65a12f9e8c9b123456789012
 *               quantity:
 *                 type: number
 *                 example: 2
 *     responses:
 *       201:
 *         description: Product added to cart
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 */
const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        if (!productId || !mongoose_1.default.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: "ID y'igicuruzwa ntabwo yanditse neza" });
        }
        const id = Array.isArray(productId) ? productId[0] : productId;
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID y'igicuruzwa ntabwo yanditse neza" });
        }
        const newItem = new Cart_1.default({
            productId,
            quantity: quantity || 1,
            userId: req.user
        });
        await newItem.save();
        res.status(201).json(newItem);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.addToCart = addToCart;
/**
 * @swagger
 * /cart/{id}:
 *   delete:
 *     summary: Remove an item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Item removed from cart
 *       400:
 *         description: Invalid cart ID
 *       404:
 *         description: Cart item not found
 */
const removeFromCart = async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID ya Cart ntabwo ari yo" });
        }
        const deleted = await Cart_1.default.findOneAndDelete({ _id: id, userId: req.user });
        if (!deleted) {
            return res.status(404).json({ error: "Icyo kintu ntikiri mu isakoshi yawe" });
        }
        res.status(200).json({ message: "Byakuwemo" });
    }
    catch (error) {
        res.status(400).json({ error: "Gusiba byanze" });
    }
};
exports.removeFromCart = removeFromCart;
/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     summary: Clear all items from user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 */
const clearCart = async (req, res) => {
    try {
        await Cart_1.default.deleteMany({ userId: req.user });
        res.status(200).json({ message: "Isakoshi yawe yasibwe yose!" });
    }
    catch (error) {
        res.status(500).json({ error: "Gusiba byanze" });
    }
};
exports.clearCart = clearCart;
//# sourceMappingURL=cartController.js.map