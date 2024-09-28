import { quizModel } from "../models/quiz.model.js";
import { responseModel } from "../models/response.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await quizModel.find();
  res
    .status(200)
    .json(new ApiResponse(200, quizzes, "Quizzes fetched successfully"));
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

const editQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, questions } = req.body;
  const quiz = await quizModel.findByIdAndUpdate(id, {
    title,
    description,
    questions,
  });
  res.status(200).json(new ApiResponse(200, quiz, "Quiz updated successfully"));
});

const deleteQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await quizModel.findByIdAndDelete(id);
  res.status(200).json(new ApiResponse(200, null, "Quiz deleted successfully"));
});

const submitQuiz = asyncHandler(async (req, res) => {
  const { quizId, answers } = req.body;

  const quiz = await quizModel.findById(quizId);
  if (!quiz) throw new ApiError(404, "Quiz not found");

  let score = 0;
  quiz.questions.forEach((question, index) => {
    if (question.correctAnswer === answers[index].userAnswer) {
      score += 1;
    }
  });

  console.log(score);

  const isAlreadyDone = await responseModel.findOne({
    userId: req.user.id,
    quizId,
  });

  if (isAlreadyDone) {
    throw new ApiError(400, "You have already submitted this quiz");
  }

  const response = await responseModel.create({
    userId: req.user.id,
    quizId,
    answers,
    score,
  });

  console.log(response);

  res
    .status(200)
    .json(new ApiResponse(200, { score }, "Quiz submitted successfully"));
});

const getQuizzesWithResponses = asyncHandler(async (req, res) => {
  const quizzes = await quizModel.find();
  const responses = await responseModel.find({ userId: req.user._id });

  const quizzesWithResponses = quizzes.map((quiz) => {
    const response = responses.find((resp) => resp.quizId.toString() === quiz._id.toString());
    return {
      ...quiz.toObject(),
      response,
    };
  });

  res
    .status(200)
    .json(new ApiResponse(200, quizzesWithResponses, "Quizzes fetched successfully"));
});

export {
  getQuizzes,
  getQuizById,
  createQuiz,
  editQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizzesWithResponses,
};
