import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import session from "express-session";
const app = express();
const port = 3000;

const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "signup",
  password: "Harini22_",
  port: 5432,
});

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, 
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(session({
  secret: "Harini22_",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 300000 } 
}));



// Endpoint for user signup
app.post("/signup", async (req, res) => {
  const { fname, lname, email, password, answer, question } = req.body;

  const query = `
    INSERT INTO users (fname, lname, email, password, answer, question)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [fname, lname, email, password, answer, question]);
    res.status(201).json({
      message: "User signed up successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error signing up user:", error);
    res.status(500).json({
      message: "Error signing up user",
      error: error.message,
    });
  }
});


app.post('/forgot-password', async (req, res) => {
  const { email, question, answer, newPassword } = req.body;

  try {
    const query = `
      SELECT * FROM users WHERE email = $1 AND question = $2 AND answer = $3;
    `;
    const result = await pool.query(query, [email, question, answer]);

    if (result.rows.length > 0) {
      const updateQuery = `
        UPDATE users SET password = $1 WHERE email = $2;
      `;
      await pool.query(updateQuery, [newPassword, email]);
      res.status(200).json({ message: 'Password updated successfully' });
    } else {
      res.status(400).json({ message: 'Invalid security question answer or user does not exist' });
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});
;

// Endpoint to get security questions
app.get('/security-questions', (req, res) => {
  res.json([
    "What is your favorite color?",
    "What is your favourite city?",
    "What was the name of your first pet?",
    "What was your first car?",
    "What elementary school did you attend?"
  ]);
});

// Endpoint for user login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const query = `SELECT * FROM users WHERE email = $1 AND password = $2;`;

  try {
    const result = await pool.query(query, [email, password]);
    if (result.rows.length > 0) {
      req.session.userEmail = email;
      res.json({ isAuthenticated: true });
    } else {
      res.status(401).json({ message: "Invalid credentials. Please check your email and password." });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in. Please try again later." });
  }
});


const ensureLoggedIn = (req, res, next) => {
  console.log("Session data:", req.session); 
  if (req.session.userEmail) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Endpoint to fetch stocks
app.get('/stocks', async (req, res) => {
  const query = 'SELECT * FROM stocks WHERE date = CURRENT_DATE LIMIT 10';
  
  try {
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ message: 'Error fetching stocks' });
  }
});

// Endpoint to fetch account balance
app.get('/account-balance', ensureLoggedIn, async (req, res) => {
  const email = req.session.userEmail;

  const query = `
    SELECT account_balance FROM users WHERE email = $1;
  `;

  try {
    const result = await pool.query(query, [email]);
    if (result.rows.length > 0) {
      res.json({ accountBalance: result.rows[0].account_balance });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching account balance:", error);
    res.status(500).json({ message: "Error fetching account balance", error: error.message });
  }
});

// Endpoint to fetch stock price
app.get('/stock-price/:symbol', async (req, res) => {
  const { symbol } = req.params;

  try {
    const result = await pool.query('SELECT price FROM stocks WHERE symbol = $1 AND date=CURRENT_DATE', [symbol]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    res.json({ price: result.rows[0].price });
  } catch (err) {
    console.error('Error fetching stock price:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Route to handle buying stocks
app.post('/buy', async (req, res) => {
  const { email, stockSymbol, quantity } = req.body;

  if (!email || !stockSymbol || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Missing required fields or invalid quantity' });
  }

  try {
    const stockResult = await pool.query('SELECT price FROM stocks WHERE symbol = $1 AND date = CURRENT_DATE', [stockSymbol]);

    if (stockResult.rows.length === 0) {
      return res.status(404).json({ error: 'Stock not found or no price available for today' });
    }

    const stockPrice = parseFloat(stockResult.rows[0].price);
    if (isNaN(stockPrice)) {
      return res.status(400).json({ error: 'Invalid stock price' });
    }

    const totalCost = stockPrice * quantity;

    const userResult = await pool.query('SELECT account_balance FROM users WHERE email = $1', [email]);
    const currentBalance = parseFloat(userResult.rows[0].account_balance);
    if (isNaN(currentBalance)) {
      return res.status(400).json({ error: 'Invalid account balance' });
    }

    if (totalCost > currentBalance) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    const newBalance = currentBalance - totalCost;
    await pool.query('UPDATE users SET account_balance = $1 WHERE email = $2', [newBalance, email]);

    await pool.query('INSERT INTO personstockshares (user_email, stock_name, shares, purchase_date) VALUES ($1, $2, $3, CURRENT_DATE)', [email, stockSymbol, quantity]);

    await pool.query('INSERT INTO transactions (user_email, stock_name, shares, transaction_type, transaction_date, total_price) VALUES ($1, $2, $3, $4, CURRENT_DATE, $5)', [email, stockSymbol, quantity, 'bought', totalCost]);

    res.json({
      newBalance,
      message: `Successfully bought ${quantity} shares of ${stockSymbol} for $${totalCost.toFixed(2)}`
    });
  } catch (error) {
    console.error('Error buying stocks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route for selling stocks
app.post('/sell', async (req, res) => {
  const { email, stockSymbol, quantity } = req.body;

  if (!email || !stockSymbol || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Missing required fields or invalid quantity' });
  }

  try {
    const stockResult = await pool.query('SELECT SUM(shares) as total_shares FROM personstockshares WHERE user_email = $1 AND stock_name = $2 GROUP BY stock_name', [email, stockSymbol]);
    if (stockResult.rows.length === 0 || stockResult.rows[0].total_shares < quantity) {
      return res.status(400).json({ error: 'Not enough shares to sell' });
    }

    const totalShares = stockResult.rows[0].total_shares;

    const priceResult = await pool.query('SELECT price FROM stocks WHERE symbol = $1', [stockSymbol]);
    if (priceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const stockPrice = parseFloat(priceResult.rows[0].price);
    if (isNaN(stockPrice)) {
      return res.status(400).json({ error: 'Invalid stock price' });
    }

    const totalValue = stockPrice * quantity;
    if (isNaN(totalValue)) {
      return res.status(400).json({ error: 'Invalid total value' });
    }

    let remainingQuantity = quantity;

    const userStocks = await pool.query('SELECT id, shares FROM personstockshares WHERE user_email = $1 AND stock_name = $2 ORDER BY shares DESC', [email, stockSymbol]);

    for (let i = 0; i < userStocks.rows.length; i++) {
      const row = userStocks.rows[i];
      const id = row.id;
      const shares = row.shares;

      if (remainingQuantity <= shares) {
        await pool.query('UPDATE personstockshares SET shares = shares - $1 WHERE id = $2', [remainingQuantity, id]);
        if (shares === remainingQuantity) {
          await pool.query('DELETE FROM personstockshares WHERE id = $1', [id]);
        }
        break;
      } else {
        await pool.query('DELETE FROM personstockshares WHERE id = $1', [id]);
        remainingQuantity -= shares;
      }
    }

    const userResult = await pool.query('SELECT account_balance FROM users WHERE email = $1', [email]);
    const currentBalance = parseFloat(userResult.rows[0].account_balance);
    if (isNaN(currentBalance)) {
      return res.status(400).json({ error: 'Invalid account balance' });
    }

    const newBalance = currentBalance + totalValue;
    await pool.query('UPDATE users SET account_balance = $1 WHERE email = $2', [newBalance, email]);

    const transactionDate = new Date().toISOString().split('T')[0];
    await pool.query('INSERT INTO transactions (user_email, stock_name, shares, transaction_type, transaction_date, total_price) VALUES ($1, $2, $3, $4, $5, $6)', [email, stockSymbol, quantity, 'sold', transactionDate, totalValue]);

    res.json({
      newBalance,
      message: `Successfully sold ${quantity} shares of ${stockSymbol} on ${transactionDate}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Endpoint to fetch the users stocks
app.get('/user-stocks/:email', async (req, res) => {
  const { email } = req.params;
  console.log('Received email:', email); 

  try {
    const query = `
      SELECT stock_name, SUM(shares) AS total_shares
      FROM personstockshares
      WHERE user_email = $1
      GROUP BY stock_name
    `;
    const result = await pool.query(query, [email]);
    console.log('Query result:', result.rows); 
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

//Endpoint for logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.json({ message: 'Logout successful' });
  });
});

//Endpoint for the stock data
app.get('/stock-data/:symbol', async (req, res) => {
  const { symbol } = req.params;
  try {
    const query = `
      SELECT date, price, value
      FROM stocks
      WHERE symbol = $1
      ORDER BY date DESC
      LIMIT 5;
    `;
    const result = await pool.query(query, [symbol]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Endpoint to fetch user transactions (both bought and sold stocks)
app.get('/user-transactions/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const query = `
      SELECT transaction_type AS type, stock_name, shares, transaction_date AS date, total_price
      FROM transactions
      WHERE user_email = $1
      ORDER BY transaction_date DESC;
    `;
    
    const result = await pool.query(query, [email]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({ message: 'Error fetching user transactions', error: error.message });
  }
});

//Endpoint for authentication
app.get('/check-auth', (req, res) => {
  if (req.session.userEmail) {
    console.log("fujehnfasfnoaeisfnaoif");
    res.json({ isAuthenticated: true });
  } else {
    res.json({ isAuthenticated: false });
  }
});


// Endpoint to add funds to user account
app.post('/funds', ensureLoggedIn, async (req, res) => {
  const email = req.session.userEmail;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    // Fetch the user's current account balance
    const userResult = await pool.query('SELECT account_balance FROM users WHERE email = $1', [email]);
    let currentBalance = parseFloat(userResult.rows[0].account_balance);

    if (isNaN(currentBalance)) {
      currentBalance = 0;
    }

    // Update the user's account balance
    const newBalance = currentBalance + parseFloat(amount);
    
    await pool.query('UPDATE users SET account_balance = $1 WHERE email = $2', [newBalance, email]);

    res.json({ newBalance, message: `Successfully added $${amount} to your account` });
  } catch (error) {
    console.error('Error adding funds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//Endpoint to withdraw funds from user account
app.post('/withdraw', ensureLoggedIn, async (req, res) => {
  const email = req.session.userEmail;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    // Fetch the user's current account balance
    const userResult = await pool.query('SELECT account_balance FROM users WHERE email = $1', [email]);
    const currentBalance = parseFloat(userResult.rows[0].account_balance);

    if (isNaN(currentBalance)) {
      return res.status(400).json({ error: 'Invalid account balance' });
    }

    // Check if the user has sufficient balance
    if (currentBalance < parseFloat(amount)) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Update the user's account balance
    const newBalance = currentBalance - parseFloat(amount);
    await pool.query('UPDATE users SET account_balance = $1 WHERE email = $2', [newBalance, email]);

    res.json({ newBalance, message: `Successfully withdrew $${amount} from your account` });
  } catch (error) {
    console.error('Error withdrawing funds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
