import { Router } from 'express';
import {
  approveWithdrawalRequest,
  createWithdrawalRequest,
  getAllWithdrawalRequests,
  getWithdrawalRequest,
  getUserWithdrawalRequests,
  markWithdrawalProcessed,
  rejectWithdrawalRequest,
  searchWithdrawalRequests
} from '../controllers/withdrawal-request.controller';
import { verifyJWT, verifyPermission } from '../middlewares/auth-middleware';
import { rolesEnum } from '../constants';
import { canResolveSupportTickets, requireAdminAccess } from '../middlewares/permission-middleware';
import { canViewSupportTickets } from '../middlewares/permission-middleware';

const router = Router();

// User routes - require authentication
router.use(verifyJWT);
router.post('/', createWithdrawalRequest);
router.get('/my-requests', getUserWithdrawalRequests);
router.get('/my-requests/:id', getWithdrawalRequest);

  // Admin routes - require admin privileges

  router.get('/admin/all', canViewSupportTickets, getAllWithdrawalRequests);
router.get('/admin/search', canViewSupportTickets, searchWithdrawalRequests);
router.patch('/admin/:id/approve', canResolveSupportTickets, approveWithdrawalRequest);
router.patch('/admin/:id/reject', canResolveSupportTickets, rejectWithdrawalRequest);
router.patch('/admin/:id/mark-processed', canResolveSupportTickets, markWithdrawalProcessed);

export default router; 