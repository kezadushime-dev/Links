/**
 * @swagger
 * tags:
 *   - name: Product
 *     description: Product management
 */
import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import Product, { IProduct } from '../models/Product';

const ProductModel = Product as Model<IProduct>;

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Product]
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
 *                 example: "Laptop"
 *               description:
 *                 type: string
 *                 example: "High performance laptop"
 *               price:
 *                 type: number
 *                 example: 1200
 *               category:
 *                 type: string
 *                 description: "Valid MongoDB ObjectId"
 *                 example: "696dc79c288a7dee75fea400"
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
 *       500:
 *         description: Server error
 */
export const createProduct = async (req: any, res: Response) => {
  try {
    const { name, price, category, description, inStock } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({
        error: "Missing required fields: name, price, category"
      });
    }

    // Validate category is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(category as string)) {
      return res.status(400).json({
        error: "Invalid category ID format. Category must be a valid MongoDB ObjectId"
      });
    }

    // Validate price
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({
        error: "Price must be a positive number"
      });
    }

    // Create product with vendorId from authenticated user
    const product = new ProductModel({
      name,
      description: description || "",
      price,
      category,
      vendorId: req.user,
      inStock: inStock !== undefined ? inStock : true
    });

    await product.save();

    return res.status(201).json({
      message: "Product created successfully",
      product
    });
  } catch (error: any) {
    console.error("Create product error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
};

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with optional filtering
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *         description: Filter by stock status
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       500:
 *         description: Server error
 */
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { category, inStock } = req.query;

    // Build filter object
    const filter: any = {};
    if (category) filter.category = category;
    if (inStock !== undefined) filter.inStock = inStock === 'true';

    const products = await ProductModel.find(filter)
      .populate('category', 'name')
      .populate('vendorId', 'username email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Products retrieved successfully",
      count: products.length,
      products
    });
  } catch (error: any) {
    console.error("Get all products error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
};

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a single product by ID
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
 *       500:
 *         description: Server error
 */
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if id exists
    if (!id) {
      return res.status(400).json({
        error: "Product ID is required"
      });
    }

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        error: "Invalid product ID format"
      });
    }

    const product = await ProductModel.findById(id)
      .populate('category', 'name')
      .populate('vendorId', 'username email');

    if (!product) {
      return res.status(404).json({
        error: "Product not found"
      });
    }

    return res.status(200).json({
      message: "Product retrieved successfully",
      product
    });
  } catch (error: any) {
    console.error("Get product error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
};

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Product]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
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
 *       500:
 *         description: Server error
 */
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if id exists
    if (!id) {
      return res.status(400).json({
        error: "Product ID is required"
      });
    }

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        error: "Invalid product ID format"
      });
    }

    // Validate category if provided
    if (req.body.category && !mongoose.Types.ObjectId.isValid(req.body.category as string)) {
      return res.status(400).json({
        error: "Invalid category ID format. Category must be a valid MongoDB ObjectId"
      });
    }

    // Validate price if provided
    if (req.body.price !== undefined) {
      if (typeof req.body.price !== 'number' || req.body.price <= 0) {
        return res.status(400).json({
          error: "Price must be a positive number"
        });
      }
    }

    const product = await ProductModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('category', 'name')
      .populate('vendorId', 'username email');

    if (!product) {
      return res.status(404).json({
        error: "Product not found"
      });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product
    });
  } catch (error: any) {
    console.error("Update product error:", error);
    return res.status(400).json({
      error: error.message || "Invalid input"
    });
  }
};

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a single product
 *     tags: [Product]
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
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if id exists
    if (!id) {
      return res.status(400).json({
        error: "Product ID is required"
      });
    }

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        error: "Invalid product ID format"
      });
    }

    const product = await ProductModel.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found"
      });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
      product
    });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
};

/**
 * @swagger
 * /products:
 *   delete:
 *     summary: Delete all products (Admin only)
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All products deleted successfully
 *       403:
 *         description: Forbidden - Admin only
 *       500:
 *         description: Server error
 */
export const deleteAllProducts = async (req: any, res: Response) => {
  try {
    // Check if user is Admin
    if (req.userRole !== 'Admin') {
      return res.status(403).json({
        error: "Forbidden - Only admins can delete all products"
      });
    }

    const result = await ProductModel.deleteMany({});

    return res.status(200).json({
      message: "All products deleted successfully",
      deletedCount: result.deletedCount
    });
  } catch (error: any) {
    console.error("Delete all products error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
};