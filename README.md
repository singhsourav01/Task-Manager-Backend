# Task Management Backend

A robust backend API for a comprehensive task management system built with Express.js, TypeScript, and Prisma ORM.

## 📋 Overview

Task Management Backend is a RESTful API that enables teams to collaborate on projects, manage tasks, assign work, and communicate through comments. It features JWT-based authentication, role-based access control, and a clean layered architecture.

## ✨ Features

- **User Management**: Register, authenticate, and manage user profiles with role-based access
- **Project Management**: Create and manage projects with team members
- **Task Management**: Create, assign, and track tasks within projects
- **Task Commenting**: Add comments to tasks for team collaboration
- **Authentication & Authorization**: JWT-based authentication with role support (Admin, Manager, Developer)
- **Status Tracking**: Track project and task progress through various status stages
- **Priority Levels**: Assign priority levels (Low, Medium, High) to tasks

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcrypt for password hashing, bcryptjs
- **Validation**: express-validator
- **CORS**: Cross-Origin Resource Sharing enabled
- **OTP**: OTP Generator for two-factor authentication support
- **HTTP Status**: http-status-codes for standardized responses

## 📦 Dependencies

### Core Dependencies

- `express` - Web framework
- `@prisma/client` - ORM for database
- `jsonwebtoken` - JWT token generation and validation
- `bcrypt` / `bcryptjs` - Password hashing
- `cors` - CORS middleware
- `dotenv` - Environment variable management
- `express-validator` - Request validation
- `axios` - HTTP client
- `lodash` - Utility library
- `common-microservices-utils` - Shared utilities

### Dev Dependencies

- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution for Node
- `nodemon` - Development server auto-reload
- `prisma` - Prisma CLI
- Type definitions for all major dependencies

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MySQL database
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Task-Manager-Backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory with the following variables:

   ```env
   # Database
   DATABASE_URL="mysql://username:password@localhost:3306/task_management"

   # Server
   PORT=3000

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRY=7d
   JWT_REFRESH_EXPIRY=30d

   # CORS
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev --name init
   ```

   Or if you already have migrations:

   ```bash
   npx prisma migrate deploy
   ```

5. **Verify Prisma setup**
   ```bash
   npx prisma studio
   ```

## ▶️ Running the Application

### Development Mode

```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3000) and will automatically reload on file changes thanks to nodemon.

### Production Build

```bash
npm run build
node dist/index.js
```

## 📁 Project Structure

```
src/
├── index.ts                 # Application entry point
├── config/                  # Configuration files
│   ├── jwtConfig.ts        # JWT configuration
│   └── prisma.config.ts    # Prisma client configuration
├── constants/              # Application constants
│   └── app.constants.ts    # API endpoints and error messages
├── controller/             # Request handlers
│   ├── authController.ts
│   ├── userController.ts
│   ├── projectController.ts
│   ├── taskController.ts
│   └── commentController.ts
├── middleware/             # Express middleware
│   └── authMiddleware.ts   # JWT authentication middleware
├── repositories/           # Data access layer
│   ├── baseRepository.ts   # Base repository with common methods
│   ├── userRepository.ts
│   ├── projectRepository.ts
│   ├── taskRepository.ts
│   └── commentRepository.ts
├── routes/                 # API route definitions
│   ├── auth.routes.ts
│   ├── user.route.ts
│   ├── project.routes.ts
│   ├── task.route.ts
│   └── comment.routes.ts
├── services/               # Business logic layer
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── project.service.ts
│   ├── task.service.ts
│   └── comment.service.ts
└── utils/                  # Utility functions
    ├── helper.ts           # General helper functions
    ├── jwtUtil.ts          # JWT utility functions
    └── passwordUtil.ts     # Password hashing utilities

prisma/
├── schema.prisma          # Database schema definition
└── migrations/            # Database migration files
```

## 📊 Database Schema

### Core Models

**User**

- Unique user identification and authentication
- Role-based access control (ADMIN, MANAGER, DEVELOPER)
- Token management for authentication

**Project**

- Project creation and management
- Status tracking (PLANNED, ACTIVE, COMPLETED, ON_HOLD)
- Project-to-team member associations

**ProjectTask**

- Task creation and assignment
- Priority levels (LOW, MEDIUM, HIGH)
- Status tracking (TODO, IN_PROGRESS, REVIEW, COMPLETED)
- Support for multiple assignees

**Comment**

- Task-specific discussions
- User identification and timestamps

**ProjectMember & TaskUser**

- Many-to-many relationships for project and task assignments

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Login**: Send credentials to get access and refresh tokens
2. **Protected Routes**: Include the access token in the Authorization header
   ```
   Authorization: Bearer <access_token>
   ```
3. **Token Refresh**: Use the refresh token to obtain a new access token

## 🏗️ Architecture

The application follows a **layered architecture pattern**:

1. **Routes Layer**: Defines API endpoints
2. **Controller Layer**: Handles HTTP requests and responses
3. **Service Layer**: Contains business logic
4. **Repository Layer**: Data access and database operations
5. **Middleware**: Cross-cutting concerns like authentication

## 🔄 API Endpoints Overview

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token

### Users

- `GET /users` - Get all users (admin only)
- `GET /users/:id` - Get user details
- `PUT /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user (admin only)

### Projects

- `GET /projects` - List all projects
- `POST /projects` - Create new project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `POST /projects/:id/members` - Add team member
- `DELETE /projects/:id/members/:userId` - Remove team member

### Tasks

- `GET /projects/:projectId/tasks` - List project tasks
- `POST /projects/:projectId/tasks` - Create new task
- `GET /tasks/:id` - Get task details
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/assign` - Assign task to user

### Comments

- `GET /tasks/:taskId/comments` - List task comments
- `POST /tasks/:taskId/comments` - Add comment
- `PUT /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment

## 🧪 Testing

To test the API, you can use tools like:

- **Postman**: Import API collection for testing
- **Thunder Client**: VS Code extension for API testing
- **cURL**: Command-line testing

Example:

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get projects (with token)
curl -X GET http://localhost:3000/projects \
  -H "Authorization: Bearer <access_token>"
```

## 📝 Environment Variables Reference

| Variable             | Description                          | Default               |
| -------------------- | ------------------------------------ | --------------------- |
| `DATABASE_URL`       | MySQL connection string              | Required              |
| `PORT`               | Server port                          | 3000                  |
| `JWT_SECRET`         | Secret key for JWT signing           | Required              |
| `JWT_EXPIRY`         | Access token expiration time         | 7d                    |
| `JWT_REFRESH_EXPIRY` | Refresh token expiration time        | 30d                   |
| `CORS_ORIGIN`        | Allowed CORS origin                  | http://localhost:3000 |
| `NODE_ENV`           | Environment (development/production) | development           |

## 🐛 Common Issues & Troubleshooting

### Database Connection Error

- Verify `DATABASE_URL` in `.env` is correct
- Ensure MySQL server is running
- Check database name exists and user has permissions

### JWT Token Errors

- Ensure `JWT_SECRET` is set in `.env`
- Verify token format: `Bearer <token>`
- Check token expiration

### Prisma Issues

- Run `npx prisma generate` to regenerate Prisma client
- Run `npx prisma migrate deploy` to apply pending migrations
- Clear `.next` and `node_modules` if facing issues, then reinstall

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [JWT Introduction](https://jwt.io/introduction)

## 📄 License

ISC

## 👤 Author

Created as part of the Task Management System project.

---

For questions or issues, please create an issue in the repository or contact the development team.
