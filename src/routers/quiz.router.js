import { Router } from "express";
import { getQuizzes, getQuizById, createQuiz, submitQuiz } from "../controllers/quiz.controller.js";
import { isAuth } from "../middlewares/isAuth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";

const quizRouter = Router();

quizRouter.get("/", getQuizzes);
quizRouter.get("/:id", getQuizById);
quizRouter.post("/", isAuth, authorize("admin"), createQuiz);
quizRouter.post("/submit", isAuth, submitQuiz);

export { quizRouter };
