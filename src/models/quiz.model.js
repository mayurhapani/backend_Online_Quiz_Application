import mongoose, { Schema } from "mongoose";

const questionSchema = new Schema({
  text: { type: String, required: true },
  choices: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
});

const quizSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    questions: [questionSchema],
  },
  { timestamps: true }
);

export const quizModel = mongoose.model("Quiz", quizSchema);
