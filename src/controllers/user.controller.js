import { userModel } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import redisClient from "../config/redis.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if ([name, email, password, role].some((fields) => fields?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  if (!["admin", "teacher", "student"].includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const existedUser = await userModel.findOne({ email });

  if (existedUser) {
    throw new ApiError(409, "User with email already exists");
  }

  const user = await userModel.create({
    name,
    email,
    password,
    role,
  });

  const createdUser = await userModel.findById(user._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
  const { _id } = req.params;

  const user = await userModel.findOne({ _id });
  if (!user) throw new ApiError(404, "User not found");

  const deletedUser = await userModel.findOneAndDelete({ _id });

  // Clear the user from Redis cache
  const cacheKeys = await redisClient.keys(`users:*`);
  if (cacheKeys.length > 0) {
    await redisClient.del(cacheKeys);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedUser, "User deleted successfully"));
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const { _id } = req.params;

  const user = await userModel.findById(_id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Update user fields
  user.name = name || user.name;
  user.email = email || user.email;

  const updatedUser = await user.save();

  // Clear the user from Redis cache
  const cacheKeys = await redisClient.keys(`users:*`);
  if (cacheKeys.length > 0) {
    await redisClient.del(cacheKeys);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some((fields) => fields?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await userModel.findOne({ email });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  } else {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { user, token }, "User login successfully"));
  }
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "None",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

const getUser = asyncHandler(async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error in getUser:", error);
    throw new ApiError(500, "Error fetching user data");
  }
});

const updateFcmToken = asyncHandler(async (req, res) => {
  const { fcmToken } = req.body;
  const userId = req.user._id;

  if (!fcmToken) {
    throw new ApiError(400, "FCM token is required");
  }

  const updatedUser = await userModel
    .findByIdAndUpdate(userId, { fcmToken }, { new: true })
    .select("-password");

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "FCM token updated successfully"));
});

const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = "asc", role } = req.query;
  const cacheKey = `users:${role}:${page}:${limit}:${sort}`;

  const cachedUsers = await redisClient.get(cacheKey);
  if (cachedUsers) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          JSON.parse(cachedUsers),
          "Users fetched successfully from cache"
        )
      );
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { name: sort === "asc" ? 1 : -1 },
    select: "-password",
  };

  const query = role ? { role } : {};

  try {
    const users = await userModel.paginate(query, options);

    await redisClient.set(cacheKey, JSON.stringify(users), { EX: 60 * 10 }); // Cache for 10 minutes

    return res
      .status(200)
      .json(new ApiResponse(200, users, "Users fetched successfully"));
  } catch (error) {
    console.error("Error in getUsers:", error);
    throw new ApiError(500, "Failed to fetch users", error);
  }
});

const getTeachers = asyncHandler(async (req, res) => {
  const teachers = await userModel.find({ role: "teacher" }).select("_id name");

  return res
    .status(200)
    .json(new ApiResponse(200, teachers, "Teachers fetched successfully"));
});

export {
  registerUser,
  login,
  logout,
  getUser,
  updateUser,
  deleteUser,
  updateFcmToken,
  getUsers,
  getTeachers,
};
