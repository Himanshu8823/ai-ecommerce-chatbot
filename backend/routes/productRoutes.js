import express from 'express';
import { getAllProducts, getProductById, checkProductStock } from '../controllers/productController.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/:id/stock', checkProductStock);

export default router;
