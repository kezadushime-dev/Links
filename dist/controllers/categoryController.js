"use strict";
/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management for products
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllCategories = exports.deleteCategory = exports.createCategory = exports.getCategories = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Categories_1 = __importDefault(require("../models/Categories"));
/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       500:
 *         description: Server error
 */
const getCategories = async (req, res) => {
    try {
        const categories = await Categories_1.default.find();
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.getCategories = getCategories;
/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Electronics
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Invalid input
 */
const createCategory = async (req, res) => {
    try {
        const newCat = new Categories_1.default(req.body);
        await newCat.save();
        res.status(201).json(newCat);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createCategory = createCategory;
/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Invalid category ID
 *       404:
 *         description: Category not found
 *       500:
 *         description: Failed to delete category
 */
const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Category ID ntabwo ari yo" });
        }
        const deleted = await Categories_1.default.findByIdAndDelete(id);
        if (!deleted)
            return res.status(404).json({ error: "Category ntayo twabonye" });
        res.json({ message: "Category deleted" });
    }
    catch (error) {
        res.status(500).json({ error: "Gusiba byanze" });
    }
};
exports.deleteCategory = deleteCategory;
/**
 * @swagger
 * /categories:
 *   delete:
 *     summary: Delete all categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All categories deleted successfully
 *       500:
 *         description: Failed to delete categories
 */
const deleteAllCategories = async (req, res) => {
    try {
        await Categories_1.default.deleteMany({});
        res.status(200).json({ message: "Categories zose zasibwe!" });
    }
    catch (error) {
        res.status(500).json({ error: "Gusiba byanze" });
    }
};
exports.deleteAllCategories = deleteAllCategories;
//# sourceMappingURL=categoryController.js.map