# StockNet — Full-Stack Application

A simple, session-based stock-trading demo where users can sign up, log in, manage funds, view prices, and buy/sell shares. **Front end**: React + React Router + MUI + Chart.js. **Back end**: Node/Express + `pg` + `express-session`. **DB**: PostgreSQL.

---

## ✨ Features

- **Auth (email + password)** with server-side sessions (cookies)
- **Forgot Password** via security questions (dropdown)
- **Funds**: deposit / withdraw, live account balance
- **Stocks**: today’s prices table; ticker detail chart (last 5 days)
- **Buy / Sell** flows with balance checks, position tracking
- **Transactions**: unified history (bought/sold, date, total price)
- **Chart**: Line chart of recent prices using Chart.js
- **Protected routes** (`ProtectedRoute`) via an `AuthContext`

---

## 🧱 Architecture

~~~text
client/                 # React app (Vite suggested), React Router, MUI
  src/
    components/
      Header.jsx
      Home.jsx
      Login.jsx
      ProtectedRoute.jsx
      Dropdown.jsx
      Funds.jsx
      Buy.jsx
      Sell.jsx
      Stocks.jsx
      StockChart.jsx
      UserStocks.jsx
      UserTransactions.jsx
      Validation.js
    styles/*.css         # referenced .css files
    context/AuthContext.jsx   (assumed)
server/
  index.js               # Express API shown in this README (port 3000)
  package.json
  .env                   # DB creds + session secret (recommended)
postgres/                # Local PostgreSQL instance/database
~~~

---

## 🛠️ Tech Stack

- **Frontend**: React, React Router, Axios, MUI, Chart.js
- **Backend**: Node.js, Express, `pg`, `cors`, `express-session`, `body-parser`
- **Database**: PostgreSQL

---

## Quick Start

### Prereqs
- Node.js 18+ and npm
- PostgreSQL 13+ running locally
- Recommended: `psql` CLI, `nodemon`

Install & run:

~~~bash
cd server
npm install
# optional: npm i -D nodemon
node index.js               # or: npx nodemon index.js
# -> "Server running on port 3000"
~~~

### Configure the Client

- Ensure your React app runs on `http://localhost:5173` (Vite default).
- **Important:** Cookies must be sent with Axios for session auth.

Create a tiny Axios bootstrap (e.g., `src/axios.js`):

~~~js
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.withCredentials = true; // send cookies on every request

export default axios;
~~~

Then import that singleton instead of `'axios'` directly:

~~~js
// example
import axios from './axios';
~~~

Install & run:

~~~bash
cd client
npm install
npm run dev
# -> http://localhost:5173
~~~

---

## 🔐 Auth & Session Flow

- **Login** (`POST /login`) sets a server session and a cookie (`connect.sid`).
- **Frontend** must send cookies on subsequent calls:
  - Either set `axios.defaults.withCredentials = true` globally (recommended), or
  - Pass `{ withCredentials: true }` per request.
- **Protected endpoints** use `ensureLoggedIn` which checks `req.session.userEmail`.
- **Funds/Withdraw** rely **only** on the session user; the `email` in the request body is ignored.

---

## 📡 API Reference

**Base URL:** `http://localhost:3000`

### Auth

- **POST `/signup`**  
  Body: `{ fname, lname, email, password, question, answer }`  
  201 → `{ message, user }`

- **POST `/login`**  
  Body: `{ email, password }`  
  200 → `{ isAuthenticated: true }` and sets session cookie

- **GET `/check-auth`**  
  200 → `{ isAuthenticated: boolean }`

- **POST `/logout`**  
  200 → `{ message }` and clears session

### Password Recovery

- **GET `/security-questions`**  
  200 → `string[]`

- **POST `/forgot-password`**  
  Body: `{ email, question, answer, newPassword }`  
  200 → `{ message }` (on correct Q/A)

### Market Data

- **GET `/stocks`**  
  Today’s prices: `SELECT * FROM stocks WHERE date = CURRENT_DATE LIMIT 10`  
  200 → `[ { id, symbol, date, price, value }, ... ]`

- **GET `/stock-price/:symbol`**  
  200 → `{ price }` (for `CURRENT_DATE`)

- **GET `/stock-data/:symbol`**  
  200 → last 5 entries (for chart): `[ { date, price, value }, ... ]`

### Portfolio

- **GET `/account-balance`** (auth required)  
  200 → `{ accountBalance }`

- **GET `/user-stocks/:email`**  
  Aggregated positions: `[{ stock_name, total_shares }, ... ]`

- **GET `/user-transactions/:email`**  
  Transaction log (desc): `[{ type, stock_name, shares, date, total_price }, ... ]`

### Trading

- **POST `/buy`**  
  Body: `{ email, stockSymbol, quantity }`  
  Checks today’s price and available funds; updates positions and logs TX.  
  200 → `{ newBalance, message }`

- **POST `/sell`**  
  Body: `{ email, stockSymbol, quantity }`  
  Checks owned shares; decrements lots (largest first), adds funds, logs TX.  
  200 → `{ newBalance, message }`

> **Note on dates:** `/stocks` and `/stock-price/:symbol` use `CURRENT_DATE`. Make sure you seed today’s rows; otherwise you’ll see “Stock not found”.

---

## 🧩 Key React Components

- **Header**: Nav links to Home, Funds, Buy, Sell  
- **Login**: Form + show/hide password; “Forgot Password” modal with **Dropdown** of security questions  
- **ProtectedRoute**: Redirects to `/login` if `AuthContext.isAuthenticated` is false  
- **Home**: Renders **UserStocks** (positions) and **UserTransactions** (history)  
- **Stocks**: Table of today’s prices  
- **StockChart**: Line chart for last 5 days returned by `/stock-data/:symbol`  
- **Funds**: Deposit / Withdraw form calling `/funds` and `/withdraw`  
- **Buy / Sell**: Price lookup, total cost/value calc, submit orders  

> **Important axios tip**: `Funds.jsx` must also send cookies. If you don’t use a global Axios instance with `withCredentials = true`, add it where you call `/funds` and `/withdraw`.

---

## 🧪 Quick cURL Tests

~~~bash
# 1) Sign up
curl -X POST http://localhost:3000/signup \
  -H 'Content-Type: application/json' \
  -d '{"fname":"Ada","lname":"Lovelace","email":"ada@example.com","password":"Passw0rd!","question":"What is your favorite color?","answer":"Blue"}'

# 2) Login (store cookie)
curl -i -c cookies.txt -X POST http://localhost:3000/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ada@example.com","password":"Passw0rd!"}'

# 3) Check auth
curl -b cookies.txt http://localhost:3000/check-auth

# 4) Add funds (requires cookie)
curl -b cookies.txt -X POST http://localhost:3000/funds \
  -H 'Content-Type: application/json' \
  -d '{"amount": 5000}'

# 5) Buy shares (email currently required by /buy)
curl -b cookies.txt -X POST http://localhost:3000/buy \
  -H 'Content-Type: application/json' \
  -d '{"email":"ada@example.com","stockSymbol":"AAPL","quantity":5}'
~~~
