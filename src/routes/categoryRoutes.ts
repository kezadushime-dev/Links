import { Router } from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/categoryController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware'; // <--- Ibi nibyo byari bibuze!

const router = Router();

// 1. PUBLIC: Umuntu wese ashobora kureba categories
router.get('/', getCategories); 

// 2. ADMIN ONLY: Mwarimu yavuze ko Admin ari we ucunga Categories gusa
// Twongeyeho authorize('Admin') kuko Vendor na Customer batabyemerewe
router.post('/', protect, authorize('Admin'), createCategory);
router.delete('/:id', protect, authorize('Admin'), deleteCategory);

export default router;