import { Router } from "express";
import {
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
  getAssignmentsForCourse,
  submitAssignment,
  getSubmittedAssignments,
  getEnrolledAssignments,
} from "../controllers/assignment.controller.js";
import { isAuth } from "../middlewares/isAuth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";

const assignmentRouter = Router();

assignmentRouter.post(
  "/create",
  isAuth,
  authorize("admin", "teacher"),
  createAssignment
);
assignmentRouter.get("/", isAuth, getAssignments);
assignmentRouter.patch(
  "/:id",
  isAuth,
  authorize("admin", "teacher"),
  updateAssignment
);
assignmentRouter.delete(
  "/:id",
  isAuth,
  authorize("admin", "teacher"),
  deleteAssignment
);

// New routes
assignmentRouter.get("/course/:courseId", isAuth, getAssignmentsForCourse);
assignmentRouter.post("/submit", isAuth, authorize("student"), submitAssignment);
assignmentRouter.get("/submitted", isAuth, authorize("student"), getSubmittedAssignments);
assignmentRouter.get("/enrolled", isAuth, authorize("student"), getEnrolledAssignments);

export { assignmentRouter };
