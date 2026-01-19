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
 * ========================================
 * CUSTOMER ROUTES (Protected)
 * ========================================
 */

/**
 * POST /api/orders
 * Create a new order from user's cart
 */
router.post('/', protect, createOrder);

/**
 * GET /api/orders
 * Get all orders for logged-in user
 * Query params: status, sortBy
 */
router.get('/', protect, getMyOrders);

/**
 * GET /api/orders/:id
 * Get a single order by ID or Order Number (own order only)
 */
router.get('/:id', protect, getOrderById);

/**
 * PATCH /api/orders/:id/cancel
 * Cancel an order (only if status is pending)
 */
router.patch('/:id/cancel', protect, cancelOrder);

/**
 * ========================================
 * ADMIN ROUTES (Protected + Admin Role)
 * ========================================
 */

/**
 * GET /api/admin/orders
 * Get all orders (all users)
 * Query params: status, userId
 */
router.get('/admin/orders', protect, roleCheck('Admin'), getAllOrders);

/**
 * PATCH /api/admin/orders/:id/status
 * Update order status (Admin only)
 * Body: { status, notes? }
 */
router.patch('/admin/orders/:id/status', protect, roleCheck('Admin'), updateOrderStatus);

export default router;