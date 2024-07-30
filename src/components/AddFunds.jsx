import React, { useState } from 'react';
import axios from 'axios';
import './AddFunds.css'; 

const Funds = () => {
  const [amount, setAmount] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    const email = sessionStorage.getItem('email');

    if (!email) {
      setErrorMessage('User is not logged in');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/funds', {
        email,
        amount: parseFloat(amount),
      });
      setSuccessMessage(`Successfully added $${amount} to your account.`);
      setAmount('');
    } catch (error) {
      setErrorMessage('Error adding funds');
      console.error(error);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const email = sessionStorage.getItem('email');

    if (!email) {
      setErrorMessage('User is not logged in');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/withdraw', {
        email,
        amount: parseFloat(amount),
      });
      setSuccessMessage(`Successfully withdrew $${amount} from your account.`);
      setAmount('');
    } catch (error) {
      setErrorMessage('Error withdrawing funds');
      console.error(error);
    }
  };

  return (
    <div className="funds-container">
      <h2 className="funds-header">Manage Funds</h2>
      <form className="funds-form">
        <div className="funds-form-group">
          <label htmlFor="amount">Amount:</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={handleAmountChange}
            required
          />
        </div>
        <button type="button" onClick={handleDeposit} >Deposit</button>
        <button type="button" onClick={handleWithdraw}>Withdraw</button>
      </form>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default Funds;



