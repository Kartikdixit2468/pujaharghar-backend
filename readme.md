# PoojaOne Backend API

**Version:** V1.0.2

A comprehensive backend API for the PoojaOne platform - a digital solution for booking religious ceremonies and connecting users with professional priests.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Database Setup](#database-setup)
- [Related Repositories](#related-repositories)
- [Author](#author)

---

## 🎯 Overview

PoojaOne Backend is a Node.js/Express-based REST API that powers the PoojaOne application. It handles user authentication, puja bookings, priest management, payment processing, OTP verification, and customer support ticketing. This backend API is designed to work seamlessly with the [PoojaOne Frontend](https://github.com/kartikdixit2468/poojaone-mobile-app/).

---

## ✨ Features

### 1. **User Management**
- User registration and authentication
- JWT-based authentication & authorization
- User profile management
- Email verification
- Manual and automated authentication flows

### 2. **Puja Services**
- Browse available pujas (religious ceremonies)
- View detailed puja information
- Search and filter pujas by category
- Manage puja packages and pricing

### 3. **Priest Management**
- Priest profile creation and management
- Priest availability tracking
- Priest ratings and reviews
- Priest specialization management

### 4. **Booking System**
- Create and manage puja bookings
- Real-time booking status tracking
- Booking history for users
- Date and time slot management

### 5. **Payment Processing**
- Integration with Razorpay payment gateway
- Secure payment processing
- Multiple payment methods support
- Transaction history and receipts

### 6. **OTP Verification**
- SMS-based OTP generation and verification
- Email-based OTP delivery
- OTP expiration management
- Security validation

### 7. **Email Verification**
- Email verification system
- Verification link generation
- Automated email notifications
- Email templates support

### 8. **Support Ticketing System**
- Create support tickets for issues
- Ticket categorization (booking, payment, general)
- Ticket status tracking (Open/Closed)
- Link tickets to specific bookings
- User ticket history

### 9. **File Management**
- Upload and manage category images
- Manage priest profile images
- Store puja-related images
- Static file serving

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | Latest | Runtime environment |
| Express.js | 5.1.0 | Web framework |
| MySQL | - | Database |
| JWT | 9.0.2 | Authentication |
| Razorpay | 2.9.6 | Payment processing |
| Nodemailer | 7.0.12 | Email notifications |
| Axios | 1.8.4 | HTTP requests |
| CORS | 2.8.5 | Cross-origin requests |
| Dotenv | 16.5.0 | Environment variables |
| Nodemon | 3.1.9 | Development server |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js                          # Express app configuration
│   ├── server.js                       # Server entry point
│   ├── config/
│   │   └── db.js                       # Database connection setup
│   ├── middlewares/
│   │   └── validateAuthToken.js        # JWT validation middleware
│   ├── routes/
│   │   ├── client_routes_refactored.js # Client/user endpoints
│   │   ├── service_routes.js           # Service provider endpoints
│   │   ├── payment_routes.js           # Payment endpoints
│   │   ├── ticket_routes.js            # Support ticket endpoints
│   │   ├── otp_routes.js               # OTP endpoints
│   │   └── email_verification_routes.js # Email verification endpoints
│   ├── services/
│   │   ├── userService.js              # User business logic
│   │   ├── pujaService.js              # Puja business logic
│   │   ├── packageService.js           # Package business logic
│   │   ├── priestService.js            # Priest business logic
│   │   ├── bookingService.js           # Booking business logic
│   │   ├── paymentService.js           # Payment business logic
│   │   ├── otpService.js               # OTP business logic
│   │   ├── email_verification.js       # Email verification logic
│   │   └── ticketService.js            # Ticket business logic
│   ├── utils/
│   │   ├── dateUtils.js                # Date/time utilities
│   │   ├── tokenUtils.js               # Token generation & validation
│   │   └── userValidation.js           # User input validation
│   └── uploads/                        # File storage directory
│       ├── category/                   # Category images
│       ├── priest/                     # Priest profile images
│       └── pujas/                      # Puja images
├── package.json                        # Project dependencies
├── .env                                # Environment variables
└── readme.md                           # This file
```

---

## 📋 Prerequisites

Before setting up the backend, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MySQL** (v5.7 or higher) - [Download here](https://dev.mysql.com/downloads/mysql/)
- **Git** - [Download here](https://git-scm.com/)
- **Postman** (optional, for API testing) - [Download here](https://www.postman.com/)

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/kartikdixit2468/poojaone-mobile-app.git
cd poojaone-backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`:
- express
- mysql2
- jsonwebtoken
- razorpay
- nodemailer
- cors
- dotenv
- axios
- nodemon (dev dependency)

### Step 3: Create MySQL Database

Connect to your MySQL server and create the database:

```sql
CREATE DATABASE poojaone;
USE poojaone;
```

Then, create the necessary tables. Here are the main tables:

**Users Table:**
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(255),
  password VARCHAR(255),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Pujas Table:**
```sql
CREATE TABLE pujas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Bookings Table:**
```sql
CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  puja_id INT NOT NULL,
  priest_id INT,
  booking_date DATE,
  booking_time TIME,
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (puja_id) REFERENCES pujas(id)
);
```

**Priests Table:**
```sql
CREATE TABLE priests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(15),
  specialization VARCHAR(255),
  experience INT,
  image_url VARCHAR(255),
  rating DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Tickets Table:**
```sql
CREATE TABLE tickets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  booking_id INT,
  status TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔧 Environment Configuration

### Step 4: Create `.env` File

In the root directory, create a `.env` file and add the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=poojaone
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=24h

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@poojaone.com

# OTP Configuration
OTP_EXPIRATION=10
OTP_LENGTH=6

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# API Base URL
API_BASE_URL=http://localhost:5000
```

**Important Notes:**
- Replace `your_password` with your MySQL password
- Generate a strong `JWT_SECRET` using `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- For Gmail, use an [App Password](https://myaccount.google.com/apppasswords) instead of your regular password
- Get Razorpay credentials from [Razorpay Dashboard](https://dashboard.razorpay.com/)

---

## ▶️ Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

This will start the server with Nodemon, which automatically restarts the server when you make changes to the code.

**Expected Output:**
```
Server is running on port 5000
Database connected successfully
```

### Production Mode

```bash
node src/server.js
```

### Testing the Server

Once the server is running, you can test it:

**Using cURL:**
```bash
curl http://localhost:5000/
```

**Using Postman:**
1. Open Postman
2. Create a new request
3. Set method to GET
4. Enter URL: `http://localhost:5000/`
5. Click Send

**Expected Response:**
```json
{
  "message": "Awesome!"
}
```

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Client Routes (`/api/client`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/register/user` | Register new user |
| POST | `/login/user` | User login |
| GET | `/profile` | Get user profile (Protected) |
| GET | `/pujas` | Get all pujas |
| GET | `/pujas/:id` | Get puja details |
| GET | `/priests` | Get all priests |
| POST | `/bookings` | Create booking (Protected) |
| GET | `/bookings` | Get user bookings (Protected) |
| GET | `/bookings/:id` | Get booking details (Protected) |

### Payment Routes (`/api/payment`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create-order` | Create Razorpay order |
| POST | `/verify-payment` | Verify payment (Protected) |
| GET | `/history` | Get payment history (Protected) |

### Support Tickets (`/api/tickets`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create` | Create support ticket (Protected) |
| GET | `/user/all` | Get user tickets (Protected) |
| GET | `/:id` | Get ticket details (Protected) |
| PUT | `/:id/close` | Close ticket (Protected) |

### OTP Routes (`/api/otp`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/send` | Send OTP |
| POST | `/verify` | Verify OTP |

### Email Verification (`/api/verify-email`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/send` | Send verification email |
| GET | `/verify/:token` | Verify email with token |

---

## 🗄️ Database Setup Details

### Connection Configuration

The database connection is configured in [src/config/db.js](src/config/db.js). It uses the `mysql2` package to create a connection pool for better performance.

**Key Features:**
- Connection pooling for efficient resource management
- Support for multiple simultaneous connections
- Automatic reconnection on connection loss
- Query execution with prepared statements for security

### Database Tables

The application uses the following main tables:

1. **users** - User account information
2. **pujas** - Available puja services
3. **priests** - Priest profile information
4. **bookings** - Puja booking records
5. **payments** - Payment transaction records
6. **tickets** - Support ticket records
7. **otp_requests** - OTP verification records
8. **email_verifications** - Email verification records

---

## 🔐 Authentication

The API uses **JWT (JSON Web Token)** for secure authentication.

### How JWT Works:

1. **Login**: User provides credentials
2. **Token Generation**: Server creates a JWT token
3. **Token Storage**: Client stores the token
4. **Authenticated Requests**: Client sends token in `Authorization` header
5. **Token Validation**: Server validates token before processing request

### Using Protected Endpoints:

Include the JWT token in your request headers:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/api/client/profile
```

In Postman:
1. Go to the `Authorization` tab
2. Select `Bearer Token` as type
3. Paste your JWT token
4. Click Send

---

## 📧 Email & Notification System

### Nodemailer Configuration

The application uses **Nodemailer** for sending emails:

- **Email Verification**: Sends verification links to new users
- **OTP Notifications**: Sends one-time passwords via email
- **Booking Confirmations**: Sends confirmation emails after bookings
- **Support Responses**: Sends responses to support tickets

### Supported Email Providers:

- Gmail
- Outlook
- Custom SMTP servers

---

## 💳 Payment Integration

### Razorpay Integration

The API integrates with **Razorpay** for secure payment processing:

1. **Order Creation**: Create payment orders
2. **Payment Processing**: Securely process payments
3. **Payment Verification**: Verify payment authenticity
4. **Transaction Records**: Store and retrieve payment history

### Payment Flow:

1. Client creates booking
2. Server creates Razorpay order
3. Client completes payment
4. Server verifies payment signature
5. Booking status updated to confirmed

---

## 🐛 Troubleshooting

### Common Issues:

**Issue: "Cannot connect to database"**
- Ensure MySQL is running
- Check DB_HOST, DB_USER, DB_PASSWORD in `.env`
- Verify database exists: `SHOW DATABASES;`

**Issue: "JWT token error"**
- Token might be expired
- Token might be malformed
- Ensure correct Authorization header format

**Issue: "Email not sending"**
- Verify EMAIL_USER and EMAIL_PASSWORD in `.env`
- For Gmail, use App Password instead of regular password
- User currently can only send mail through his local device, not with the cloud services, 
- [Alternatives that you can prefer instead of gmail as a service] - render , 2factor, msg91 more....
- Enable "Less secure app access" if needed

---

## 🔗 Related Repositories

This backend API is designed to work with:

- **Frontend Application**: [https://github.com/kartikdixit2468/poojaone-mobile-app/](https://github.com/kartikdixit2468/poojaone-mobile-app/)

---

## 📝 More API Documentation

- [TICKET_SYSTEM_API.md](TICKET_SYSTEM_API.md) - Support ticket system API details
- [TICKET_IMPLEMENTATION_SUMMARY.md](TICKET_IMPLEMENTATION_SUMMARY.md) - Implementation summary

---

## 📄 License

This project is licensed under the ISC License - see [package.json](package.json) for details.

---

## 👨‍💻 Author

**Kartik Dixit**

- GitHub: [@Kartikdixit2468](https://github.com/Kartikdixit2468)
- Repository: [poojaone-backend](https://github.com/Kartikdixit2468/poojaone-backend)

---

## 📞 Support

For issues, bugs, or feature requests, please open an issue on [GitHub Issues](https://github.com/kartikdixit2468/poojaone-mobile-app/issues).

---

## 🎉 Thank You

**Happy Coding!** 🚀
