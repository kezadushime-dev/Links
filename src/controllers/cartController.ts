/**
 * @swagger 
 * tags:
 * name: Cart
 * description: Cart management for users
 */
import { Response } from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { AuthRequest } from '../type'; 

/**
 * @swagger
 * /cart:
 * get:
 * summary: Get logged-in user's cart
 * tags: [Cart]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Cart items retrieved successfully
 * 401:
 * description: Unauthorized
 * 500:
 * description: Failed to retrieve cart
 */
export const getCart = async (req: AuthRequest, res: Response) => {
    try {
        const items = await Cart.find({ userId: req.user }).populate('productId');
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: "Ntibishoboye kuboneka" });
    }
};

/**
 * @swagger
 * /cart:
 * post:
 * summary: Add a product to cart
 * tags: [Cart]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - productId
 * properties:
 * productId:
 * type: string
 * example: 65a12f9e8c9b123456789012
 * quantity:
 * type: number
 * example: 2
 * responses:
 * 201:
 * description: Product added to cart
 * 400:
 * description: Invalid product ID
 * 404:
 * description: Product not found
 */
export const addToCart = async (req: AuthRequest, res: Response) => {
    try {
        const { productId, quantity } = req.body;
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: "ID y'igicuruzwa ntabwo yanditse neza" });
        }
        const productExists = await Product.findById(productId);
        if (!productExists) {
            return res.status(404).json({ error: "Iki gicuruzwa ntikiri mu iduka" });
        }
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
};

/**
 * @swagger
 * /cart/{id}:
 * delete:
 * summary: Remove an item from cart
 * tags: [Cart]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: Cart item ID
 * responses:
 * 200:
 * description: Item removed from cart
 * 400:
 * description: Invalid cart ID
 * 404:
 * description: Cart item not found
 */
export const removeFromCart = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID ya Cart ntabwo ari yo" });
        }
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
 * delete:
 * summary: Clear all items from user's cart
 * tags: [Cart]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Cart cleared successfully
 */
export const clearCart = async (req: AuthRequest, res: Response) => {
    try {
        await Cart.deleteMany({ userId: req.user });
        res.status(200).json({ message: "Isakoshi yawe yasibwe yose!" });
    } catch (error) {
        res.status(500).json({ error: "Gusiba byanze" });
    }
};