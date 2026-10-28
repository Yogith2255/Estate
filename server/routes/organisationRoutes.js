const express = require('express');
const router = express.Router();

const {
    getOrganisations,
    createOrganisation,
} = require('../controllers/organisationController');

const { authenticate } = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate, authorize('super_admin'));

router.get('/', getOrganisations);
router.post('/', createOrganisation);

module.exports = router;