import { Router } from 'express';
import feedbackRoutes from './feedback.routes.js';

const router = Router();

// Mount route modules
router.use('/feedback', feedbackRoutes);

export default router;
