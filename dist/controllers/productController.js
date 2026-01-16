"use strict";
/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management (Admin, Vendor, Public access)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProducts = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Product_1 = __importDefault(require("../models/Product"));
const Categories_1 = __importDefault(require("../models/Categories"));
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
const getProducts = async (req, res) => {
    try {
        const products = await Product_1.default.find().populate('category', 'name');
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.getProducts = getProducts;
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
const createProduct = async (req, res) => {
    try {
        const { name, price, category, inStock } = req.body;
        // Genzura niba Category ID ari yo
        if (!category || !mongoose_1.default.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ error: "Category ID ntabwo yanditse neza" });
        }
        const categoryExists = await Categories_1.default.findById(category);
        if (!categoryExists) {
            return res.status(404).json({ error: "Iyi Category ntibaho muri database" });
        }
        // Kurema igicuruzwa no kukitaho nyiracyo (vendorId)
        const newProduct = new Product_1.default({
            name,
            price,
            category,
            inStock: inStock !== undefined ? inStock : true,
            vendorId: req.user // Iyi niyo ID y'umuntu ugi-creaye (Admin cyangwa Vendor)
        });
        await newProduct.save();
        res.status(201).json(newProduct);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createProduct = createProduct;
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
const updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product_1.default.findById(id);
        if (!product)
            return res.status(404).json({ error: "Iki gicuruzwa ntikiri muri Database" });
        // AMATEGEKO YA RBAC: 
        // Admin ahindura byose, ariko Vendor ahindura ibye gusa
        if (req.userRole === 'Vendor' && product.vendorId?.toString() !== req.user) {
            return res.status(403).json({ error: "Wemerewe guhindura ibyo waremye wenyine!" });
        }
        const updated = await Product_1.default.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updated);
    }
    catch (error) {
        res.status(400).json({ error: "Guhindura byanze" });
    }
};
exports.updateProduct = updateProduct;
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
const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product_1.default.findById(id);
        if (!product)
            return res.status(404).json({ error: "Ntabwo kibonetse" });
        // AMATEGEKO YA RBAC:
        // Niba ari Vendor, agomba kuba ari we wayiremye (Ownership check)
        if (req.userRole === 'Vendor' && product.vendorId?.toString() !== req.user) {
            return res.status(403).json({ error: "Ntushobora gusiba igicuruzwa utaremye!" });
        }
        await Product_1.default.findByIdAndDelete(id);
        res.json({ message: "Byasibwe neza" });
    }
    catch (error) {
        res.status(400).json({ error: "Gusiba byanze" });
    }
};
exports.deleteProduct = deleteProduct;
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
const deleteAllProducts = async (req, res) => {
    try {
        // Hano nta kureba Ownership kuko Admin asiba byose
        await Product_1.default.deleteMany({});
        res.status(200).json({ message: "Ibicuruzwa byose byasibwe!" });
    }
    catch (error) {
        res.status(500).json({ error: "Gusiba byanze" });
    }
};
exports.deleteAllProducts = deleteAllProducts;
//# sourceMappingURL=productController.js.map