import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

export default function Home() {
  const username = localStorage.getItem('username') || 'User';

  return (
    <div className="home-page">
      <div className="home-card">
        <div className="home-header">
          <span className="home-badge">ExpenseDrip</span>
          <h2>Welcome back, {username}</h2>
          <p>Track spending, detect risky patterns, and make smarter money decisions.</p>
        </div>

        <div className="home-highlights">
          <div className="highlight-item">
            <h4>Track Daily Spend</h4>
            <p>Add and review expenses with category and note details.</p>
          </div>
          <div className="highlight-item">
            <h4>Find Expense Leaks</h4>
            <p>Spot repeated small spends that quietly impact your monthly budget.</p>
          </div>
          <div className="highlight-item">
            <h4>Catch Spikes Early</h4>
            <p>Get warnings for unusual high-value transactions.</p>
          </div>
        </div>

        <div className="home-details">
          <h3>What problem this app solves</h3>
          <p>
            Many users record expenses but still miss where small daily spending drains their budget.
            This app helps you see total spending, category trends, and unusual transactions in one place.
          </p>

          <h3>What "expense leak" means here</h3>
          <p>
            An expense leak means repeated small expenses (under $50) in the same category. If there are
            more than 2 such entries, the app highlights them because these small costs can quietly build
            into a large monthly loss.
          </p>
        </div>

        <div className="home-actions">
          <Link to="/expenses" className="home-link">
            Manage Expenses
          </Link>
          <Link to="/dashboard" className="home-link">
            View Dashboard
          </Link>
          <Link to="/insights" className="home-link">
            Open Insights
          </Link>
        </div>
      </div>
    </div>
  );
}
