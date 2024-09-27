import { quizModel } from "../models/quiz.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await quizModel.find();
  res.status(200).json(new ApiResponse(200, quizzes, "Quizzes fetched successfully"));
});

const getQuizById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const quiz = await quizModel.findById(id);
  if (!quiz) throw new ApiError(404, "Quiz not found");
  res.status(200).json(new ApiResponse(200, quiz, "Quiz fetched successfully"));
});

const createQuiz = asyncHandler(async (req, res) => {
  const { title, description, questions } = req.body;
  const quiz = await quizModel.create({ title, description, questions });
  res.status(201).json(new ApiResponse(201, quiz, "Quiz created successfully"));
});

const submitQuiz = asyncHandler(async (req, res) => {
  const { quizId, answers } = req.body;
  const quiz = await quizModel.findById(quizId);
  if (!quiz) throw new ApiError(404, "Quiz not found");

  let score = 0;
  quiz.questions.forEach((question, index) => {
    if (question.correctAnswer === answers[index]) {
      score += 1;
    }
  });

  res.status(200).json(new ApiResponse(200, { score }, "Quiz submitted successfully"));
});

export { getQuizzes, getQuizById, createQuiz, submitQuiz };
