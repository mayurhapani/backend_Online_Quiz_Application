import { Router } from "express";
import {
  registerUser,
  deleteUser,
  updateUser,
  login,
  logout,
  getUser,
  getUsers,
} from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/isAuth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";

const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.delete("/delete/:_id", isAuth, deleteUser); // Updated
userRouter.patch("/update/:_id", isAuth, updateUser); // Updated

userRouter.post("/login", login);
userRouter.get("/logout", isAuth, logout);

userRouter.get("/getUser", isAuth, getUser);
userRouter.get("/getUsers", isAuth, authorize("admin"), getUsers);

export { userRouter };
