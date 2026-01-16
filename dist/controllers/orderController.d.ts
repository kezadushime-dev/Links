/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management for users
 */
import { Response } from 'express';
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
export declare const createOrder: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
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
export declare const getMyOrders: (req: any, res: Response) => Promise<void>;
//# sourceMappingURL=orderController.d.ts.map