import React from 'react';
import UserStocks from './UserStocks';
import './Home.css';
import UserTransactions from './UserTransactions';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Stock Market</h1>
      <div className="stocks-section">
        <div className="user-stocks-section">
          <UserStocks />
        </div>
      </div>
      <div><UserTransactions /></div>
    </div>
  );
};

export default Home;





