import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import StockChart from './StockChart';
import "./BuyStock.css";

axios.defaults.withCredentials = true; // Include cookies in requests

const Buy = () => {
  const [accountBalance, setAccountBalance] = useState(0);
  const [stockSymbol, setStockSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [stockPrice, setStockPrice] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [showCurrentBalance, setShowCurrentBalance] = useState(false); 
  const location = useLocation();
 
  // use effect for if we click buy from table 
  useEffect(() => {
      if (location.state) {
        setStockSymbol(location.state.stockSymbol || '');
        setQuantity(location.state.quantity || 0);
        fetchStockPrice(location.state.stockSymbol, location.state.quantity || 0);
      }

      const fetchAccountBalance = async () => {
        try {
          const response = await axios.get('http://localhost:3000/account-balance');
          const balance = parseFloat(response.data.accountBalance);
          setAccountBalance(balance);
        } catch (error) {
          console.error('Error fetching account balance', error);
          setError('Error fetching account balance');
        }
      };
          
      fetchAccountBalance();

  }, [location.state]);

  const fetchStockPrice = async (symbol, qty) => {
    try {
      const response = await axios.get(`http://localhost:3000/stock-price/${symbol}`);
      const price = parseFloat(response.data.price);
      setStockPrice(price);
      setTotalCost(price * qty);
    } catch (error) {
      console.error('Error fetching stock price', error);
      setError('Error fetching stock price');
    }
  };


  const handleStockChange = async (e) => {
    const symbol = e.target.value;
    setStockSymbol(symbol);
    setSuccessMessage('');
    setShowCurrentBalance(false);

    if (!symbol) {
      setStockPrice(null);
      setTotalCost(0);
      setError(''); // Clear the error if the stock symbol is empty
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3000/stock-price/${symbol}`);
      const price = parseFloat(response.data.price);
      setStockPrice(price);
      calculateTotalCost(price, quantity); 
      setError('');
    } catch (error) {
      setStockPrice(null);
      setTotalCost(0);
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Error fetching stock price');
      }
      console.error(error);
    }
  };

  const handleQuantityChange = (e) => {
    const qty = e.target.value === '' ? '' : parseInt(e.target.value, 10);
    setQuantity(qty);
    setSuccessMessage('');
    setShowCurrentBalance(true); 

    if (stockPrice) {
      calculateTotalCost(stockPrice, qty);
    }
  };

  const calculateTotalCost = (price, qty) => {
    const cost = isNaN(price * qty) ? 0 : price * qty;
    setTotalCost(cost);
  };

  const handleBuy = async (e) => {
    e.preventDefault();
    const email = sessionStorage.getItem('email');
    if (!email) {
      setError('User is not logged in');
      return;
    }

    if (quantity <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/buy', {
        email,
        stockSymbol,
        quantity,
      });

      setAccountBalance(parseFloat(response.data.newBalance));
      setSuccessMessage(`Successfully bought ${quantity} shares of ${stockSymbol} on ${new Date().toLocaleDateString()}.`);
      setError('');
      setShowCurrentBalance(true); // Show current balance after successful transaction
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Error buying stock');
      }
      console.error(error);
    }
  };

  return (
    <div className="buy-and-graph">
      <div className="buy-container">
        <h2>Buy Stocks</h2>
        <form onSubmit={handleBuy}>
          <div className="form-group">
            <label>Stock Symbol:</label>
            <input
              type="text"
              value={stockSymbol}
              onChange={handleStockChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Stock Price:</label>
            <span>{stockPrice !== null ? `$${stockPrice.toFixed(2)}` : ''}</span>
          </div>
          <div className="form-group">
            <label>Quantity:</label>
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Total Cost:</label>
            <span>${totalCost.toFixed(2)}</span>
          </div>
          {successMessage && <p className="success-message">{successMessage}</p>}
          {showCurrentBalance && <p>Current Account Balance: ${accountBalance.toFixed(2)}</p>}
          <Button className="buystock-button" type="submit" sx={{
            color:'white',
            backgroundColor: '#50a3a2',
            marginTop:5,
            marginLeft:15,
            '&:hover': {
              backgroundColor: '#42918c',
            },
          }}>
            Buy
          </Button>
          </form>
          {error && <p className="error-message">{error}</p>}
      </div>
      <div className="stock-chart-section">
        {stockSymbol && <StockChart symbol={stockSymbol} />}
      </div>
    </div>
  );
};

export default Buy;










