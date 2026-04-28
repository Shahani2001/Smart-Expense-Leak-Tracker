import React, { useState } from 'react';
import { expenseAPI, getApiErrorMessage } from '../api';
import '../styles/ExpenseForm.css';

export default function ExpenseForm({ onExpenseAdded }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping', 'Health', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await expenseAPI.addExpense(parseFloat(amount), category, note);
      setAmount('');
      setNote('');
      setCategory('Food');
      setError('');
      onExpenseAdded();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to add expense'));
    }
  };

  return (
    <div className="expense-form">
      <h3>Add Expense</h3>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button type="submit">Add Expense</button>
      </form>
    </div>
  );
}
