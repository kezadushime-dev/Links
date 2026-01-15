/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management for users
 */

import { Response } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';
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


export const createOrder = async (req: any, res: Response) => {
    try {
        // 1. Shaka ibintu uyu muntu afite muri Cart
        const cartItems = await Cart.find({ userId: req.user }).populate('productId');
        
        if (cartItems.length === 0) {
            return res.status(400).json({ error: "Isakoshi yawe ni ubusa" });
        }

        // 2. Bara Total Price kandi utegure amakuru ya Order
        let totalPrice = 0;
        const orderItems = cartItems.map((item: any) => {
            const price = item.productId.price;
            totalPrice += price * item.quantity;
            return {
                productId: item.productId._id,
                quantity: item.quantity,
                price: price
            };
        });

 // 3. Bika Order nshya
        const newOrder = new Order({
            userId: req.user,
            items: orderItems,
            totalPrice
        });
        await newOrder.save();

        // 4. SIBA Isakoshi kuko yamaze kugura (Task 3 integration)
        await Cart.deleteMany({ userId: req.user });

        res.status(201).json({ message: "Order yawe yakiriwe!", order: newOrder });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
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

export const getMyOrders = async (req: any, res: Response) => {
    try {
        const orders = await Order.find({ userId: req.user }).populate('items.productId');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Gushaka orders byanze" });
    }
};