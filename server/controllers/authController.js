const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organisation = require('../models/Organisation');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'estatehub_jwt_fallback_secret_not_for_prod';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn }
  );
};

// @desc    Register a customer or organisation admin
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  let createdOrganisationId = null;

  try {
    const {
      name,
      email,
      phone,
      password,
      role = 'customer',
      organisationName,
    } = req.body;
    console.log('[REGISTER] Controller:', __filename);
    console.log('[REGISTER] Incoming role:', req.body.role);
    console.log('[REGISTER] Destructured role:', role);
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must contain at least 2 characters.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    // Only customer and admin registration are supported here.
    if (!['customer', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account type.',
      });
    }

    // Validate organisation name for admins.
    const normalizedOrganisationName =
      typeof organisationName === 'string'
        ? organisationName.trim()
        : '';

    if (role === 'admin' && normalizedOrganisationName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Organisation name must contain at least 2 characters.',
      });
    }

    // Check for duplicate email.
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password.
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let organisation = null;

    // Create an organisation for an admin account.
    if (role === 'admin') {
      const baseSlug =
        normalizedOrganisationName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || 'organisation';

      // Ensure each organisation receives a unique slug.
      let slug = baseSlug;
      let suffix = 1;

      while (await Organisation.exists({ slug })) {
        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
      }

      organisation = await Organisation.create({
        name: normalizedOrganisationName,
        slug,
        organisationType: 'developer',
        contactEmail: normalizedEmail,
        contactPhone: phone ? phone.trim() : '',
        status: 'active',
      });

      createdOrganisationId = organisation._id;
    }

    // Create the user.
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      phone: phone ? phone.trim() : '',
      passwordHash,
      role,
      status: 'active',
      organisationId: organisation ? organisation._id : null,
      agency: organisation ? organisation.name : '',
    });
    console.log('[REGISTER] Saved user role:', user.role);
    console.log('[REGISTER] Saved organisation ID:', user.organisationId);

    // Generate authentication token.
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message:
        role === 'admin'
          ? 'Organisation admin registered successfully.'
          : 'Customer registration successful.',
      data: {
        token,
        user: user.toJSON(),
        organisation: organisation
          ? {
            id: organisation._id,
            name: organisation.name,
            slug: organisation.slug,
          }
          : null,
      },
    });
  } catch (error) {
    // Avoid leaving an orphaned organisation if user creation fails.
    if (createdOrganisationId) {
      try {
        await Organisation.findByIdAndDelete(createdOrganisationId);
      } catch (cleanupError) {
        console.error(
          'Failed to clean up organisation after registration error:',
          cleanupError.message
        );
      }
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account or organisation with this information already exists.',
      });
    }

    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}. Please contact an administrator.`,
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Protected
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    return res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully.',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sign out
// @route   POST /api/auth/logout
// @access  Public / Protected
const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Signed out successfully.',
    data: null,
  });
};

// @desc    Create the initial administrator account (only allowed if NO admin exists yet)
// @route   POST /api/auth/setup-admin
// @access  Protected / One-time bootstrap
const setupAdmin = async (req, res, next) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount > 0) {
      return res.status(403).json({
        success: false,
        message: 'Administrator already configured. Setup endpoint is disabled.',
      });
    }

    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required for initial administrator.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      passwordHash,
      role: 'admin',
      status: 'active',
      agency: 'EstateHub Executive Leadership',
    });

    const token = generateToken(admin);

    return res.status(201).json({
      success: true,
      message: 'Initial administrator created successfully.',
      data: {
        token,
        user: admin.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  setupAdmin,
};
