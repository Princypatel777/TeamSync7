import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  bulkImportUsers,
  toggleUserStatus,
  resetUserPassword,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  getSgpCycles,
  createSgpCycle,
  updateSgpCycle,
  deleteSgpCycle,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// User routes
router.get('/users', authorize('ADMIN', 'COORDINATOR'), getUsers);
router.post('/users', authorize('ADMIN', 'COORDINATOR'), createUser);
router.post('/users/import-csv', authorize('ADMIN'), bulkImportUsers);
router.put('/users/:id', authorize('ADMIN', 'COORDINATOR'), updateUser);
router.delete('/users/:id', authorize('ADMIN'), deleteUser);
router.patch('/users/:id/status', authorize('ADMIN', 'COORDINATOR'), toggleUserStatus);
router.post('/users/:id/reset-password', authorize('ADMIN', 'COORDINATOR'), resetUserPassword);

// Department routes
router.get('/departments', authorize('ADMIN', 'COORDINATOR', 'FACULTY', 'STUDENT'), getDepartments);
router.post('/departments', authorize('ADMIN'), createDepartment);
router.put('/departments/:id', authorize('ADMIN'), updateDepartment);
router.delete('/departments/:id', authorize('ADMIN'), deleteDepartment);

// Academic Year routes
router.get('/academic-years', authorize('ADMIN', 'COORDINATOR'), getAcademicYears);
router.post('/academic-years', authorize('ADMIN'), createAcademicYear);
router.put('/academic-years/:id', authorize('ADMIN'), updateAcademicYear);
router.delete('/academic-years/:id', authorize('ADMIN'), deleteAcademicYear);

// SGP Cycle routes
router.get('/sgp-cycles', authorize('ADMIN', 'COORDINATOR'), getSgpCycles);
router.post('/sgp-cycles', authorize('ADMIN', 'COORDINATOR'), createSgpCycle);
router.put('/sgp-cycles/:id', authorize('ADMIN', 'COORDINATOR'), updateSgpCycle);
router.delete('/sgp-cycles/:id', authorize('ADMIN', 'COORDINATOR'), deleteSgpCycle);

export default router;
