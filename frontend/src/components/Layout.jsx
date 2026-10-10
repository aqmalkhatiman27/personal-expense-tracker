export default function Layout({ user, activePath, navigate, onLogout, logoutBusy, children }) {
  function link(path, label) {
    const active = activePath === path || (path === '/expenses' && activePath.startsWith('/expenses/'))

    return (
      <a
        href={path}
        className={`nav-link${active ? ' nav-link--active' : ''}`}
        aria-current={active ? 'page' : undefined}
        onClick={(event) => {
          event.preventDefault()
          navigate(path)
        }}
      >
        {label}
      </a>
    )
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">◈</span>
            <div>
              <strong>Expense Tracker</strong>
              <span className="brand-subtitle">Personal spending, made simple</span>
            </div>
          </div>
          <nav aria-label="Main navigation" className="navigation">
            {link('/expenses', 'Expenses')}
            {link('/categories', 'Categories')}
          </nav>
          <div className="account-menu">
            <span className="account-name" title={user.email}>{user.name}</span>
            <button className="button button--subtle button--small" onClick={onLogout} disabled={logoutBusy}>
              {logoutBusy ? 'Signing out…' : 'Log out'}
            </button>
          </div>
        </div>
      </header>
      <main className="main-content">{children}</main>
      <footer className="site-footer">Personal Expense Tracker · SEC #13 final assignment</footer>
    </div>
  )
}
