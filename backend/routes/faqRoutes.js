import express from 'express';
import { getAllFaqs } from '../controllers/faqController.js';

const router = express.Router();

router.get('/', getAllFaqs);

export default router;
