/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and profile management   
 */
import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || "ijambo_ryihariye_321";
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: keza_kevin
 *               email:
 *                 type: string
 *                 example: kevin@gmail.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *               role:
 *                 type: string
 *                 example: Customer
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Email already in use
 */
export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        // Create new user (Role defaults to 'Customer' if not provided)
        const newUser = new User({ 
            username, 
            email, 
            password, 
            role: role || 'Customer' 
        });

        await newUser.save();
        
        res.status(201).json({ 
            message: "User registered successfully!", 
            user: { 
                id: newUser._id, 
                username: newUser.username, 
                email: newUser.email,
                role: newUser.role 
            } 
        });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user and generate JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: kevin@gmail.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // TASK 4: Include role in the JWT payload for RBAC
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({ 
            message: "Login successful",
            token, 
            user: { 
                id: user._id, 
                username: user.username, 
                role: user.role 
            } 
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};
/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */

export const getProfile = async (req: any, res: Response) => {
    try {
        // req.user is attached by the authMiddleware
        const user = await User.findById(req.user).select('-password');
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Change logged-in user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: OldPassword123!
 *               newPassword:
 *                 type: string
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Current password is incorrect
 *       404:
 *         description: User not found
 */

export const changePassword = async (req: any, res: Response) => {
    try {
        const { oldPassword, newPassword } = req.body;
        
        const user = await User.findById(req.user);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Verify the old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Current password is incorrect" });
        }

        // Update to new password
        user.password = newPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};