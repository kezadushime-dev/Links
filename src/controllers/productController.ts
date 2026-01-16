/**
 * @swagger
 * tags:
 * name: Products
 * description: Product management (Admin, Vendor, Public access)
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product';
import Category from '../models/Categories';

interface AuthRequest extends Request {
  user?: any;
  userRole?: string;
}

/**
 * @swagger
 * /products:
 * get:
 * summary: Get all products (public)
 * tags: [Products]
 * responses:
 * 200:
 * description: Products retrieved successfully
 * 500:
 * description: Server error
 */
export const getProducts = async (req: Request, res: Response) => {
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
 * post:
 * summary: Create a new product (Admin or Vendor)
 * tags: [Products]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - name
 * - price
 * - category
 * properties:
 * name:
 * type: string
 * example: iPhone 15
 * price:
 * type: number
 * example: 1200
 * category:
 * type: string
 * example: 65a12f9e8c9b123456789012
 * inStock:
 * type: boolean
 * example: true
 * responses:
 * 201:
 * description: Product created successfully
 * 400:
 * description: Invalid input
 */
export const createProduct = async (req: AuthRequest, res: Response) => {
    try {
        const { name, price, category, inStock } = req.body;
        if (!category || !mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ error: "Category ID ntabwo yanditse neza" });
        }
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({ error: "Iyi Category ntibaho muri database" });
        }
        const newProduct = new Product({ 
            name, 
            price, 
            category, 
            inStock: inStock !== undefined ? inStock : true,
            vendorId: req.user 
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
 * put:
 * summary: Update a product (Admin or owning Vendor)
 * tags: [Products]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: Product ID
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * responses:
 * 200:
 * description: Product updated successfully
 * 400:
 * description: Update failed
 * 403:
 * description: Forbidden – not product owner
 */
export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Iki gicuruzwa ntikiri muri Database" });
    }
    if (req.userRole === 'Vendor' && product.vendorId?.toString() !== req.user) {
      return res.status(403).json({ error: "Wemerewe guhindura ibyo waremye wenyine!" });
    }
    const updated = await Product.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: "Guhindura byanze" });
  }
};

/**
 * @swagger
 * /products/{id}:
 * delete:
 * summary: Delete a product (Admin or owning Vendor)
 * tags: [Products]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: Product ID
 * responses:
 * 200:
 * description: Product deleted successfully
 * 403:
 * description: Forbidden – not product owner
 */
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Ntabwo kibonetse" });
    }
    if (req.userRole === 'Vendor' && product.vendorId?.toString() !== req.user) {
      return res.status(403).json({ error: "Ntushobora gusiba igicuruzwa utaremye!" });
    }
    await Product.findByIdAndDelete(id);
    res.json({ message: "Byasibwe neza" });
  } catch (error) {
    res.status(400).json({ error: "Gusiba byanze" });
  }
};

/**
 * @swagger
 * /products:
 * delete:
 * summary: Delete all products (Admin only)
 * tags: [Products]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: All products deleted successfully
 */
export const deleteAllProducts = async (req: AuthRequest, res: Response) => {
  try {
    await Product.deleteMany({});
    res.status(200).json({ message: "Ibicuruzwa byose byasibwe!" });
  } catch (error) {
    res.status(500).json({ error: "Gusiba byanze" });
  }
};