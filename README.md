# Leave Management System

A comprehensive leave management system built with Node.js, Express.js, and MongoDB.

## Features

- Employee Dashboard
- Leave Application Management
- Approval Workflow
- Leave Balance Management
- Admin/HR Panel
- Team Calendar
- Notifications & Alerts
- User Roles & Permissions

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd leave-management-service
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/leave_management
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
├── controllers/     # Request handlers
├── models/         # Database models
├── routes/         # API routes
├── middlewares/    # Custom middlewares
├── utils/          # Utility functions
├── index.js        # Application entry point
└── package.json    # Project dependencies
```

## API Documentation

API documentation will be available at `/api-docs` when the server is running.

## Testing

Run tests using:
```bash
npm test
```

## License

MIT 