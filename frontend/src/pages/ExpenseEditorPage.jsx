import { useEffect, useState } from 'react'
import ExpenseForm from '../components/ExpenseForm.jsx'
import StatusMessage from '../components/StatusMessage.jsx'

export default function ExpenseEditorPage({ expenseId, request, navigate }) {
  const [categories, setCategories] = useState([])
  const [methods, setMethods] = useState([])
  const [expense, setExpense] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const editing = expenseId !== null

  useEffect(() => {
    let active = true
    const queries = [request('/categories'), request('/payment-methods')]
    if (editing) queries.push(request(`/expenses/${expenseId}`))

    Promise.all(queries).then(([categoryResult, methodResult, expenseResult]) => {
      if (!active) return
      setCategories(categoryResult.data)
      setMethods(methodResult.data)
      if (editing) setExpense(expenseResult.data)
    }).catch((failure) => {
      if (active) setError(failure.message)
    }).finally(() => {
      if (active) setLoading(false)
    })

    return () => { active = false }
  }, [editing, expenseId, request])

  async function save(payload) {
    setSaving(true)
    setError('')
    setFieldErrors({})

    try {
      if (editing) {
        await request(`/expenses/${expenseId}`, { method: 'PUT', body: payload })
      } else {
        await request('/expenses', { method: 'POST', body: payload })
      }
      navigate('/expenses')
    } catch (failure) {
      setError(failure.message)
      setFieldErrors(failure.errors || {})
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="form-page">
      <div className="page-heading">
        <div>
          <button className="back-link" onClick={() => navigate('/expenses')}>← Back to expenses</button>
          <h1>{editing ? 'Edit expense' : 'New expense'}</h1>
          <p className="muted">{editing ? 'Update the details of your transaction.' : 'Record a new expense in your personal tracker.'}</p>
        </div>
      </div>
      {loading ? (
        <div className="card empty-state" role="status">Loading form…</div>
      ) : editing && !expense ? (
        <div className="card empty-state">
          <StatusMessage message={error || 'Expense not found.'} />
          <button className="button button--subtle" onClick={() => navigate('/expenses')}>Return to expenses</button>
        </div>
      ) : (
        <ExpenseForm
          key={expenseId || 'new'}
          expense={expense}
          categories={categories}
          paymentMethods={methods}
          onSubmit={save}
          onCancel={() => navigate('/expenses')}
          saving={saving}
          error={error}
          fieldErrors={fieldErrors}
        />
      )}
    </section>
  )
}
