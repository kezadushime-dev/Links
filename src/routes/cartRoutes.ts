import { Router } from 'express';
import { 
    getCart, 
    addToCart, 
    removeFromCart, 
    clearCart,
} from '../controllers/cartController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/', protect, getCart);
router.post('/', protect, addToCart);

// Changed from '/clear/all' to '/clear' to match your Swagger @swagger /cart/clear
router.delete('/clear', protect, clearCart); 

router.delete('/:id', protect, removeFromCart);

export default router;