# 🏪 StoreRating - Store Rating & Management System

A comprehensive full-stack web application for managing stores and collecting user ratings with role-based access control and administrative features.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

StoreRating is a modern web application designed to facilitate store management and customer feedback collection. The platform supports multiple user roles with distinct capabilities, from basic users who can rate stores to administrators who manage the entire system.

### Key Highlights

- **Role-Based Access Control**: Three distinct user roles with tailored permissions
- **Real-Time Rating System**: Interactive star-based rating with instant feedback  
- **Comprehensive Admin Dashboard**: Complete user and store management capabilities
- **Responsive Design**: Mobile-first approach with dark mode support
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **RESTful API**: Well-documented API endpoints for all operations

## ✨ Features

### 👤 User Management
- **User Registration & Login**: Secure authentication with email verification
- **Profile Management**: Users can update personal information (name, email, address, password)
- **Role-Based Access**: Differentiated access levels for admin, store owner, and regular users

### 🏪 Store Management
- **Store Creation**: Store owners can create and manage their own stores
- **Store Discovery**: Browse and search stores with advanced filtering
- **Store Information**: Comprehensive store details including contact and location data

### ⭐ Rating System
- **Interactive Ratings**: Star-based rating system (1-5 stars)
- **Rating Management**: Users can view, edit, and delete their own ratings
- **Store Analytics**: Average ratings and rating distribution for stores

### 🔧 Administrative Features
- **User Management**: Admins can create, update, and delete user accounts
- **Store Oversight**: Complete store management including owner assignment
- **System Analytics**: Dashboard with comprehensive statistics and insights
- **Data Export**: Export capabilities for reports and analytics

### 🎨 User Experience
- **Modern UI/UX**: Clean, intuitive interface built with Tailwind CSS
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-Time Feedback**: Instant notifications and loading states

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern JavaScript library for building user interfaces
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **React Hook Form** - Performant, flexible forms with easy validation
- **React Hot Toast** - Lightweight toast notifications
- **Lucide React** - Beautiful & consistent icon library
- **Axios** - Promise-based HTTP client for API requests

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **PostgreSQL** - Robust, SQL-compliant relational database
- **JWT (JSON Web Tokens)** - Secure authentication mechanism
- **bcryptjs** - Password hashing library
- **Express Validator** - Middleware for input validation
- **CORS** - Cross-origin resource sharing support
- **Helmet** - Security middleware for Express apps

### Development Tools
- **Nodemon** - Development server with auto-restart
- **Morgan** - HTTP request logger middleware
- **dotenv** - Environment variable management
- **ESLint** - Code linting and formatting

## 📋 Prerequisites

Before installing, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **PostgreSQL** (v12.0 or higher)
- **Git** (for cloning the repository)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/storerating.git
cd storerating
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Install Morgan Package
npm install morgan
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 4. Database Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
createdb -U postgres store_rating_system

# Load Database Schema
psql -U vedan -d store_rating_system -f database/schema.sql
```

### 5. Database Schema

Run the following SQL commands to create the required tables:

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  address TEXT,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'store_owner', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores table
CREATE TABLE stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  address TEXT,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ratings table
CREATE TABLE ratings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, store_id)
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_ratings_store_id ON ratings(store_id);
```

## ⚙️ Configuration

### Backend Environment Variables (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=storerating_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Frontend Environment Variables (.env)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# App Configuration
REACT_APP_NAME=StoreRating
REACT_APP_VERSION=1.0.0
```

## 🏃‍♂️ Usage

### Start the Application

1. **Start Backend Server**
```bash
cd backend
npm run dev
```

2. **Start Frontend Development Server**
```bash
cd frontend
npm start
```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

### Default Admin Account

Create an admin account by registering with role 'admin' or update an existing user:

```sql
UPDATE users SET role = 'Admin@123' WHERE email = 'admin@storerating.com';
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/auth/me` | Get current user | Private |
| POST | `/api/auth/logout` | User logout | Private |

### User Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/users` | Get all users | Admin |
| POST | `/api/users` | Create new user | Admin |
| PATCH | `/api/users/profile` | Update own profile | User |
| GET | `/api/users/dashboard-stats` | Get dashboard stats | User |

### Store Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/stores` | Get all stores | User |
| POST | `/api/stores` | Create store | Admin |
| POST | `/api/stores/create-own` | Create own store | Store Owner |
| GET | `/api/stores/my-stores` | Get own stores | Store Owner |
| PATCH | `/api/stores/:id/update` | Update own store | Store Owner |

### Rating Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/ratings` | Submit rating | User |
| GET | `/api/ratings/my-ratings` | Get own ratings | User |
| GET | `/api/ratings` | Get all ratings | Admin |
| DELETE | `/api/ratings/:id` | Delete rating | User/Admin |

### Admin Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| PATCH | `/api/admin/users/:id` | Update any user | Admin |
| DELETE | `/api/admin/users/:id` | Delete any user | Admin |
| PATCH | `/api/admin/stores/:id` | Update any store | Admin |
| DELETE | `/api/admin/stores/:id` | Delete any store | Admin |

## 👥 User Roles

### 🔵 Regular User
- Browse and search stores
- Rate stores (1-5 stars)
- View and manage own ratings
- Update personal profile (except role)

### 🟡 Store Owner
- All regular user capabilities
- Create and manage own stores
- View ratings for owned stores
- Update store information

### 🔴 Administrator
- Full system access and control
- Manage all users and stores
- View system-wide analytics
- Delete any user or store
- Assign and modify user roles

## 🗄️ Database Schema

### Users Table
```sql
- id: Primary key (SERIAL)
- name: Full name (VARCHAR 255)
- email: Unique email (VARCHAR 255)
- password: Hashed password (VARCHAR 255)
- address: User address (TEXT)
- role: User role (ENUM: user, store_owner, admin)
- created_at: Creation timestamp
- updated_at: Last update timestamp
```

### Stores Table
```sql
- id: Primary key (SERIAL)
- name: Store name (VARCHAR 255)
- email: Store email (VARCHAR 255)
- address: Store address (TEXT)
- owner_id: Foreign key to users table
- created_at: Creation timestamp
- updated_at: Last update timestamp
```

### Ratings Table
```sql
- id: Primary key (SERIAL)
- user_id: Foreign key to users table
- store_id: Foreign key to stores table
- rating: Rating value (INTEGER 1-5)
- created_at: Creation timestamp
- updated_at: Last update timestamp
- UNIQUE constraint on (user_id, store_id)
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds for password security
- **Input Validation**: Comprehensive validation using express-validator
- **CORS Protection**: Configured cross-origin resource sharing
- **Rate Limiting**: API rate limiting to prevent abuse
- **Helmet Security**: Security headers and protection middleware
- **SQL Injection Prevention**: Parameterized queries with PostgreSQL
- **XSS Protection**: Input sanitization and output encoding

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

### API Testing with Postman
Import the provided Postman collection from `/docs/postman-collection.json`

## 📦 Production Deployment

### Backend Deployment

1. **Build for Production**
```bash
npm run build
```

2. **Environment Configuration**
```bash
export NODE_ENV=production
export DATABASE_URL=your-production-db-url
export JWT_SECRET=your-production-jwt-secret
```

3. **Start Production Server**
```bash
npm start
```

### Frontend Deployment

1. **Build for Production**
```bash
npm run build
```

2. **Deploy to Static Hosting**
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - GitHub Pages

## 🤝 Contributing

We welcome contributions to StoreRating! Please follow these steps:

1. **Fork the Repository**
```bash
git fork https://github.com/yourusername/storerating.git
```

2. **Create Feature Branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Commit Changes**
```bash
git commit -m "Add amazing feature"
```

4. **Push to Branch**
```bash
git push origin feature/amazing-feature
```

5. **Open Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Write comprehensive tests for new features
- Update documentation for API changes
- Use meaningful commit messages
- Ensure all tests pass before submitting PR


## 🚀 Quick Start Commands

```bash
# Clone and setup
git clone https://github.com/yourusername/storerating.git
cd storerating

# Backend setup
cd backend && npm install && cp .env.example .env
npm run dev

# Frontend setup (new terminal)
cd frontend && npm install && cp .env.example .env
npm start

# Access application
open http://localhost:3000
```
