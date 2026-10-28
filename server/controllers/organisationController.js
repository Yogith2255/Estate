const Organisation = require('../models/Organisation');
const User = require('../models/User');

// @desc    List organisations
// @route   GET /api/organisations
// @access  Super admin
const getOrganisations = async (req, res, next) => {
    try {
        const organisations = await Organisation.find()
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            data: { organisations },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create an organisation and associate its administrator
// @route   POST /api/organisations
// @access  Super admin
const createOrganisation = async (req, res, next) => {
    try {
        const {
            name,
            slug,
            organisationType,
            contactEmail,
            contactPhone,
            description,
            adminUserId,
        } = req.body;

        if (!name || !slug) {
            return res.status(400).json({
                success: false,
                message: 'Organisation name and slug are required.',
            });
        }

        const normalizedSlug = slug
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const existing = await Organisation.findOne({
            slug: normalizedSlug,
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'An organisation with this slug already exists.',
            });
        }

        let adminUser = null;

        if (adminUserId) {
            adminUser = await User.findById(adminUserId);

            if (!adminUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Administrator user not found.',
                });
            }

            if (!['admin', 'org_admin'].includes(adminUser.role)) {
                return res.status(400).json({
                    success: false,
                    message: 'The selected user must have an admin or org_admin role.',
                });
            }

            if (adminUser.organisationId) {
                return res.status(409).json({
                    success: false,
                    message: 'This user already belongs to an organisation.',
                });
            }
        }

        const organisation = await Organisation.create({
            name: name.trim(),
            slug: normalizedSlug,
            organisationType: organisationType || 'developer',
            contactEmail: contactEmail || '',
            contactPhone: contactPhone || '',
            description: description || '',
            status: 'active',
            createdBy: req.user._id,
        });

        if (adminUser) {
            adminUser.organisationId = organisation._id;
            adminUser.role = 'org_admin';
            await adminUser.save();
        }

        return res.status(201).json({
            success: true,
            message: 'Organisation created successfully.',
            data: { organisation },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getOrganisations,
    createOrganisation,
};