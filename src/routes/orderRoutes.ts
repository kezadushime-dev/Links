import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus
} from '../controllers/orderController';
import { protect, roleCheck } from '../middleware/authMiddleware';

const router = Router();

/**
 * Customer Routes (Protected)
 */

// Create a new order from cart
// POST /api/orders
router.post('/', protect, createOrder);

// Get all user's orders
// GET /api/orders
router.get('/', protect, getMyOrders);

// Get single order by ID (own order only)
// GET /api/orders/:id
router.get('/:id', protect, getOrderById);

// Cancel order (only if pending)
// PATCH /api/orders/:id/cancel
router.patch('/:id/cancel', protect, cancelOrder);

/**
 * Admin Routes (Protected + Admin Role)
 */

// Get all orders (all users)
// GET /api/admin/orders
router.get('/admin/orders', protect, roleCheck('Admin'), getAllOrders);

// Update order status
// PATCH /api/admin/orders/:id/status
router.patch('/admin/orders/:id/status', protect, roleCheck('Admin'), updateOrderStatus);

export default router;