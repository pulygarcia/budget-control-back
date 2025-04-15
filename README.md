# Budget Administration MVC Rest Services 🧾💰

This is a RESTful backend for a budget and expense management application. It allows users to register, manage their income and expenses, and organize financial data efficiently. The project includes a secure authentication system, email notifications, testing, constant verification in actions execution and more.

## 🚀 Made with

- [Express](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Sequelize](https://sequelize.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Jest](https://jestjs.io/)

## 🧩 Features

- ✅ **Secure Authentication System**  
  Includes user registration, login, email confirmation, and JWT-based session handling. Unauthorized or unauthenticated users are restricted from accessing protected resources or performing actions.
  
- 📥 User registration and login with password hashing
- 📧 Email confirmation to activate user accounts
- 📧 Email sending when forgot password or change password option
- 🔐 JWT authentication for secure routes
- 💰 Budget, income, and expense management
- 🧪 Full test coverage
- ❌ Custom error handling
- ✅ Data validation

## ⚙️ Environment Variables
To run this project, create a `.env` file in the root directory and include the following:
DB_URL=yourDBurl

NODEMAILER_HOST=yourNMhost
NODEMAILER_USER=user
NODEMAILER_PASSWORD=pwexample
NODEMAILER_PORT=000

PRIVATE_KEY_JWT=example123

## 🛠️ Installation & Setup
<pre> ```npm i``` </pre>
<pre> ```npm run dev``` </pre>

## 🛠️ Run tests
<pre> ```npm test``` </pre>


