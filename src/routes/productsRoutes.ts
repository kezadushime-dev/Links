import { Router } from 'express';
import { 
    getProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    deleteAllProducts // <--- Added this import
} from '../controllers/productController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = Router();

// Public route
router.get('/', getProducts); 

// Admin & Vendor routes
router.post('/', protect, authorize('Admin', 'Vendor'), createProduct);
router.put('/:id', protect, authorize('Admin', 'Vendor'), updateProduct);
router.delete('/:id', protect, authorize('Admin', 'Vendor'), deleteProduct);

// Admin ONLY route (Delete All)
// Admin ONLY route (Delete All)
router.delete('/', protect, authorize('Admin'), deleteAllProducts); 


export default router;