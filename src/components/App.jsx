import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import Home from './Home';
import Login from './Login';
import SignUp from './SignUp';
import Preferences from './Preferences';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from './AuthContext';
import Buy from './BuyStock';
import axios from "axios";
import Sell from "./SellStock";
import Funds from "./AddFunds";

axios.defaults.withCredentials = true;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/preferences" element={<ProtectedRoute><Preferences /></ProtectedRoute>} />
          <Route path="/buy" element={<ProtectedRoute><Buy /></ProtectedRoute>} />
          <Route path="/sell" element={<ProtectedRoute><Sell /></ProtectedRoute>} />
          <Route path="/funds" element={<ProtectedRoute><Funds /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;







