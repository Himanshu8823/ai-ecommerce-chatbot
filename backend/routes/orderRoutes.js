import express from 'express';
import {
  getAllOrders,
  getOrderById,
  cancelOrder,
  requestReturn,
  getRefundDetails
} from '../controllers/orderController.js';

const router = express.Router();

router.get('/', getAllOrders);
router.get('/refunds', getRefundDetails);
router.get('/:id', getOrderById);
router.post('/:id/cancel', cancelOrder);
router.post('/:id/return', requestReturn);

export default router;
