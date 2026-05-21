# MealScan - MERN Stack

Transparent Mess & Canteen Billing System — converted from JSP/JDBC/Servlet to MERN Stack.

## Project Structure

```
mealscan/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js     # register, login, getMe
│   │   ├── user.controller.js     # getAllStudents, updateUser, deleteUser
│   │   └── record.controller.js   # createRecord, getStudentRecords, getContractorRecords,
│   │                              #   getMonthlyBill, deleteRecord, getContractorStats
│   ├── middlewares/
│   │   └── isAuth.js              # JWT auth middleware
│   ├── models/
│   │   ├── user.model.js          # User schema (STUDENT, MESS_CONTRACTOR, CANTEEN_CONTRACTOR)
│   │   └── record.model.js        # Record schema (MESS / CANTEEN)
│   ├── routes/
│   │   ├── auth.routes.js         # /api/auth
│   │   ├── user.routes.js         # /api/user
│   │   └── record.routes.js       # /api/record
│   ├── utils/
│   │   └── token.js               # JWT generate/verify
│   ├── .env
│   ├── index.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── SignIn.jsx
    │   │   ├── SignUp.jsx
    │   │   ├── StudentDashboard.jsx
    │   │   ├── ContractorDashboard.jsx
    │   │   ├── ContractorStats.jsx
    │   │   └── BillPage.jsx
    │   ├── redux/
    │   │   ├── store.js
    │   │   └── slices/userSlice.js
    │   ├── utils/
    │   │   └── axios.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── .env
    └── package.json
```

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, Vite, Redux Toolkit, Axios, React Router v7, Bootstrap 5 |
| Backend    | Node.js, Express 5, MongoDB, Mongoose, JWT, bcryptjs |
| Database   | MongoDB (replaces MySQL)            |

## API Endpoints

### Auth `/api/auth`
| Method | Route       | Description       |
|--------|-------------|-------------------|
| POST   | /register   | Register user     |
| POST   | /login      | Login             |
| GET    | /me         | Get current user  |

### User `/api/user`
| Method | Route         | Description            |
|--------|---------------|------------------------|
| GET    | /students     | Get all students       |
| GET    | /all          | Get all users          |
| PUT    | /:id          | Update user            |
| DELETE | /:id          | Delete user + records  |

### Record `/api/record`
| Method | Route        | Description                     |
|--------|--------------|---------------------------------|
| POST   | /            | Create record (contractor)      |
| GET    | /student     | Student's own records           |
| GET    | /contractor  | Contractor's uploaded records   |
| GET    | /bill        | Monthly bill (student)          |
| GET    | /stats       | Contractor stats                |
| DELETE | /:id         | Delete record (contractor)      |

## Setup & Run

### Backend
```bash
cd backend
npm install
# Edit .env: set MONGO_URI
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Default Demo Users (seed manually or via Postman)
- Student: student@mealscan.com / password123
- Mess: mess@mealscan.com / password123
- Canteen: canteen@mealscan.com / password123
