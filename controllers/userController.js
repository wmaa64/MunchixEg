// controllers/userController.js
import User from '../models/User';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken';

// 🧾 Get all users
const getUsers = async () => {
  const users = await User.find();
  return users;
};

// 🆕 Register new user
const registerUser = async (data) => {
  const { name, email, mobile, password, isSeller, isAdmin } = data;

  const existing = await User.findOne({ email });
  if (existing) throw new Error('User already exists');

  const user = await User.create({ name, email, mobile, password, isSeller, isAdmin });
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    isAdmin: user.isAdmin,
    isSeller: user.isSeller,
    isAdmin: user.isAdmin,
    token: generateToken(user._id),
  };
};

// 🔑 Login user
const loginUser = async (data) => {
  const { email, password } = data;

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid email or password');
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    isAdmin: user.isAdmin,
    isSeller: user.isSeller,
    token: generateToken(user._id),
  };
};

// ✏️ Update user info
const updateUser = async (id, data) => {
  const user = await User.findById(id);
  if (!user) throw new Error('User not found');

  user.name = data.name || user.name;
  user.email = data.email || user.email;
  if (data.password) user.password = data.password;
  user.isSeller = data.isSeller ?? user.isSeller;

  const updated = await user.save();
  return updated;
};

// ❌ Delete user
const deleteUser = async (id) => {
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) throw new Error('User not found');
  return deleted;
};

export { getUsers, registerUser, loginUser, updateUser, deleteUser };






/*
// controllers/userController.js
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const getUsers = async (req, res) => {
  try {
    // Fetch subcategories from the database
    const users = await User.find();

    // Send the users in the response
    res.status(200).json(users);
  } catch (error) {
    // Handle any errors
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error. Unable to fetch users.' });
  }
};

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, isSeller } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    const user = await User.create({ name, email, password, isSeller });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isSeller: user.isSeller,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Authenticate user & get token
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if password matches
    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isSeller: user.isSeller,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isSeller: user.isSeller,
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Update user fields
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      return res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        isSeller: updatedUser.isSeller,
        token: generateToken(updatedUser._id),
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getUsers, registerUser,loginUser,getUserProfile, updateUserProfile};
*/