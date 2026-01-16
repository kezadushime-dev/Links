"use strict";
/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management for users
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyOrders = exports.createOrder = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const Cart_1 = __importDefault(require("../models/Cart"));
/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order from user's cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order yawe yakiriwe!
 *                 order:
 *                   type: object
 *       400:
 *         description: Cart is empty
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const createOrder = async (req, res) => {
    try {
        // 1. Shaka ibintu uyu muntu afite muri Cart
        const cartItems = await Cart_1.default.find({ userId: req.user }).populate('productId');
        if (cartItems.length === 0) {
            return res.status(400).json({ error: "Isakoshi yawe ni ubusa" });
        }
        // 2. Bara Total Price kandi utegure amakuru ya Order
        let totalPrice = 0;
        const orderItems = cartItems.map((item) => {
            const price = item.productId.price;
            totalPrice += price * item.quantity;
            return {
                productId: item.productId._id,
                quantity: item.quantity,
                price: price
            };
        });
        // 3. Bika Order nshya
        const newOrder = new Order_1.default({
            userId: req.user,
            items: orderItems,
            totalPrice
        });
        await newOrder.save();
        // 4. SIBA Isakoshi kuko yamaze kugura (Task 3 integration)
        await Cart_1.default.deleteMany({ userId: req.user });
        res.status(201).json({ message: "Order yawe yakiriwe!", order: newOrder });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createOrder = createOrder;
/**
 * @swagger
 * /orders/my:
 *   get:
 *     summary: Get logged-in user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order_1.default.find({ userId: req.user }).populate('items.productId');
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: "Gushaka orders byanze" });
    }
};
exports.getMyOrders = getMyOrders;
//# sourceMappingURL=orderController.js.map