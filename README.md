# Online Quiz Application Backend

This repository contains the backend implementation for an Online Quiz Application. It provides a RESTful API for managing quizzes, questions, and user authentication.

## Live Demo

Backend API URL: https://backend-online-quiz-application.onrender.com

## GitHub Repository

https://github.com/mayurhapani/backend_Online_Quiz_Application.git

## Features

- User authentication and authorization with JWT
- CRUD operations for quizzes and questions
- Quiz submission and scoring
- Role-based access control (RBAC)

## Technologies Used

- Node.js
- Express.js
- MongoDB
- JWT for authentication
- Bcrypt for password hashing

## Prerequisites

- Node.js (v14 or later)
- MongoDB

## Setup and Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/mayurhapani/backend_Online_Quiz_Application.git
   cd backend_Online_Quiz_Application
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following variables:

   ```env
   PORT=8001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Start the server:

   ```bash
   npm start
   ```

## API Endpoints

### User Routes

- POST `/api/v1/users/register` - Register a new user
- POST `/api/v1/users/login` - User login
- GET `/api/v1/users/logout` - User logout

### Quiz Routes

- POST `/api/v1/quizzes/createQuiz` - Create a new quiz (Admin only)
- GET `/api/v1/quizzes` - Get all quizzes
- GET `/api/v1/quizzes/:id` - Get a quiz by ID
- PATCH `/api/v1/quizzes/editQuiz/:id` - Update a quiz (Admin only)
- DELETE `/api/v1/quizzes/deleteQuiz/:id` - Delete a quiz (Admin only)
- POST `/api/v1/quizzes/submit` - Submit a quiz

## License

This project is licensed under the MIT License.
