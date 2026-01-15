/**
 * @swagger 
 * tags:
 *   name: Cart
 *   description: Cart management for users
 */
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart';
import Product from '../models/Product';

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


// 1. GET CART - Reba isakoshi y'umuntu winjiye gusa
export const getCart = async (req: any, res: Response) => {
    try {
        // Shaka ibintu muri Cart bifite userId ihura n'iyo muri Token
        const items = await Cart.find({ userId: req.user }).populate('productId');
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: "Ntibishoboye kuboneka" });
    }
};
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

// 2. ADD TO CART - Shyira igicuruzwa mu isakoshi yawe
export const addToCart = async (req: any, res: Response) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: "ID y'igicuruzwa ntabwo yanditse neza" });
        }

        const productExists = await Product.findById(productId);
        if (!productExists) {
            return res.status(404).json({ error: "Iki gicuruzwa ntikiri mu iduka" });
        }

        // Hano twongeraho 'userId' ikurwa muri Token (req.user)
        const newItem = new Cart({ 
            productId, 
            quantity: quantity || 1,
            userId: req.user 
        });

        await newItem.save();
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};/**
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


// 3. REMOVE FROM CART - Siba ikintu mu isakoshi yawe gusa
export const removeFromCart = async (req: any, res: Response) => {
    try {
        const id = req.params.id as string;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID ya Cart ntabwo ari yo" });
        }

        // Genzura ko usiba ari nyir'isakoshi (userId ihure n'iya req.user)
        const deleted = await Cart.findOneAndDelete({ _id: id, userId: req.user });
        
        if (!deleted) {
            return res.status(404).json({ error: "Icyo kintu ntikiri mu isakoshi yawe" });
        }

        res.status(200).json({ message: "Byakuwemo" });
    } catch (error: any) {
        res.status(400).json({ error: "Gusiba byanze" });
    }
};
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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to clear cart
 */


// 4. CLEAR CART - Siba isakoshi yawe yose
export const clearCart = async (req: any, res: Response) => {
    try {
        // Siba gusa ibintu bifite userId yawe
        await Cart.deleteMany({ userId: req.user });
        res.status(200).json({ message: "Isakoshi yawe yasibwe yose!" });
    } catch (error) {
        res.status(500).json({ error: "Gusiba byanze" });
    }
};