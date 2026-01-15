import { Router } from 'express';
import { createOrder, getMyOrders } from '../controllers/orderController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, createOrder);   // Gukora commande
router.get('/', protect, getMyOrders);     // Reba commande zawe

export default router;