import mongoose, { Schema } from "mongoose";

const responseSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    answers: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "Quiz.questions",
          required: true,
        },
        userAnswer: { type: String, required: true },
      },
    ],
    score: { type: Number, required: true },
  },
  { timestamps: true }
);

export const responseModel = mongoose.model("Response", responseSchema);
