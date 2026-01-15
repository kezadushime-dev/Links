import { Router } from 'express';
import { 
    getCart, 
    addToCart, 
    removeFromCart, 
    clearCart 
} from '../controllers/cartController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// ZOSE zirinzwe na 'protect' kuko isakoshi ni iy'umuntu winjiye gusa
router.get('/', protect, getCart);          // Reba isakoshi yawe
router.post('/', protect, addToCart);        // Ongeramo igicuruzwa
router.delete('/:id', protect, removeFromCart); // Siba ikintu kimwe
router.delete('/clear/all', protect, clearCart); // Siba isakoshi yose

export default router;