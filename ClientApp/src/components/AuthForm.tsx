import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/api';
import '../App.css';

interface AuthFormProps {
  type: 'login' | 'register';
  onSuccess?: () => void;
}

export function AuthForm({ type, onSuccess }: AuthFormProps) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      if (type === 'register') {
        await AuthService.register(username, password);
        navigate('/login');
      } else {
        await AuthService.login(username, password);
        onSuccess?.();
        navigate('/'); // Redirect to home after successful login
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{type === 'login' ? 'Login' : 'Register'}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Loading...' : type === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
        <p className="auth-switch">
          {type === 'login' ? (
            <>
              Don't have an account? <a href="/register">Register</a>
            </>
          ) : (
            <>
              Already have an account? <a href="/login">Login</a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
