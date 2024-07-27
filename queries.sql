CREATE TABLE IF NOT EXISTS stocks_sold (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255),
    stock_name VARCHAR(255),
    shares NUMERIC,
    total_price NUMERIC,
    date_sold DATE,
    FOREIGN KEY (user_email) REFERENCES users(email)
);

INSERT INTO stocks (symbol, price, value, date, stock_name)
VALUES
('AAPL', 150.00, 1500.00, CURRENT_DATE, 'Apple Inc.'),
('GOOGL', 2800.00, 28000.00, CURRENT_DATE, 'Alphabet Inc.'),
('MSFT', 300.00, 3000.00, CURRENT_DATE, 'Microsoft Corp.'),
('AMZN', 3500.00, 35000.00, CURRENT_DATE, 'Amazon.com Inc.'),
('TSLA', 700.00, 7000.00, CURRENT_DATE, 'Tesla Inc.'),
('FB', 350.00, 3500.00, CURRENT_DATE, 'Meta Platforms Inc.'),
('NFLX', 600.00, 6000.00, CURRENT_DATE, 'Netflix Inc.'),
('NVDA', 750.00, 7500.00, CURRENT_DATE, 'NVIDIA Corp.'),
('DIS', 175.00, 1750.00, CURRENT_DATE, 'The Walt Disney Co.'),
('ADBE', 600.00, 6000.00, CURRENT_DATE, 'Adobe Inc.');
