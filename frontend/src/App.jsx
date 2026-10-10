import { useCallback, useEffect, useState } from 'react'
import Layout from './components/Layout.jsx'
import StatusMessage from './components/StatusMessage.jsx'
import { apiRequest } from './lib/api.js'
import CategoriesPage from './pages/CategoriesPage.jsx'
import ExpenseEditorPage from './pages/ExpenseEditorPage.jsx'
import ExpensesPage from './pages/ExpensesPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import './App.css'

const TOKEN_KEY = 'personal-expense-tracker-token'

function initialAuth() {
  const token = sessionStorage.getItem(TOKEN_KEY)
  return { token, user: null, checking: Boolean(token) }
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [auth, setAuth] = useState(initialAuth)
  const [sessionError, setSessionError] = useState('')
  const [logoutBusy, setLogoutBusy] = useState(false)

  const navigate = useCallback((destination) => {
    if (window.location.pathname !== destination) {
      window.history.pushState({}, '', destination)
    }
    setPath(destination)
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const handleBack = () => setPath(window.location.pathname)
    window.addEventListener('popstate', handleBack)
    return () => window.removeEventListener('popstate', handleBack)
  }, [])

  const clearSession = useCallback((message = '') => {
    sessionStorage.removeItem(TOKEN_KEY)
    setAuth({ token: null, user: null, checking: false })
    setSessionError(message)
    navigate('/login')
  }, [navigate])

  useEffect(() => {
    if (!auth.token) return
    let active = true

    apiRequest('/me', { token: auth.token }).then((result) => {
      if (active) setAuth((previous) => ({ ...previous, user: result.user, checking: false }))
    }).catch((failure) => {
      if (active) clearSession(failure.message)
    })

    return () => { active = false }
  }, [auth.token, clearSession])

  useEffect(() => {
    if (!auth.token && path !== '/login') {
      window.history.replaceState({}, '', '/login')
    } else if (auth.user && (path === '/login' || path === '/')) {
      window.history.replaceState({}, '', '/expenses')
    }
  }, [auth.token, auth.user, path])

  async function login(credentials) {
    const response = await apiRequest('/login', { method: 'POST', body: credentials })
    if (!response?.token) throw new Error('The login response did not contain a token.')

    sessionStorage.setItem(TOKEN_KEY, response.token)
    setSessionError('')
    setAuth({ token: response.token, user: null, checking: true })
    navigate('/expenses')
  }

  async function logout() {
    setLogoutBusy(true)
    setSessionError('')

    try {
      await apiRequest('/logout', { method: 'POST', token: auth.token })
      clearSession()
    } catch (failure) {
      if (failure.status === 401) {
        clearSession('Your session has expired. Please sign in again.')
      } else {
        setSessionError(failure.message)
      }
    } finally {
      setLogoutBusy(false)
    }
  }

  const request = useCallback(async (endpoint, options = {}) => {
    try {
      return await apiRequest(endpoint, { ...options, token: auth.token })
    } catch (failure) {
      if (failure.status === 401) {
        clearSession('Your session has expired. Please sign in again.')
      }
      throw failure
    }
  }, [auth.token, clearSession])

  if (!auth.token) {
    return <LoginPage onLogin={login} sessionError={sessionError} />
  }

  if (auth.checking || !auth.user) {
    return <main className="login-screen"><div className="card loading-card" role="status">Checking your session…</div></main>
  }

  const editMatch = path.match(/^\/expenses\/(\d+)\/edit$/)
  let page

  if (path === '/expenses/new') {
    page = <ExpenseEditorPage request={request} navigate={navigate} expenseId={null} />
  } else if (editMatch) {
    page = <ExpenseEditorPage key={editMatch[1]} request={request} navigate={navigate} expenseId={editMatch[1]} />
  } else if (path === '/categories') {
    page = <CategoriesPage request={request} />
  } else if (path === '/expenses' || path === '/login' || path === '/') {
    page = <ExpensesPage request={request} navigate={navigate} />
  } else {
    page = (
      <div className="card empty-state">
        <h2>Page not found</h2>
        <button className="button button--primary" onClick={() => navigate('/expenses')}>Back to expenses</button>
      </div>
    )
  }

  return (
    <Layout user={auth.user} activePath={path} navigate={navigate} onLogout={logout} logoutBusy={logoutBusy}>
      <StatusMessage message={sessionError} />
      {page}
    </Layout>
  )
}
