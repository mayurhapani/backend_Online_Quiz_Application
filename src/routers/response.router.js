import { Router } from "express";
import { getResponses } from "../controllers/response.controller.js";
import { isAuth } from "../middlewares/isAuth.middleware.js";

const responseRouter = Router();

responseRouter.get("/:quizId", isAuth, getResponses);

export { responseRouter };
