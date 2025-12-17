import { Router } from 'express';
import { 
  approveRechargeRequest, 
  createRechargeRequest, 
  getAllRechargeRequests, 
  getRechargeRequest, 
  getUserRechargeRequests, 
  rejectRechargeRequest 
} from '../controllers/recharge-request.controller';
import { verifyJWT, verifyPermission } from '../middlewares/auth-middleware';
import { rolesEnum } from '../constants';
import { canResolveSupportTickets } from '../middlewares/permission-middleware';
import { canViewSupportTickets } from '../middlewares/permission-middleware';

const router = Router();

// User routes - require authentication
router.use(verifyJWT);

// Route for creating a recharge request (for users)
router.post('/', createRechargeRequest);

// Routes for users to view their own recharge requests
router.get('/my-requests', getUserRechargeRequests);
router.get('/my-requests/:id', getRechargeRequest);


// Routes for admins to manage all recharge requests
router.get('/',canViewSupportTickets, getAllRechargeRequests);
router.get('/:id',canViewSupportTickets, getRechargeRequest);
router.patch('/:id/approve',canResolveSupportTickets, approveRechargeRequest);
router.patch('/:id/reject',canResolveSupportTickets, rejectRechargeRequest);

export default router; 