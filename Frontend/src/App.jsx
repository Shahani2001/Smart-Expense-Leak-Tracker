import React, { useState } from 'react';
import { BrowserRouter as Router, NavLink, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Home from './components/Home.jsx';
import Dashboard from './components/Dashboard.jsx';
import ExpenseForm from './components/ExpenseForm.jsx';
import ExpenseList from './components/ExpenseList.jsx';
import Insights from './components/Insights.jsx';
import './styles/App.css';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isAuthenticated = !!localStorage.getItem('token');

  const handleExpenseAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    window.location.href = '/login';
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app">
        {isAuthenticated && (
          <nav className="navbar">
            <h1>💸 ExpenseDrip</h1>
            <div className="nav-actions">
              <NavLink to="/home" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Home
              </NavLink>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Dashboard
              </NavLink>
              <NavLink to="/expenses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Expenses
              </NavLink>
              <NavLink to="/insights" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Insights
              </NavLink>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </nav>
        )}
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/home" /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/home" /> : <Register />} />
          <Route
            path="/home"
            element={
              isAuthenticated ? (
                <div className="home-route-page">
                  <Home />
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <div className="dashboard-page">
                  <Dashboard key={refreshTrigger} />
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/expenses"
            element={
              isAuthenticated ? (
                <div className="expenses-page">
                  <ExpenseForm onExpenseAdded={handleExpenseAdded} />
                  <ExpenseList refresh={refreshTrigger} />
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/insights"
            element={
              isAuthenticated ? (
                <div className="insights-page">
                  <Insights />
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/" element={<Navigate to={isAuthenticated ? '/home' : '/login'} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
