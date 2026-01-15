import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware'; // <--- Ongeraho uyu murongo

const router = Router();

router.get('/', getProducts); 
router.post('/', protect, authorize('Admin', 'Vendor'), createProduct);
router.put('/:id', protect, authorize('Admin', 'Vendor'), updateProduct);
router.delete('/:id', protect, authorize('Admin', 'Vendor'), deleteProduct);

export default router;