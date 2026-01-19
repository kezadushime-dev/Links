/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management for customers and admins
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order from user's cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shippingAddress:
 *                 type: string
 *                 example: "123 Main St, New York, NY 10001"
 *               paymentMethod:
 *                 type: string
 *                 example: "Credit Card"
 *               notes:
 *                 type: string
 *                 example: "Please deliver after 5 PM"
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
    const { shippingAddress, paymentMethod, notes } = req.body;

    // Validate user exists
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - No user ID provided",
        code: "NO_USER_ID"
      });
    }

    // Get cart items for user
    const cartItems = await Cart.find({ userId }).populate('productId');

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cart is empty - cannot create order",
        code: "EMPTY_CART",
        message: "Please add items to your cart before placing an order"
      });
    }

    // Calculate total and prepare order items
    let totalAmount = 0;
    const orderItems = cartItems.map((item: any) => {
      const price = item.productId.price;
      const subtotal = price * item.quantity;
      totalAmount += subtotal;

      return {
        productId: item.productId._id,
        productName: item.productId.name,
        quantity: item.quantity,
        price: price,
        subtotal: subtotal
      };
    });

    // Create new order
    const newOrder = new Order({
      userId,
      items: orderItems,
      totalAmount,
      status: 'pending',
      shippingAddress: shippingAddress || null,
      paymentMethod: paymentMethod || null,
      notes: notes || null
    });

    await newOrder.save();

    // Clear cart after successful order creation
    await Cart.deleteMany({ userId });

    // Populate order with user and product details
    const populatedOrder = await Order.findById(newOrder._id)
      .populate('userId', 'username email phoneNumber')
      .populate('items.productId', 'name price image');

    return res.status(201).json({
      success: true,
      message: "Order created successfully! Your order is pending confirmation.",
      code: "ORDER_CREATED",
      order: {
        _id: populatedOrder._id,
        orderNumber: populatedOrder.orderNumber,
        status: populatedOrder.status,
        totalAmount: populatedOrder.totalAmount,
        itemCount: populatedOrder.items.length,
        createdAt: populatedOrder.createdAt,
        items: populatedOrder.items
      }
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create order",
      code: "ORDER_CREATION_FAILED",
      message: error.message || "Internal server error"
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [newest, oldest, status]
 *         description: Sort orders
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
      return res.status(401).json({
        success: false,
        error: "Unauthorized - No user ID",
        code: "NO_USER_ID"
      });
    }

    const { status, sortBy } = req.query;
    const filter: any = { userId };

    // Status filter
    if (status) {
      const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Invalid status",
          code: "INVALID_STATUS",
          message: `Status must be one of: ${validStatuses.join(', ')}`
        });
      }
      filter.status = status;
    }

    // Sorting
    let sortOrder: any = { createdAt: -1 };
    if (sortBy === 'oldest') {
      sortOrder = { createdAt: 1 };
    } else if (sortBy === 'status') {
      sortOrder = { status: 1, createdAt: -1 };
    }

    const orders = await Order.find(filter)
      .populate('userId', 'username email')
      .populate('items.productId', 'name price image')
      .sort(sortOrder);

    // Format response with user-friendly data
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      statusLabel: getStatusLabel(order.status),
      totalAmount: order.totalAmount,
      itemCount: order.items.length,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items
    }));

    return res.status(200).json({
      success: true,
      message: "Your orders retrieved successfully",
      code: "ORDERS_RETRIEVED",
      count: orders.length,
      orders: formattedOrders
    });
  } catch (error: any) {
    console.error("Get my orders error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve orders",
      code: "RETRIEVE_FAILED",
      message: error.message || "Internal server error"
    });
  }
};

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get a single order by ID (own order only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID or Order Number
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

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Order ID is required",
        code: "MISSING_ID"
      });
    }

    // Find by order ID or order number
    let order;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    } else {
      order = await Order.findOne({ orderNumber: id });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
        code: "ORDER_NOT_FOUND",
        message: "The order you're looking for doesn't exist"
      });
    }

    // Check if user is owner of order or admin
    if (order.userId.toString() !== userId && req.userRole !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        code: "FORBIDDEN",
        message: "You can only view your own orders"
      });
    }

    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'username email phoneNumber')
      .populate('items.productId', 'name price image description');

    return res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      code: "ORDER_RETRIEVED",
      order: {
        _id: populatedOrder._id,
        orderNumber: populatedOrder.orderNumber,
        status: populatedOrder.status,
        statusLabel: getStatusLabel(populatedOrder.status),
        totalAmount: populatedOrder.totalAmount,
        itemCount: populatedOrder.items.length,
        shippingAddress: populatedOrder.shippingAddress,
        paymentMethod: populatedOrder.paymentMethod,
        notes: populatedOrder.notes,
        createdAt: populatedOrder.createdAt,
        updatedAt: populatedOrder.updatedAt,
        items: populatedOrder.items,
        timeline: getOrderTimeline(populatedOrder.status, populatedOrder.createdAt, populatedOrder.updatedAt)
      }
    });
  } catch (error: any) {
    console.error("Get order by ID error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve order",
      code: "RETRIEVE_FAILED",
      message: error.message || "Internal server error"
    });
  }
};

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel order (only if pending)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID or Order Number
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Cannot cancel non-pending order
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

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Order ID is required",
        code: "MISSING_ID"
      });
    }

    // Find order
    let order;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    } else {
      order = await Order.findOne({ orderNumber: id });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
        code: "ORDER_NOT_FOUND"
      });
    }

    // Check ownership
    if (order.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        code: "FORBIDDEN",
        message: "You can only cancel your own orders"
      });
    }

    // Check if order can be cancelled
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: "Cannot cancel order",
        code: "CANNOT_CANCEL",
        message: `Order cannot be cancelled. Current status: ${getStatusLabel(order.status)}. Only pending orders can be cancelled.`
      });
    }

    // Cancel order
    order.status = 'cancelled';
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('userId', 'username email')
      .populate('items.productId', 'name price');

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      code: "ORDER_CANCELLED",
      order: {
        _id: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        statusLabel: getStatusLabel(updatedOrder.status),
        totalAmount: updatedOrder.totalAmount,
        cancelledAt: updatedOrder.updatedAt
      }
    });
  } catch (error: any) {
    console.error("Cancel order error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to cancel order",
      code: "CANCEL_FAILED",
      message: error.message || "Internal server error"
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
    // Admin check
    if (req.userRole !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        code: "ADMIN_ONLY",
        message: "Only admins can view all orders"
      });
    }

    const { status, userId } = req.query;
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId as string)) {
        return res.status(400).json({
          success: false,
          error: "Invalid user ID format",
          code: "INVALID_USER_ID"
        });
      }
      filter.userId = userId;
    }

    const orders = await Order.find(filter)
      .populate('userId', 'username email phoneNumber')
      .populate('items.productId', 'name price')
      .sort({ createdAt: -1 });

    // Format for admin view
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      customer: {
        _id: order.userId._id,
        username: order.userId.username,
        email: order.userId.email
      },
      status: order.status,
      statusLabel: getStatusLabel(order.status),
      totalAmount: order.totalAmount,
      itemCount: order.items.length,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    // Statistics
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };

    return res.status(200).json({
      success: true,
      message: "All orders retrieved successfully",
      code: "ORDERS_RETRIEVED",
      stats,
      count: orders.length,
      orders: formattedOrders
    });
  } catch (error: any) {
    console.error("Get all orders error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve orders",
      code: "RETRIEVE_FAILED",
      message: error.message || "Internal server error"
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
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated successfully
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
    const { status, notes } = req.body;

    // Admin check
    if (req.userRole !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        code: "ADMIN_ONLY",
        message: "Only admins can update order status"
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Order ID is required",
        code: "MISSING_ID"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID format",
        code: "INVALID_ID"
      });
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status",
        code: "INVALID_STATUS",
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
        code: "ORDER_NOT_FOUND"
      });
    }

    const oldStatus = order.status;
    order.status = status;

    if (notes) {
      order.notes = (order.notes || '') + `\n[Admin Update] ${new Date().toISOString()}: ${notes}`;
    }

    await order.save();

    const updatedOrder = await Order.findById(id)
      .populate('userId', 'username email')
      .populate('items.productId', 'name price');

    return res.status(200).json({
      success: true,
      message: `Order status updated successfully from ${getStatusLabel(oldStatus)} to ${getStatusLabel(status)}`,
      code: "STATUS_UPDATED",
      order: {
        _id: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        previousStatus: oldStatus,
        currentStatus: updatedOrder.status,
        statusLabel: getStatusLabel(updatedOrder.status),
        totalAmount: updatedOrder.totalAmount,
        updatedAt: updatedOrder.updatedAt
      }
    });
  } catch (error: any) {
    console.error("Update order status error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update order status",
      code: "UPDATE_FAILED",
      message: error.message || "Internal server error"
    });
  }
};

// Helper function to get user-friendly status labels
function getStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    pending: '⏳ Pending',
    confirmed: '✅ Confirmed',
    shipped: '📦 Shipped',
    delivered: '🎉 Delivered',
    cancelled: '❌ Cancelled'
  };
  return labels[status] || status;
}

// Helper function to create order timeline
function getOrderTimeline(status: string, createdAt: Date, updatedAt: Date) {
  const timeline = [
    {
      step: 'placed',
      label: 'Order Placed',
      date: createdAt,
      completed: true
    }
  ];

  if (status === 'pending') {
    timeline.push({
      step: 'confirmed',
      label: 'Awaiting Confirmation',
      date: null,
      completed: false
    });
  } else if (['confirmed', 'shipped', 'delivered'].includes(status)) {
    timeline.push({
      step: 'confirmed',
      label: 'Order Confirmed',
      date: updatedAt,
      completed: true
    });
  }

  if (['shipped', 'delivered'].includes(status)) {
    timeline.push({
      step: 'shipped',
      label: 'Order Shipped',
      date: updatedAt,
      completed: true
    });
  }

  if (status === 'delivered') {
    timeline.push({
      step: 'delivered',
      label: 'Order Delivered',
      date: updatedAt,
      completed: true
    });
  }

  if (status === 'cancelled') {
    timeline.push({
      step: 'cancelled',
      label: 'Order Cancelled',
      date: updatedAt,
      completed: true
    });
  }

  return timeline;
}