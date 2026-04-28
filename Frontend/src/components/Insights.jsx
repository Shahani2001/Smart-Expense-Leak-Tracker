import React, { useEffect, useState } from 'react';
import { insightAPI } from '../api';
import { Pie } from 'react-chartjs-2';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import '../styles/Dashboard.css';

// Register ChartJS components for the Pie chart
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Insights() {
  const [leaks, setLeaks] = useState([]);
  const [spikes, setSpikes] = useState([]);
  const [categoryData, setCategoryData] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const [leakData, spikeData, categoryBreakdown] = await Promise.all([
        insightAPI.getLeakDetection(),
        insightAPI.getSpendingSpikes(),
        insightAPI.getCategoryBreakdown(),
      ]);

      setLeaks(leakData.data);
      setSpikes(spikeData.data.spikes || []);
      setCategoryData(categoryBreakdown.data);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch insights');
    }
  };

  const categoryLabels = Object.keys(categoryData);
  const totalCategoryAmount = categoryLabels.reduce((sum, key) => sum + Number(categoryData[key] || 0), 0);
  const topCategory = categoryLabels.reduce(
    (top, key) => (categoryData[key] > top.amount ? { name: key, amount: categoryData[key] } : top),
    { name: '-', amount: 0 }
  );
  const pieData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryLabels.map((category) => categoryData[category]),
        backgroundColor: ['#667eea', '#ff6b6b', '#2d9f62', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="dashboard">
      <div className="insights-header">
        <h2>Insights Dashboard</h2>
        {/* Print button that only shows when there are insights to print*/}
        <button onClick={() => window.print()} className="refresh-btn print-btn no-print">
          Print Insights
        </button>
      </div>
      {error && <p className="error">{error}</p>}

      <div className="summary-cards">
        <div className="card">
          <h4>Total Insight Amount</h4>
          <p className="amount">${totalCategoryAmount.toFixed(2)}</p>
          <p className="subtext">From category analysis</p>
        </div>
        <div className="card">
          <h4>Top Category</h4>
          <p className="amount">{topCategory.name}</p>
          <p className="subtext">${topCategory.amount.toFixed(2)}</p>
        </div>
      </div>

      {leaks.length > 0 && (
        <div className="insights-section">
          <h3>Expense Leaks Detected</h3>
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
          <h3>Spending Spikes</h3>
          {spikes.map((spike, idx) => (
            <div key={idx} className="spike-item">
              <p>
                {spike.category}: ${spike.amount} (+${spike.deviationFromAverage})
              </p>
              <small>{new Date(spike.date).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      )}

      <div className="category-breakdown">
        <h3>Spending by Category</h3>
        {categoryLabels.length > 0 && (
          <div className="chart-wrap">
            <Pie data={pieData} />
          </div>
        )}
        <div className="categories">
          {Object.keys(categoryData).length === 0 ? (
            <p>No category insights yet.</p>
          ) : (
            Object.keys(categoryData).map((category) => (
              <div key={category} className="category-item">
                <span>{category}</span>
                <span className="amount">${categoryData[category].toFixed(2)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <button onClick={fetchInsights} className="refresh-btn">
        Refresh Insights
      </button>
    </div>
  );
}
