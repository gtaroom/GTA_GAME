import { Router } from 'express';
import { handleEztextingWebhook } from '../controllers/webhook.controller';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// EZ Texting webhook endpoint
router.post('/eztexting', asyncHandler(handleEztextingWebhook));

export default router; 