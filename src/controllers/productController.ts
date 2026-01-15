/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management (Admin, Vendor, Public access)
 */

import { Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product';
import Category from '../models/Categories';
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

// 1. GET ALL PRODUCTS - Umuntu wese arabibona (Public)
export const getProducts = async (req: any, res: Response) => {
    try {
        const products = await Product.find().populate('category', 'name');
        res.json(products);
    } catch (error: any) {
        res.status(500).json({ error: "Server error" });
    }
};
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

// 2. CREATE PRODUCT - Admin cyangwa Vendor
export const createProduct = async (req: any, res: Response) => {
    try {
        const { name, price, category, inStock } = req.body;

        // Genzura niba Category ID ari yo
        if (!category || !mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ error: "Category ID ntabwo yanditse neza" });
        }

        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({ error: "Iyi Category ntibaho muri database" });
        }

        // Kurema igicuruzwa no kukitaho nyiracyo (vendorId)
        const newProduct = new Product({ 
            name, 
            price, 
            category, 
            inStock: inStock !== undefined ? inStock : true,
            vendorId: req.user // Iyi niyo ID y'umuntu ugi-creaye (Admin cyangwa Vendor)
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
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

// 3. UPDATE PRODUCT - Admin (yose) cyangwa Vendor (ibye gusa)
export const updateProduct = async (req: any, res: Response) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id);

        if (!product) return res.status(404).json({ error: "Iki gicuruzwa ntikiri muri Database" });

        // AMATEGEKO YA RBAC: 
        // Admin ahindura byose, ariko Vendor ahindura ibye gusa
        if (req.userRole === 'Vendor' && product.vendorId?.toString() !== req.user) {
            return res.status(403).json({ error: "Wemerewe guhindura ibyo waremye wenyine!" });
        }

        const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updated);
    } catch (error: any) {
        res.status(400).json({ error: "Guhindura byanze" });
    }
};
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

// 4. DELETE SINGLE PRODUCT - Admin (yose) cyangwa Vendor (ibye gusa)
export const deleteProduct = async (req: any, res: Response) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id);

        if (!product) return res.status(404).json({ error: "Ntabwo kibonetse" });

        // AMATEGEKO YA RBAC:
        // Niba ari Vendor, agomba kuba ari we wayiremye (Ownership check)
        if (req.userRole === 'Vendor' && product.vendorId?.toString() !== req.user) {
            return res.status(403).json({ error: "Ntushobora gusiba igicuruzwa utaremye!" });
        }

        await Product.findByIdAndDelete(id);
        res.json({ message: "Byasibwe neza" });
    } catch (error: any) {
        res.status(400).json({ error: "Gusiba byanze" });
    }
};
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

// 5. DELETE ALL PRODUCTS - Admin Gusa
export const deleteAllProducts = async (req: any, res: Response) => {
    try {
        // Hano nta kureba Ownership kuko Admin asiba byose
        await Product.deleteMany({});
        res.status(200).json({ message: "Ibicuruzwa byose byasibwe!" });
    } catch (error) {
        res.status(500).json({ error: "Gusiba byanze" });
    }
};