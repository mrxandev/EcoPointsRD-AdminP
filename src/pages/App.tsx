import { useAuthSession } from '../hooks/useAuthSession'
import Dashboard from './Dashboard'
import Login from './Login'

function App() {
  const { admin, isLoggedIn, logout, persistSession } = useAuthSession()

  if (!isLoggedIn) {
    return <Login onLogin={persistSession} />
  }

  return <Dashboard admin={admin!} onLogout={logout} />
}

export default App
