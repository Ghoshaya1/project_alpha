```
/patient-management-system
├── backend/                  # Backend API (Express.js + SQLite/PostgreSQL)
│   ├── models/               # Sequelize ORM Models
│   ├── routes/               # API Routes
│   ├── controllers/          # Business Logic Controllers
│   ├── middleware/           # Authentication & Role Guards
│   ├── config/               # Database & Environment Configs
│   ├── server.js             # Main Express API Server
│   ├── package.json          # Backend Dependencies
│
├── frontend/                 # Frontend (Express.js + EJS)
│   ├── views/                # EJS Templates (Login, Dashboard, Radiology)
│   ├── routes/               # View Rendering Routes
│   ├── public/               # Static Assets (CSS, Images, JS)
│   ├── app.js                # Express Frontend Server
│   ├── package.json          # Frontend Dependencies
│
├── README.md                 # Project Documentation
└── .env                      # Environment Variables
```
*** Phase 1 testing
{
    "message": "User registered",
    "user": {
        "id": "a186cd9f-ac90-4218-b318-ea8010619d3d",
        "name": "Dr. John Doe",
        "email": "doctor@example.com",
        "password": "$2a$10$uyaQOYJp/vkYww8WocBVGut3xeWGmtcgEfYveHcMlfTKoKzfn4Ukq",
        "role": "doctor"
    }
}

{
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMTg2Y2Q5Zi1hYzkwLTQyMTgtYjMxOC1lYTgwMTA2MTlkM2QiLCJyb2xlIjoiZG9jdG9yIiwiaWF0IjoxNzQxODE1NDc5LCJleHAiOjE3NDE5MDE4Nzl9.o0wB0WiuiuYH0shUf660BG27zJdeXPPvp4ThwppbeKg"
}