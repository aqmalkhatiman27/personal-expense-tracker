import { useEffect, useState } from 'react'
import StatusMessage from '../components/StatusMessage.jsx'

export default function CategoriesPage({ request }) {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true

    request('/categories').then((result) => {
      if (active) setCategories(result.data)
    }).catch((failure) => {
      if (active) setError(failure.message)
    }).finally(() => {
      if (active) setLoading(false)
    })

    return () => { active = false }
  }, [request])

  async function createCategory(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setFieldError('')
    setNotice('')

    try {
      const result = await request('/categories', {
        method: 'POST',
        body: { name: name.trim() },
      })
      setCategories((previous) => [...previous, result.data].sort((a, b) => a.name.localeCompare(b.name)))
      setName('')
      setNotice('Category created.')
    } catch (failure) {
      setError(failure.message)
      setFieldError(failure.errors?.name?.[0] || '')
    } finally {
      setSaving(false)
    }
  }

  async function deleteCategory(category) {
    if (!window.confirm(`Delete the “${category.name}” category?`)) return

    setDeletingId(category.id)
    setError('')
    setNotice('')

    try {
      await request(`/categories/${category.id}`, { method: 'DELETE' })
      setCategories((previous) => previous.filter((item) => item.id !== category.id))
      setNotice('Category deleted.')
    } catch (failure) {
      setError(failure.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="form-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ORGANISE EXPENSES</span>
          <h1>Categories</h1>
          <p className="muted">Manage the labels available in your expense forms.</p>
        </div>
      </div>
      <StatusMessage message={error} />
      <StatusMessage message={notice} kind="success" />
      <div className="card category-card">
        <h2>Add a category</h2>
        <form className="category-form" onSubmit={createCategory}>
          <div className="field">
            <label htmlFor="category-name">Category name</label>
            <input id="category-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={255} placeholder="e.g. Food" />
            {fieldError && <span className="field-error">{fieldError}</span>}
          </div>
          <button className="button button--primary" type="submit" disabled={saving || !name.trim()}>
            {saving ? 'Adding…' : 'Add category'}
          </button>
        </form>
      </div>
      <div className="card category-card category-list-card">
        <div className="section-heading">
          <h2>Your categories</h2>
          <span className="muted">{categories.length} total</span>
        </div>
        {loading ? (
          <p role="status">Loading categories…</p>
        ) : categories.length === 0 ? (
          <p className="muted">No categories yet. Add one above to begin.</p>
        ) : (
          <ul className="category-list">
            {categories.map((category) => (
              <li key={category.id}>
                <span><span className="category-dot" aria-hidden="true" />{category.name}</span>
                <button className="button button--text button--danger-text" onClick={() => deleteCategory(category)} disabled={deletingId === category.id}>
                  {deletingId === category.id ? 'Deleting…' : 'Delete'}
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="field-help">A category cannot be deleted while expenses use it.</p>
      </div>
    </section>
  )
}
