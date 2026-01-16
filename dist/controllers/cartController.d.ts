/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart management for users
 */
import { Response } from 'express';
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
export declare const getCart: (req: any, res: Response) => Promise<void>;
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
export declare const addToCart: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>; /**
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
export declare const removeFromCart: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
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
export declare const clearCart: (req: any, res: Response) => Promise<void>;
//# sourceMappingURL=cartController.d.ts.map