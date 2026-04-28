import React, { useEffect, useState } from 'react';
import { insightAPI } from '../api';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [totalSpending, setTotalSpending] = useState(0);
  const [expenseCount, setExpenseCount] = useState(0);
  const [leaks, setLeaks] = useState([]);
  const [spikes, setSpikes] = useState([]);
  const [categoryData, setCategoryData] = useState({});
  const username = localStorage.getItem('username');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [spending, leakData, spikeData, categoryBreakdown] = await Promise.all([
        insightAPI.getTotalSpending(), // get the total spending
        insightAPI.getLeakDetection(), // get the leak detection
        insightAPI.getSpendingSpikes(), // get the spending spikes
        insightAPI.getCategoryBreakdown(), // get the category breakdown
      ]);

      setTotalSpending(spending.data.totalSpending);
      setExpenseCount(spending.data.count);
      setLeaks(leakData.data);
      setSpikes(spikeData.data.spikes || []);
      setCategoryData(categoryBreakdown.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data');
    }
  };

  return (
    <div className="dashboard">
      <h2>Welcome, {username}!</h2>
      
      <div className="summary-cards">
        <div className="card">
          <h4>Total Spending</h4>
          <p className="amount">${totalSpending.toFixed(2)}</p>
          <p className="subtext">{expenseCount} expenses</p>
        </div>
        <div className="card">
          <h4>Money Leaks Detected</h4>
          <p className="amount">{leaks.length}</p>
          <p className="subtext">leaks found</p>
        </div>
        <div className="card">
          <h4>Spending Spikes</h4>
          <p className="amount">{spikes.length}</p>
          <p className="subtext">Unusual transactions</p>
        </div>
      </div>

      {leaks.length > 0 && (
        <div className="insights-section">
          <h3>⚠️ Expense Leaks Detected</h3>
          {leaks.map((leak, idx) => (
            <div key={idx} className="leak-item">
              <h4>{leak.category}</h4>
              <p>{leak.message}</p>
              <p>Average: ${leak.averageAmount}</p>
            </div>
          ))}
        </div>
      )}

      {spikes.length > 0 && (
        <div className="insights-section">
          <h3>📈 Spending Spikes</h3>
          {spikes.map((spike, idx) => (
            <div key={idx} className="spike-item">
              <p>{spike.category}: ${spike.amount} (+${spike.deviationFromAverage})</p>
              <small>{new Date(spike.date).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      )}

      <div className="category-breakdown">
        <h3>Spending by Category</h3>
        <div className="categories">
          {Object.keys(categoryData).map((category) => (
            <div key={category} className="category-item">
              <span>{category}</span>
              <span className="amount">${categoryData[category].toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/*fetchDashboardData is called when the user clicks the "Refresh Insights" button, allowing them to get the latest insights without needing to refresh the entire page.*/}
      <button onClick={fetchDashboardData} className="refresh-btn"> 
        Refresh Insights
      </button>
    </div>
  );
}
