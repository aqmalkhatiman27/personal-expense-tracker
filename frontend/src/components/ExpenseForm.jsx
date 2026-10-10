import { useState } from 'react'
import { dateForInput, todayLocal } from '../lib/format.js'
import StatusMessage from './StatusMessage.jsx'

const emptyExpense = {
  description: '',
  amount: '',
  expense_date: todayLocal(),
  category_id: '',
  payment_method_id: '',
  note: '',
}

function initialValues(expense) {
  if (!expense) return { ...emptyExpense }

  return {
    description: expense.description || '',
    amount: String(expense.amount ?? ''),
    expense_date: dateForInput(expense.expense_date),
    category_id: String(expense.category_id ?? ''),
    payment_method_id: String(expense.payment_method_id ?? ''),
    note: expense.note || '',
  }
}

export default function ExpenseForm({ expense, categories, paymentMethods, onSubmit, onCancel, saving, error, fieldErrors }) {
  const [values, setValues] = useState(() => initialValues(expense))

  function updateField(event) {
    const { name, value } = event.target
    setValues((previous) => ({ ...previous, [name]: value }))
  }

  function submit(event) {
    event.preventDefault()

    onSubmit({
      ...values,
      category_id: Number(values.category_id),
      payment_method_id: Number(values.payment_method_id),
      note: values.note.trim() === '' ? null : values.note,
    })
  }

  function fieldError(field) {
    return fieldErrors?.[field]?.[0]
  }

  return (
    <form className="card form-card" onSubmit={submit}>
      <StatusMessage message={error} />
      <div className="form-grid">
        <div className="field field--wide">
          <label htmlFor="description">Description <span aria-hidden="true">*</span></label>
          <input id="description" name="description" required maxLength={255} value={values.description} onChange={updateField} placeholder="e.g. Groceries at the supermarket" />
          {fieldError('description') && <span className="field-error">{fieldError('description')}</span>}
        </div>
        <div className="field">
          <label htmlFor="amount">Amount (RM) <span aria-hidden="true">*</span></label>
          <input id="amount" name="amount" type="number" required min="0.01" max="99999999.99" step="0.01" inputMode="decimal" value={values.amount} onChange={updateField} placeholder="0.00" />
          {fieldError('amount') && <span className="field-error">{fieldError('amount')}</span>}
        </div>
        <div className="field">
          <label htmlFor="expense_date">Expense date <span aria-hidden="true">*</span></label>
          <input id="expense_date" name="expense_date" type="date" required max={todayLocal()} value={values.expense_date} onChange={updateField} />
          {fieldError('expense_date') && <span className="field-error">{fieldError('expense_date')}</span>}
        </div>
        <div className="field">
          <label htmlFor="category_id">Category <span aria-hidden="true">*</span></label>
          <select id="category_id" name="category_id" required value={values.category_id} onChange={updateField}>
            <option value="">Choose a category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          {fieldError('category_id') && <span className="field-error">{fieldError('category_id')}</span>}
          {categories.length === 0 && <span className="field-help">Create a category from the Categories page first.</span>}
        </div>
        <div className="field">
          <label htmlFor="payment_method_id">Payment method <span aria-hidden="true">*</span></label>
          <select id="payment_method_id" name="payment_method_id" required value={values.payment_method_id} onChange={updateField}>
            <option value="">Choose a payment method</option>
            {paymentMethods.map((method) => <option key={method.id} value={method.id}>{method.name}</option>)}
          </select>
          {fieldError('payment_method_id') && <span className="field-error">{fieldError('payment_method_id')}</span>}
        </div>
        <div className="field field--wide">
          <label htmlFor="note">Note <span className="muted">(optional)</span></label>
          <textarea id="note" name="note" rows="3" value={values.note} onChange={updateField} placeholder="Add a little context, if useful" />
          {fieldError('note') && <span className="field-error">{fieldError('note')}</span>}
        </div>
      </div>
      <div className="form-actions">
        <button className="button button--subtle" type="button" onClick={onCancel} disabled={saving}>Cancel</button>
        <button className="button button--primary" type="submit" disabled={saving || categories.length === 0 || paymentMethods.length === 0}>
          {saving ? 'Saving…' : expense ? 'Save changes' : 'Create expense'}
        </button>
      </div>
    </form>
  )
}
