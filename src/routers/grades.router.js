import { Router } from "express";
import {
  createGrade,
  getGrades,
  updateGrade,
  deleteGrade,
} from "../controllers/grade.controller.js";
import { isAuth } from "../middlewares/isAuth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";

const gradeRouter = Router();

gradeRouter.post("/create", isAuth, authorize("admin", "teacher"), createGrade);
gradeRouter.get("/", isAuth, getGrades);
gradeRouter.patch("/:id", isAuth, authorize("admin", "teacher"), updateGrade);
gradeRouter.delete("/:id", isAuth, authorize("admin", "teacher"), deleteGrade);

export { gradeRouter };
