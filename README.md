# 🎬 IMovies - Full-Stack MERN Cinema & Ticket Booking System

A production-ready, full-stack cinema and ticket management system built on the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) with real-time **Socket.io** seat locking, role-based JWT authentication, digital e-tickets, and an intuitive dark-themed cinema UI.

---

## 🌟 Key Highlights & Features

- **⚡ Real-Time Seat Locking & Availability (Socket.io)**: Interactive theater seating map with instant seat hold countdowns. Prevents double-bookings across concurrent sessions.
- **🛡️ Role-Based Security (JWT + bcryptjs)**: Protected user routes and admin control dashboard. Rate-limited authentication and API endpoints.
- **🍿 Multidimensional Movie Search & Filters**: Search movies by title, director, or cast, with instant filters by genre, language, theatre, city location, and date.
- **🎟️ Ticket Booking & Simulated Gateway**: Complete checkout experience supporting Credit/Debit cards, UPI QR scanning, and Net Banking, plus promo code verification.
- **📱 Digital Cinema Pass (E-Ticket)**: Perforated cinema pass design with printable layout, unique Booking ID, allocated seats, transaction hash, and verifiable QR code.
- **🔄 Booking Management & Instant Cancellation**: View upcoming and past bookings, cancel tickets with automated refund calculations and real-time seat releases.
- **⚙️ Full Admin Management Panel**: Comprehensive CRUD controls for Movie titles, Cinema Theatres & auditoriums, Showtime scheduling with tiered pricing (Silver, Gold, Platinum, VIP Recliner), and customer booking records.
- **🔔 Real-Time Notifications**: Instant in-app alerts on booking confirmation, cancellations, and cinema announcements.
- **🚀 Dual Database Capability**: Works seamlessly with live **MongoDB / MongoDB Atlas** or runs instantly out-of-the-box using the built-in High-Fidelity Data Store if MongoDB is not locally running yet.

---

## 🏗️ System Architecture

```
imovies-cinema-system/
├── server/
│   ├── config/
│   │   └── db.js                 # Database connection & auto-fallback handler
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile management
│   │   ├── movieController.js    # Movie catalog, search, filter, CRUD
│   │   ├── theatreController.js  # Theatres, screens, cities, amenities
│   │   ├── showController.js     # Show scheduling, 80-seat grid generation
│   │   ├── bookingController.js  # Booking creation, my bookings, cancellations
│   │   ├── paymentController.js  # Payment authorization & simulation
│   │   ├── notificationController.js # Notifications and read state
│   │   └── adminController.js    # Dashboard analytics and revenue metrics
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & role authorization (Admin)
│   │   ├── rateLimiter.js        # Express rate limiting
│   │   └── errorHandler.js       # Centralized error handling
│   ├── models/
│   │   ├── User.js               # User accounts (User, Admin)
│   │   ├── Movie.js              # Movies schema with text indexes
│   │   ├── Theatre.js            # Theatres, screens, amenities
│   │   ├── Show.js               # Showtimes, seat maps, pricing tiers
│   │   ├── Booking.js            # Customer bookings & transaction links
│   │   ├── Payment.js            # Payment audit log
│   │   └── Notification.js       # In-app notifications
│   ├── sockets/
│   │   └── seatSocket.js         # Socket.io seat lock/release synchronization
│   ├── utils/
│   │   ├── mockStore.js          # In-memory data store for zero-config demo
│   │   └── seedData.js           # Live MongoDB seed script
│   ├── .env                      # Server configuration
│   ├── package.json              # Server dependencies & scripts
│   ├── server.js                 # Express server & Socket.io entry point
│   └── test_e2e.js               # Automated 10-point E2E verification suite
├── client/
│   ├── public/                   # Static assets & favicon
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosConfig.js    # Axios instance with JWT interceptor
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation bar, city selector, notifications
│   │   │   ├── Footer.jsx        # Cinema branding and stack badges
│   │   │   ├── MovieCard.jsx     # Movie poster card with rating & tags
│   │   │   ├── SeatGrid.jsx      # Interactive theater seat map with real-time socket
│   │   │   ├── NotificationDropdown.jsx # Real-time notification menu
│   │   │   └── ProtectedRoute.jsx# Auth and Admin route guards
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Authentication context & persistent tokens
│   │   │   └── SocketContext.jsx # Socket.io connection context
│   │   ├── redux/
│   │   │   ├── store.js          # Redux Toolkit store
│   │   │   └── slices/
│   │   │       ├── movieSlice.js # Movie catalog & filter state
│   │   │       └── bookingSlice.js # Active show, seats grid, pricing
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Hero blockbuster showcase, search, now showing
│   │   │   ├── MovieList.jsx     # Catalog with multi-parameter filter
│   │   │   ├── MovieDetails.jsx  # Synopsis, trailer, date tabs, theatre showtimes
│   │   │   ├── SeatBooking.jsx   # Real-time seat selection & price summary
│   │   │   ├── Checkout.jsx      # Payment options, promo code, card authorization
│   │   │   ├── BookingSuccess.jsx# Digital Cinema Pass with QR code & print
│   │   │   ├── UserDashboard.jsx # Upcoming tickets, cancel booking, profile
│   │   │   ├── Login.jsx         # Sign in with 1-click demo autofill
│   │   │   ├── Register.jsx      # New account registration
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx # Revenue metrics & recent bookings
│   │   │       ├── ManageMovies.jsx   # Movie CRUD
│   │   │       ├── ManageTheatres.jsx # Cinema theatre CRUD
│   │   │       ├── ManageShows.jsx    # Schedule showtimes & tier pricing
│   │   │       └── ManageBookings.jsx # View and manage all bookings
│   │   ├── App.jsx               # React Router configuration
│   │   ├── App.css               # Cinema dark theme & seat glow styles
│   │   └── main.jsx              # Application bootstrap & providers
│   ├── package.json              # Client dependencies (React 18, Vite, Bootstrap)
│   └── vite.config.js            # Vite build & proxy configuration
└── package.json                  # Root orchestration scripts
```

---

## 💻 System Requirements

### Software Requirements
- **Node.js**: v16 or above (Tested on Node.js v24)
- **npm**: v8 or above
- **MongoDB**: MongoDB Community Server v6+ or MongoDB Atlas (optional for live database; automatic zero-setup fallback provided)
- **Web Browser**: Google Chrome, Mozilla Firefox, or Microsoft Edge (modern Chromium)

### Hardware Requirements
- **Processor**: Intel Core i5 (8th Gen+) or AMD Ryzen 5+
- **RAM**: Minimum 8 GB (16 GB recommended)
- **Storage**: At least 1 GB free space
- **Display**: 1366x768 resolution or higher

---

## ⚡ Quick Start Guide

### 1. Start the Backend Server
```bash
cd server
npm install
npm start
```
The server will start on `http://localhost:5000`.

### 2. Start the Frontend Application
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🔑 Demo Accounts

For fast testing and grading, pre-configured accounts are provided with **1-Click Autofill** on the Login page:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@imovies.com` | `Admin@123` | Full access to Admin Panel, Revenue Analytics, Movie CRUD, Theatre CRUD, Show Scheduling, All Bookings |
| **Regular User** | `user@imovies.com` | `User@123` | Browse catalog, select seats, book passes, cancel bookings, view booking history |

---

## 🧪 Automated End-to-End Testing

An automated verification test script is included to validate the entire workflow (Authentication, Search, Seat Maps, Booking, Cancellation, and Admin metrics):

```bash
cd server
node test_e2e.js
```

### Verification Checklist Output:
- `[PASS] 1. API Health Check -> Status: 200 (healthy)`
- `[PASS] 2. User Registration -> Status: 201`
- `[PASS] 3. User Authentication -> Token received`
- `[PASS] 4. Movie Catalog -> Filtered now-showing films`
- `[PASS] 5. Show Schedules -> Active shows retrieved`
- `[PASS] 6. Real-Time Seat Map -> Available auditorium seats verified`
- `[PASS] 7. Ticket Booking & Payment -> Reference ID generated`
- `[PASS] 8. Booking History -> User upcoming bookings verified`
- `[PASS] 9. Ticket Cancellation & Refund -> Refund recorded, seats released`
- `[PASS] 10. Admin Analytics -> Dashboard revenue and metrics validated`

---

## 📡 API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /register`: Register a new user
- `POST /login`: Authenticate and receive JWT token
- `GET /me`: Get logged-in user profile (Protected)
- `PUT /profile`: Update name and phone (Protected)

### Movies (`/api/movies`)
- `GET /`: Search & filter movies (by keyword, genre, language, city, date, sort, pagination)
- `GET /meta/filters`: Get list of unique genres, languages, and cities
- `GET /:id`: Movie details with scheduled showtimes grouped by theatre
- `POST /`: Add a new movie (Admin Only)
- `PUT /:id`: Update movie details (Admin Only)
- `DELETE /:id`: Delete movie and its shows (Admin Only)

### Shows (`/api/shows`)
- `GET /`: List shows (filtered by movieId, theatreId, date)
- `GET /:id`: Single show with 80-seat real-time seating grid & expired lock cleanup
- `POST /`: Schedule a show with customized Silver, Gold, Platinum, VIP pricing (Admin Only)
- `DELETE /:id`: Remove scheduled show (Admin Only)

### Theatres (`/api/theatres`)
- `GET /`: List all theatres (optionally filtered by city)
- `GET /:id`: Theatre details and active shows
- `POST /`: Create cinema theatre (Admin Only)
- `PUT /:id`: Edit theatre (Admin Only)
- `DELETE /:id`: Delete theatre (Admin Only)

### Bookings (`/api/bookings`)
- `POST /`: Create booking, process payment, reserve seats, send notification, broadcast via Socket.io (Protected)
- `GET /my-bookings`: User's upcoming and past bookings (Protected)
- `GET /:id`: Detailed ticket pass with QR code (Protected)
- `PUT /:id/cancel`: Cancel booking, issue refund, release seats in real-time (Protected)
- `GET /admin/all`: List all system bookings with search & status filters (Admin Only)

### Admin Analytics (`/api/admin`)
- `GET /stats`: Total bookings, gross revenue, tickets sold, active movies, theatres, recent bookings (Admin Only)

---

## 🔒 Security Best Practices Implemented

- **Password Hashing**: Strong salting and hashing with `bcryptjs`.
- **JWT Authentication**: Encrypted JSON Web Tokens with 7-day expiration.
- **Express Rate Limiting**: Mitigates brute-force attacks on authentication and API routes.
- **Role Verification**: Middleware checks role `'admin'` on sensitive endpoints.
- **Seat Lock Concurrency**: Atomic checks ensure a seat cannot be locked or purchased by two users simultaneously.
