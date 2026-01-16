/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management (Admin, Vendor, Public access)
 */
import { Response } from 'express';
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products (public)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       500:
 *         description: Server error
 */
export declare const getProducts: (req: any, res: Response) => Promise<void>;
/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product (Admin or Vendor)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 example: iPhone 15
 *               price:
 *                 type: number
 *                 example: 1200
 *               category:
 *                 type: string
 *                 example: 65a12f9e8c9b123456789012
 *               inStock:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export declare const createProduct: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product (Admin or owning Vendor)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Update failed
 *       403:
 *         description: Forbidden – not product owner
 *       404:
 *         description: Product not found
 */
export declare const updateProduct: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product (Admin or owning Vendor)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       403:
 *         description: Forbidden – not product owner
 *       404:
 *         description: Product not found
 */
export declare const deleteProduct: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /products:
 *   delete:
 *     summary: Delete all products (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All products deleted successfully
 *       403:
 *         description: Forbidden – Admin only
 *       500:
 *         description: Server error
 */
export declare const deleteAllProducts: (req: any, res: Response) => Promise<void>;
//# sourceMappingURL=productController.d.ts.map