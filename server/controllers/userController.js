const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Protected (Admin only)
const getUsers = async (req, res, next) => {
  try {
    const { role, status, search, limit = 100 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role.toLowerCase();
    }

    if (status && status !== 'all') {
      query.status = status.toLowerCase();
    }

    if (search) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { agency: { $regex: q, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const formatted = users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      agency: u.agency || (u.role === 'customer' ? 'Direct Client' : 'EstateHub Prime Realty Group'),
      status: u.status.charAt(0).toUpperCase() + u.status.slice(1),
      createdAt: u.createdAt,
    }));

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully.',
      data: {
        users: formatted,
        rawUsers: users,
        total: formatted.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user / agent (Admin only)
// @route   POST /api/users
// @access  Protected (Admin only)
const createUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role = 'agent', agency, status = 'active' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      passwordHash,
      role,
      agency: agency || (role === 'agent' ? 'EstateHub Brokerage' : ''),
      status,
    });

    return res.status(201).json({
      success: true,
      message: `${role.toUpperCase()} account created successfully.`,
      data: { user: user.toJSON() },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role or status (Admin only)
// @route   PUT /api/users/:id
// @access  Protected (Admin only)
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, status, name, phone, agency } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Protection against locking out all administrators
    if (user.role === 'admin' && (role !== 'admin' || status === 'inactive' || status === 'suspended')) {
      const activeAdminCount = await User.countDocuments({ role: 'admin', status: 'active' });
      if (activeAdminCount <= 1 && user.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate or demote the last remaining active administrator.',
        });
      }
    }

    if (role) user.role = role.toLowerCase();
    if (status) user.status = status.toLowerCase();
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (agency !== undefined) user.agency = agency.trim();

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully.',
      data: { user: user.toJSON() },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
};
