import express from 'express';
import {
  getMyAssignedGroups,
  getGroupContext,
  getFacultyProfile,
  updateFacultyProfile,
  getFacultyDepartments,
} from '../controllers/facultyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/profile', authorize('FACULTY', 'COORDINATOR', 'ADMIN'), getFacultyProfile);
router.put('/profile', authorize('FACULTY', 'COORDINATOR', 'ADMIN'), updateFacultyProfile);
router.get('/departments', authorize('FACULTY', 'COORDINATOR', 'ADMIN'), getFacultyDepartments);

router.get('/groups', authorize('FACULTY', 'ADMIN'), getMyAssignedGroups);
router.get('/groups/:groupId', authorize('FACULTY', 'ADMIN'), getGroupContext);

export default router;
