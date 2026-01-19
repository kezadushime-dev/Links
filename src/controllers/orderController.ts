/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management for users and admins
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Cart from '../models/Cart';

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order from user's cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Cart is empty or invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const createOrder = async (req: any, res: Response) => {
  try {
    const userId = req.user;

    // Validate user exists
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - No user ID" });
    }

    // 1. Get cart items for user
    const cartItems = await Cart.find({ userId }).populate('productId');

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty - cannot create order" });
    }

    // 2. Calculate total price and prepare order items
    let totalAmount = 0;
    const orderItems = cartItems.map((item: any) => {
      const price = item.productId.price;
      totalAmount += price * item.quantity;
      return {
        productId: item.productId._id,
        quantity: item.quantity,
        price: price
      };
    });

    // 3. Create new order
    const newOrder = new Order({
      userId,
      items: orderItems,
      totalAmount,
      status: 'pending'
    });

    await newOrder.save();

    // 4. Clear cart after order creation
    await Cart.deleteMany({ userId });

    // 5. Populate and return order
    const populatedOrder = await Order.findById(newOrder._id)
      .populate('items.productId', 'name price')
      .populate('userId', 'username email');

    return res.status(201).json({
      message: "Order created successfully",
      order: populatedOrder
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
};

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders for logged-in user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, shipped, delivered, cancelled]
 *         description: Filter by order status
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getMyOrders = async (req: any, res: Response) => {
  try {
    const userId = req.user;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - No user ID" });
    }

    const { status } = req.query;
    const filter: any = { userId };

    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('items.productId', 'name price description')
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Your orders retrieved successfully",
      count: orders.length,
      orders
    });
  } catch (error: any) {
    console.error("Get my orders error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
};

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID (own order only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       400:
 *         description: Invalid order ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not your order
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
export const getOrderById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user;

    // Validate order ID
    if (!id) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ error: "Invalid order ID format" });
    }

    const order = await Order.findById(id)
      .populate('items.productId', 'name price description')
      .populate('userId', 'username email');

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if user is owner of order or admin
    if (order.userId._id.toString() !== userId && req.userRole !== 'Admin') {
      return res.status(403).json({
        error: "Forbidden - You can only view your own orders"
      });
    }

    return res.status(200).json({
      message: "Order retrieved successfully",
      order
    });
  } catch (error: any) {
    console.error("Get order by ID error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
};

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel order (only if status is pending)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Invalid order ID or cannot cancel non-pending order
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not your order
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
export const cancelOrder = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user;

    // Validate order ID
    if (!id) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ error: "Invalid order ID format" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if user is owner of order
    if (order.userId.toString() !== userId) {
      return res.status(403).json({
        error: "Forbidden - You can only cancel your own orders"
      });
    }

    // Check if order is pending
    if (order.status !== 'pending') {
      return res.status(400).json({
        error: `Cannot cancel order with status '${order.status}'. Only pending orders can be cancelled.`
      });
    }

    // Update order status to cancelled
    order.status = 'cancelled';
    await order.save();

    const updatedOrder = await Order.findById(id)
      .populate('items.productId', 'name price')
      .populate('userId', 'username email');

    return res.status(200).json({
      message: "Order cancelled successfully",
      order: updatedOrder
    });
  } catch (error: any) {
    console.error("Cancel order error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
};

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, shipped, delivered, cancelled]
 *         description: Filter by order status
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       500:
 *         description: Server error
 */
export const getAllOrders = async (req: any, res: Response) => {
  try {
    // Check if user is Admin
    if (req.userRole !== 'Admin') {
      return res.status(403).json({
        error: "Forbidden - Only admins can view all orders"
      });
    }

    const { status, userId } = req.query;
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId as string)) {
        return res.status(400).json({ error: "Invalid user ID format" });
      }
      filter.userId = userId;
    }

    const orders = await Order.find(filter)
      .populate('items.productId', 'name price')
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Orders retrieved successfully",
      count: orders.length,
      orders
    });
  } catch (error: any) {
    console.error("Get all orders error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
};

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   patch:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, shipped, delivered, cancelled]
 *                 example: "shipped"
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
export const updateOrderStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if user is Admin
    if (req.userRole !== 'Admin') {
      return res.status(403).json({
        error: "Forbidden - Only admins can update order status"
      });
    }

    // Validate order ID
    if (!id) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ error: "Invalid order ID format" });
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('items.productId', 'name price')
      .populate('userId', 'username email');

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.status(200).json({
      message: "Order status updated successfully",
      order
    });
  } catch (error: any) {
    console.error("Update order status error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
};