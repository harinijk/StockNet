import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom'; 
import "./Stocks.css";

const Stocks = () => {
  const [stocks, setStocks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/stocks')
      .then((response) => {
        setStocks(response.data);
      })
      .catch((error) => {
        setError('Error fetching stocks');
        console.error(error);
      });
  }, []);

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div>
    <div className="stocks-container">
      <h2>Stock Prices</h2>
      <table className="stocks-table">
        <thead>
          <tr>
            <th>Stock Symbol</th>
            <th>Price</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.id}>
              <td>{stock.symbol}</td>
              <td>${parseFloat(stock.price).toFixed(2)}</td>
              <td>${parseFloat(stock.value).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
     
      <div className="buy-sell-buttons">
        <Button className="buy-button" component={Link} to="/buy" variant="contained" sx={{
              backgroundColor: '#95D2B3',
              color: 'white',
              '&:hover': {
                backgroundColor: '#42918c',
              },
            }}>
          Buy
        </Button>
        <Button className="sell-button" component={Link} to="/sell" variant="contained" sx={{
              backgroundColor: '#95D2B3',
              color: 'white',
              '&:hover': {
                backgroundColor: '#42918c',
              },
            }}>
          Sell
        </Button>
      </div>
      </div>
  );
};

export default Stocks;


