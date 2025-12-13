import { Router } from 'express';
import { validateFeedback } from '../controllers/feedback.controller.js';

const router = Router();

router.post('/validate', validateFeedback);

export default router;
