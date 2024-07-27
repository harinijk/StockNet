import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import "./UserStocks.css";

const UserStocks = () => {
  const [userStocks, setUserStocks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserStocks = async () => {
      try {
        const email = sessionStorage.getItem('email'); 
        if (!email) {
          setError('User is not logged in');
          return;
        }

        const response = await axios.get(`http://localhost:3000/user-stocks/${email}`);
        console.log('Fetched user stocks:', response.data);

        // Aggregate stocks with the same name and sum up shares
        const aggregatedStocks = aggregateStocks(response.data);

        setUserStocks(aggregatedStocks);
      } catch (error) {
        setError('Error fetching user stocks');
        console.error(error);
      }
    };

    fetchUserStocks();
  }, []);

  const aggregateStocks = (stocks) => {
    const aggregated = {};
    stocks.forEach(stock => {
      if (aggregated[stock.stock_name]) {
        aggregated[stock.stock_name].shares += parseInt(stock.total_shares, 10);
      } else {
        aggregated[stock.stock_name] = {
          stock_name: stock.stock_name,
          shares: parseInt(stock.total_shares, 10),
        };
      }
    });
    return Object.values(aggregated);
  };
  

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="user-stocks-container">
      <h2>Your Stocks</h2>
      <table className="user-stocks-table">
        <thead>
          <tr>
            <th>Stock Name</th>
            <th>Shares</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {userStocks.map((stock, index) => (
            <tr key={index}>
              <td>{stock.stock_name}</td>
              <td>{stock.shares}</td>
              <td>
                <div className="individual-buy-sell-buttons">
                  <Link 
                    to="/buy" 
                    state={{ stockSymbol: stock.stock_name, quantity: stock.shares }} 
                  >
                    <button className="individual-buy">Buy</button>
                  </Link>
                  <Link 
                    to="/sell" 
                    state={{ stockSymbol: stock.stock_name, quantity: stock.shares }} 
                  >
                    <button className="individual-sell">Sell</button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserStocks;








