import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./UserTransactions.css";

const UserTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserTransactions = async () => {
      try {
        const email = sessionStorage.getItem('email'); 
        if (!email) {
          setError('User is not logged in');
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:3000/user-transactions/${email}`);
        console.log('Fetched user transactions:', response.data);
        setTransactions(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user transactions:', error);
        setError(error);
        setLoading(false);
      }
    };

    fetchUserTransactions();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="user-transactions-container">
      <h2>Transactions</h2>
      <table className="user-transactions-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Stock Name</th>
            <th>Shares</th>
            <th>Date</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={index}>
              <td>{transaction.type}</td>
              <td>{transaction.stock_name}</td>
              <td>{transaction.shares}</td>
              <td>{new Date(transaction.date).toLocaleDateString()}</td>
              <td>{transaction.total_price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTransactions;
