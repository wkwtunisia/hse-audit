import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { useNavigate } from 'react-router-dom'
import './styles.css'

function App() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [user, setUser] = useState(null)
  const [role, setRole] = useState('user')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        setRole(session.user.app_metadata?.role || 'user')
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setRole(session?.user?.app_metadata?.role || 'user')
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user && role === 'admin') {
      navigate('/dashboard')
    }
  }, [user, role, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Login successful! Redirecting...')
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole('user')
    navigate('/')
  }

  if (user && role !== 'admin') {
    return (
      <div className="login-container">
        <div className="page-header">
          <img src="https://3dologie.com/wp-content/uploads/2024/07/WKW-Automotive-Logo.png" alt="WKW Automotive Logo" className="app-logo" />
          <h1 className="logo-title">HSE AUDIT</h1>
        </div>

        <p className="subtitle">You are already logged in as {user.email}</p>

        <div style={{ textAlign: 'center', margin: '50px 0' }}>
          <button
            onClick={() => navigate('/form')}
            className="login-btn"
            style={{ width: '320px', padding: '20px', fontSize: '20px', fontWeight: '600' }}
          >
            New Audit
          </button>
        </div>

        <button onClick={handleLogout} className="login-btn" style={{ background: '#e53e3e', marginTop: '20px', padding: '14px 28px' }}>
          Logout
        </button>

        <p className="footer-text">Health, Safety & Environment Audit System</p>
      </div>
    )
  }

  if (user && role === 'admin') {
    return (
      <div className="login-container">
        <div className="page-header">
          <img src="https://3dologie.com/wp-content/uploads/2024/07/WKW-Automotive-Logo.png" alt="WKW Automotive Logo" className="app-logo" />
          <h1 className="logo-title">HSE AUDIT</h1>
        </div>
        <p className="subtitle">Redirecting to Admin Dashboard...</p>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="page-header">
        <img src="https://3dologie.com/wp-content/uploads/2024/07/WKW-Automotive-Logo.png" alt="WKW Automotive Logo" className="app-logo" />
        <h1 className="logo-title">HSE AUDIT</h1>
      </div>

      <p className="subtitle">Login to continue</p>

      {error && <div className="message error">{error}</div>}
      {message && <div className="message success">{message}</div>}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" autoComplete="email" />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>

        <button type="submit" disabled={loading} className="login-btn">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="footer-text">Health, Safety & Environment Audit System</p>
    </div>
  )
}

export default App