import { Router } from "express";
import {
  getQuizzes,
  getQuizById,
  createQuiz,
  submitQuiz,
  editQuiz,
  deleteQuiz,
  getQuizzesWithResponses,
} from "../controllers/quiz.controller.js";
import { isAuth } from "../middlewares/isAuth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";

const quizRouter = Router();

quizRouter.get("/", getQuizzes);
quizRouter.get("/with-responses", isAuth, getQuizzesWithResponses);
quizRouter.get("/:id", getQuizById);
quizRouter.post("/createQuiz", isAuth, authorize("admin"), createQuiz);
quizRouter.patch("/editQuiz/:id", isAuth, authorize("admin"), editQuiz);
quizRouter.delete("/deleteQuiz/:id", isAuth, authorize("admin"), deleteQuiz);
quizRouter.post("/submit", isAuth, submitQuiz);

export { quizRouter };
