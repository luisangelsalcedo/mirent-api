import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { generateJWT } from "../utils/generateJWT.js";

/**
 * ## Login
 * * Login validating an email and password
 * @param {String} req.body.email - Email sent to validate login
 * @param {String} req.body.password - Password sent to validate login
 * @return {HTTPResponse} - status 200 return {token, notice} | status 400,404,500 return {message}
 */
export const login = async (req, res) => {
  const { email, password: pass } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!pass) return res.status(400).json({ message: "Password is required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  // compare hash
  const hashIsCorrect = await bcrypt.compare(pass, user.password);
  if (!hashIsCorrect)
    return res.status(403).json({ message: "Password is not correct" });

  // jwt
  const payload = {
    id: user._id,
    name: user.name,
  };
  const token = await generateJWT(payload);
  res.status(200).json({ token, notice: "Logged user" });
};

/**
 * ## Register user
 * * Register unique user with email and password
 * @param {String} req.body.email - Email sent for user registration
 * @param {String} req.body.password - Password sent for user registration
 * @return {HTTPResponse} - status 201 return {user, notice} | status 400,500 return {message}
 */
export const register = async (req, res) => {
  const { email, password: pass } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!pass) return res.status(400).json({ message: "Password is required" });

  const duplicateUser = await User.findOne({ email });
  if (duplicateUser) return res.status(400).json({ message: "Duplicate user" });

  // implementing bcrypt hash
  const hash = await bcrypt.hash(pass, 10);
  const user = new User({ ...req.body, password: hash });

  try {
    const saveUser = await user.save();
    res.status(201).json({ user: saveUser, notice: "New user created" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ## Validate token
 * * validate user authentication token and extract payload
 * @param {String} req.query.token - Authentication token
 * @return {HTTPResponse} - status 200 return {payload} | status 400,401 return {message}
 */
export const validate = (req, res) => {
  const { token } = req.query;

  if (!token)
    return res.status(400).json({ message: "Auth token is required" });
  // jwt
  jwt.verify(token, process.env.JWT_PASSWORD, (err, payload) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    res.status(200).json({ payload });
  });
};
