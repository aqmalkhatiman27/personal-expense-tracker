import { useEffect, useMemo, useState } from 'react'
import StatusMessage from '../components/StatusMessage.jsx'
import { dateForInput, formatMoney } from '../lib/format.js'

export default function ExpensesPage({ request, navigate }) {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    let active = true

    Promise.all([
      request('/expenses'),
      request('/categories'),
      request('/payment-methods'),
    ]).then(([expenseResult, categoryResult, methodResult]) => {
      if (!active) return
      setExpenses(expenseResult.data)
      setCategories(categoryResult.data)
      setPaymentMethods(methodResult.data)
    }).catch((failure) => {
      if (active) setError(failure.message)
    }).finally(() => {
      if (active) setLoading(false)
    })

    return () => { active = false }
  }, [request])

  const sortedExpenses = useMemo(() => [...expenses].sort((a, b) => {
    return dateForInput(b.expense_date).localeCompare(dateForInput(a.expense_date)) || b.id - a.id
  }), [expenses])

  const categoryNames = Object.fromEntries(categories.map((category) => [category.id, category.name]))
  const paymentNames = Object.fromEntries(paymentMethods.map((method) => [method.id, method.name]))

  async function removeExpense(expense) {
    if (!window.confirm(`Delete “${expense.description}”? This cannot be undone.`)) return

    setDeletingId(expense.id)
    setError('')

    try {
      await request(`/expenses/${expense.id}`, { method: 'DELETE' })
      setExpenses((previous) => previous.filter((item) => item.id !== expense.id))
    } catch (failure) {
      setError(failure.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR TRANSACTIONS</span>
          <h1>Expenses</h1>
          <p className="muted">Keep track of your actual spending, one transaction at a time.</p>
        </div>
        <button className="button button--primary" onClick={() => navigate('/expenses/new')}>+ New expense</button>
      </div>
      <StatusMessage message={error} />
      {loading ? (
        <div className="card empty-state" role="status">Loading your expenses…</div>
      ) : sortedExpenses.length === 0 ? (
        <div className="card empty-state">
          <h2>No expenses yet</h2>
          <p>Record your first expense to get started.</p>
          <button className="button button--primary" onClick={() => navigate('/expenses/new')}>Add an expense</button>
        </div>
      ) : (
        <div className="card table-card">
          <div className="table-heading">
            <strong>{sortedExpenses.length} expenses</strong>
            <span className="muted">Showing only your transactions</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Expense</th>
                  <th scope="col">Date</th>
                  <th scope="col">Category</th>
                  <th scope="col">Payment method</th>
                  <th scope="col" className="numeric">Amount</th>
                  <th scope="col" className="actions-heading">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>
                      <strong>{expense.description}</strong>
                      {expense.note && <span className="cell-note">{expense.note}</span>}
                    </td>
                    <td>{dateForInput(expense.expense_date)}</td>
                    <td><span className="chip">{categoryNames[expense.category_id] || 'Unknown'}</span></td>
                    <td>{paymentNames[expense.payment_method_id] || 'Unknown'}</td>
                    <td className="numeric amount">{formatMoney(expense.amount)}</td>
                    <td className="row-actions">
                      <button className="button button--text" onClick={() => navigate(`/expenses/${expense.id}/edit`)}>Edit</button>
                      <button className="button button--text button--danger-text" onClick={() => removeExpense(expense)} disabled={deletingId === expense.id}>
                        {deletingId === expense.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
