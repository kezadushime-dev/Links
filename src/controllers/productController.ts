/**
 * @swagger
 * tags:
 *   - name: Product
 *     description: Product management
 */
import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import Product, { IProduct } from '../models/Product';

const ProductModel = Product as Model<IProduct>; // TS-safe

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: List of products
 *       500:
 *         description: Failed to retrieve products
 */
export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await ProductModel.find({});
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: "Ntibishoboye kuboneka" });
    }
};
/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 */
export const getProductById = async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID y'igicuruzwa ntabwo ari yo" });
    }

    try {
        const product = await ProductModel.findById(id);
        if (!product) return res.status(404).json({ error: "Iki gicuruzwa ntikiriho" });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: "Ntibishoboye kuboneka" });
    }
};
/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Laptop"
 *               description:
 *                 type: string
 *                 example: "High performance laptop"
 *               price:
 *                 type: number
 *                 example: 1200
 *               inStock:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid input
 */
export const createProduct = async (req: Request, res: Response) => {
    try {
        const product = new ProductModel(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};


/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Product]
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
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 */
export const deleteProduct = async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID y'igicuruzwa ntabwo ari yo" });
    }

    try {
        const product = await ProductModel.findByIdAndDelete(id);
        if (!product) return res.status(404).json({ error: "Iki gicuruzwa ntikiriho" });
        res.status(200).json({ message: "Byasibwe neza" });
    } catch (error) {
        res.status(500).json({ error: "Gusiba byanze" });
    }
};
/**
 * @swagger
 * /products:
 *   delete:
 *     summary: Delete all products (Admin only)
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []   # if you use JWT auth
 *     responses:
 *       200:
 *         description: All products deleted successfully
 *       500:
 *         description: Failed to delete products
 */


// Delete all products (Admin only)
export const deleteAllProducts = async (req: Request, res: Response) => {
    try {
        await ProductModel.deleteMany({});
        res.status(200).json({ message: "Byose byasibwe neza" });
    } catch (error) {
        res.status(500).json({ error: "Gusiba byanze" });
    }
};
/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []   # if you use JWT auth
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               inStock:
 *                 type: boolean
 *             example:
 *               name: "Updated Laptop"
 *               description: "Updated description"
 *               price: 1300
 *               inStock: false
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Product not found
 */

export const updateProduct = async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID y'igicuruzwa ntabwo ari yo" });
    }

    try {
        const product = await ProductModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!product) return res.status(404).json({ error: "Iki gicuruzwa ntikiriho" });
        res.status(200).json(product);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};