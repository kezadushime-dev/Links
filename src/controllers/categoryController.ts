/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management for products  
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Category from '../models/Categories';
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


export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
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

export const createCategory = async (req: Request, res: Response) => {
    try {
        const newCat = new Category(req.body);
        await newCat.save();
        res.status(201).json(newCat);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
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

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Category ID ntabwo ari yo" });
        }
        
        const deleted = await Category.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ error: "Category ntayo twabonye" });
        
        res.json({ message: "Category deleted" });
    } catch (error) {
        res.status(500).json({ error: "Gusiba byanze" });
    }
};
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

export const deleteAllCategories = async (req: Request, res: Response) => {
    try {
        await Category.deleteMany({});
        res.status(200).json({ message: "Categories zose zasibwe!" });
    } catch (error) {
        res.status(500).json({ error: "Gusiba byanze" });
    }
};