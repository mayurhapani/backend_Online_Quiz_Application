import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { userRouter } from "./routers/user.router.js";
import { courseRouter } from "./routers/course.router.js";
import { assignmentRouter } from "./routers/assignment.router.js";
import { gradeRouter } from "./routers/grades.router.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to the Education Management System!");
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/assignments", assignmentRouter);
app.use("/api/v1/grades", gradeRouter);

app.use((err, req, res, next) => {
  console.error("Error details:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
});

export { app };
