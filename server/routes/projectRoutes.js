const express = require('express');
const router = express.Router();

const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

const { authenticate } = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Public marketplace.
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Authenticated organisation staff and platform administrators.
router.post(
  '/',
  authenticate,
  authorize('admin', 'agent', 'org_admin', 'super_admin'),
  createProject
);

router.put(
  '/:id',
  authenticate,
  authorize('admin', 'agent', 'org_admin', 'super_admin'),
  updateProject
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'org_admin', 'super_admin'),
  deleteProject
);

module.exports = router;