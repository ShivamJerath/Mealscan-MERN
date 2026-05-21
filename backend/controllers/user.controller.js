import User from "../models/user.model.js";
import Record from "../models/record.model.js";

// GET /api/user/students - get all students (contractors only)
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "STUDENT" })
      .select("-password")
      .sort({ name: 1 });
    res.status(200).json({ students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/user/all - get all users (contractors only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ role: 1, name: 1 });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/user/:id - update user (contractors only)
export const updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const { id } = req.params;

    // Check email conflict
    const existing = await User.findOne({ email });
    if (existing && existing._id.toString() !== id) {
      return res.status(400).json({ message: "Email already registered by another user" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/user/:id - delete user + their records (contractors only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete all records of this user
    await Record.deleteMany({ $or: [{ student: id }, { contractor: id }] });

    res.status(200).json({ message: "User and their records deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
