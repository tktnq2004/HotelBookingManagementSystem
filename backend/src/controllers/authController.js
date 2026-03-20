import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {

    const { name, phone, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await User.create({
      name,
      phone,
      email,
      password: hashedPassword
    });

    const { password: RemovedPassword, ...userData } = user._doc;

    res.status(201).json({
      message: "User created",
      user: userData
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

export const login = async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: RemovedPassword, ...userData } = user._doc;

    res.json({
      token,
      user: userData
    });

  } catch (error) {
    res.status(500).json(error);
  }

};

export const getMe = async (req, res) => {

  try {

    const user = await User.findById(req.user.id).select("-password");

    res.json(user);

  } catch (error) {
    res.status(500).json(error);
  }

};