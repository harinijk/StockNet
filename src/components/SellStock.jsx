import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { useLocation, useNavigate } from 'react-router-dom';
import "./SellStock.css";
import StockChart from './StockChart';

axios.defaults.withCredentials = true; // Include cookies in requests

const Sell = () => {
  const [accountBalance, setAccountBalance] = useState(0);
  const [stockSymbol, setStockSymbol] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [stockPrice, setStockPrice] = useState(null);
  const [totalValue, setTotalValue] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

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
      setTotalValue(price * qty);
    } catch (error) {
      console.error('Error fetching stock price', error);
      setError('Error fetching stock price');
    }
  };

  const handleSell = async (e) => {
    e.preventDefault();
    const email = sessionStorage.getItem('email');
    if (!email) {
      setError('User is not logged in');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/sell', {
        email,
        stockSymbol,
        quantity,
      });
      setAccountBalance(parseFloat(response.data.newBalance));
      setMessage(response.data.message);
      setStockSymbol('');
      setQuantity(0);
      setError('');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Error selling stock');
      }
      console.error(error);
    }
  };

  return (
    <div className="sell-and-graph">
      <div className="sell-container">
        <h2>Sell Stocks</h2>
        <form onSubmit={handleSell}>
          <div className="form-group">
            <label>Stock Symbol:</label>
            <input
              type="text"
              value={stockSymbol}
              onChange={(e) => {
                const symbol = e.target.value;
                setStockSymbol(symbol);
                setError('');
                if (symbol && quantity > 0) {
                  fetchStockPrice(symbol, quantity);
                }
              }}
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
              onChange={(e) => {
                const qty = parseInt(e.target.value, 10);
                setQuantity(qty);
                setTotalValue(stockPrice * qty);
                setError('');
                if (stockSymbol && qty > 0) {
                  fetchStockPrice(stockSymbol, qty);
                }
              }}
              required
            />
          </div>
          <div className="form-group">
            <label>Total Value:</label>
            <span>${totalValue.toFixed(2)}</span>
          </div>
          {message && <p className="success-message">{message}</p>}
          {stockSymbol && quantity > 0 && (
            <p>Current Account Balance: ${accountBalance.toFixed(2)}</p>
          )}
          <Button type="submit" className="sellstock-button" sx={{
               color:'white',
               backgroundColor: '#50a3a2',
               marginTop:5,
               marginLeft:15,
               '&:hover': {
                 backgroundColor: '#42918c',
               },
              }}>
            Sell
          </Button>
          {error && <p className="sell-error-message">{error}</p>}
        </form>
      </div>
      <div className="stock-chart-section">
        {stockSymbol && <StockChart symbol={stockSymbol} />}
      </div>
    </div>
  );
};

export default Sell;



