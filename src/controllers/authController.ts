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

const JWT_SECRET = process.env.JWT_SECRET || 'ijambo_ryihariye_321';

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
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
 *                 enum: [Customer, Admin]
 *                 example: Customer
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request - Email already in use or missing fields
 *       500:
 *         description: Server error
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: "Missing required fields: username, email, password" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ 
        error: "Password must be at least 8 characters long" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'Customer'
    });

    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return res.status(500).json({ 
      error: error.message || "Internal server error" 
    });
  }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user and generate JWT token
 *     tags: [Auth]
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
 *       400:
 *         description: Bad request - Missing email or password
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: "Missing required fields: email, password" 
      });
    }

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

    // Generate JWT token with role for RBAC
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({ 
      error: error.message || "Internal server error" 
    });
  }
};

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
export const getProfile = async (req: any, res: Response) => {
  try {
    // Verify req.user exists (attached by authMiddleware)
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized - No token provided" });
    }

    // Find user and exclude password
    const user = await User.findById(req.user).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      message: "Profile retrieved successfully",
      user
    });
  } catch (error: any) {
    console.error("Get profile error:", error);
    return res.status(500).json({ 
      error: error.message || "Internal server error" 
    });
  }
};

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Change logged-in user password
 *     tags: [Auth]
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
 *       400:
 *         description: Bad request - Missing fields or invalid password
 *       401:
 *         description: Unauthorized or incorrect current password
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
export const changePassword = async (req: any, res: Response) => {
  try {
    // Verify authentication
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized - No token provided" });
    }

    const { oldPassword, newPassword } = req.body;

    // Validate required fields
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        error: "Missing required fields: oldPassword, newPassword" 
      });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: "New password must be at least 8 characters long" 
      });
    }

    // Check if old and new passwords are the same
    if (oldPassword === newPassword) {
      return res.status(400).json({ 
        error: "New password must be different from old password" 
      });
    }

    // Find user
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        error: "Current password is incorrect" 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ 
      message: "Password updated successfully" 
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    return res.status(500).json({ 
      error: error.message || "Internal server error" 
    });
  }
};

// ...existing code...

/**
 * @swagger
 * /auth/test-user:
 *   post:
 *     summary: Create a test user for development (auto login)
 *     tags: [Auth]
 *     responses:
 *       201:
 *         description: Test user created successfully with credentials
 *       400:
 *         description: Test user already exists
 *       500:
 *         description: Server error
 */
export const createTestUser = async (req: Request, res: Response) => {
  try {
    const testEmail = "test@gmail.com";
    const testPassword = "Password123!";

    // Check if test user exists
    const existingUser = await User.findOne({ email: testEmail });
    if (existingUser) {
      return res.status(200).json({ 
        message: "Test user already exists",
        credentials: {
          email: testEmail,
          password: testPassword
        }
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testPassword, salt);

    // Create test user
    const testUser = new User({
      username: "test_user",
      email: testEmail,
      password: hashedPassword,
      role: "Customer"
    });

    await testUser.save();

    console.log("✅ Test user created:", testEmail);

    return res.status(201).json({
      message: "Test user created successfully",
      credentials: {
        email: testEmail,
        password: testPassword
      },
      user: {
        id: testUser._id,
        username: testUser.username,
        email: testUser.email,
        role: testUser.role
      }
    });
  } catch (error: any) {
    console.error("Create test user error:", error);
    return res.status(500).json({ 
      error: error.message || "Internal server error" 
    });
  }
};