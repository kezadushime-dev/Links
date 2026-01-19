import { 
  createProduct, 
  getAllProducts,
  getProductById, 
  updateProduct, 
  deleteProduct,
  deleteAllProducts 
} from '../controllers/productController';
import { protect, roleCheck } from '../middleware/authMiddleware';

const router = require('express').Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes (require authentication)
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.delete('/', protect, roleCheck('Admin'), deleteAllProducts);

export default router;