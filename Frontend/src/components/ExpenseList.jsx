import React, { useEffect, useState } from 'react';
import { expenseAPI, getApiErrorMessage } from '../api';
import '../styles/ExpenseList.css';

export default function ExpenseList({ refresh }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ amount: '', category: 'Food', note: '' });
  const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping', 'Health', 'Other'];

  useEffect(() => {
    fetchExpenses();
  }, [refresh]);

  const fetchExpenses = async () => {
    try {
      const response = await expenseAPI.getExpenses();
      setExpenses(response.data);
      setError('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch expenses'));
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (expense) => {
    setEditingId(expense._id);
    setEditForm({
      amount: String(expense.amount),
      category: expense.category,
      note: expense.note || '',
    });
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ amount: '', category: 'Food', note: '' });
  };

  const handleUpdate = async (id) => {
    try {
      await expenseAPI.updateExpense(id, parseFloat(editForm.amount), editForm.category, editForm.note);
      cancelEdit();
      fetchExpenses();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update expense'));
    }
  };

  const handleDelete = async (id) => {
    try {
      await expenseAPI.deleteExpense(id);
      fetchExpenses();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete expense'));
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="expense-list">
      <h3>Recent Expenses</h3>
      {error && <p className="error">{error}</p>}
      {expenses.length === 0 ? (
        <p>No expenses yet</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Note</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense._id}>
                <td>
                  {editingId === expense._id ? (
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  ) : (
                    expense.category
                  )}
                </td>
                <td>
                  {editingId === expense._id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.amount}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))}
                    />
                  ) : (
                    `$${expense.amount.toFixed(2)}`
                  )}
                </td>
                <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td>
                  {editingId === expense._id ? (
                    <input
                      type="text"
                      value={editForm.note}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, note: e.target.value }))}
                    />
                  ) : (
                    expense.note || '-'
                  )}
                </td>
                <td>
                  {editingId === expense._id ? (
                    <div className="row-actions">
                      <button onClick={() => handleUpdate(expense._id)} className="save-btn">
                        Save
                      </button>
                      <button onClick={cancelEdit} className="cancel-btn">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="row-actions">
                      <button onClick={() => startEdit(expense)} className="edit-btn">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(expense._id)} className="delete-btn">
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
