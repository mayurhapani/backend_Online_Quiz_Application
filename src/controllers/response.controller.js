import { responseModel } from "../models/response.model.js";
import { quizModel } from "../models/quiz.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getResponses = asyncHandler(async (req, res) => {
  try {
    const responses = await responseModel.findOne({
      userId: req.user._id,
      quizId: req.params.quizId,
    });

    if (!responses) {
      console.log("No responses found");
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Responses not found"));
    }

    // Manually populate questionId
    const quiz = await quizModel.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json(new ApiResponse(404, null, "Quiz not found"));
    }

    const populatedAnswers = responses.answers.map((answer) => {
      const question = quiz.questions.id(answer.questionId);
      return {
        ...answer.toObject(),
        questionId: question,
      };
    });

    const populatedResponses = {
      ...responses.toObject(),
      answers: populatedAnswers,
    };

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          populatedResponses,
          "Responses fetched successfully"
        )
      );
  } catch (error) {
    console.error("Error fetching responses:", error);
    res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

export { getResponses };
