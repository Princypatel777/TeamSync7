import express from 'express';
import {
  getGithubConfig,
  connectGithubRepo,
  getGithubCommits,
  getGithubPullRequests,
  getGithubProxy,
  getReleases,
  createRelease,
  updateRelease,
  deleteRelease,
  getCalendarEvents,
} from '../controllers/integrationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// GitHub Integration
router.get('/github', getGithubConfig);
router.post('/github/connect', authorize('STUDENT', 'FACULTY', 'ADMIN'), connectGithubRepo);
router.get('/github/commits', getGithubCommits);
router.get('/github/pulls', getGithubPullRequests);
router.get('/github/proxy', getGithubProxy);

// Releases
router.get('/releases', getReleases);
router.post('/releases', authorize('STUDENT', 'ADMIN'), createRelease);
router.put('/releases/:id', authorize('STUDENT', 'ADMIN'), updateRelease);
router.delete('/releases/:id', authorize('STUDENT', 'ADMIN'), deleteRelease);

// Calendar
router.get('/calendar', getCalendarEvents);

export default router;
