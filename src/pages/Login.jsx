import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sign In — Knowledge Base";
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await login(email, password);
      if (error) throw error;
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundColor: 'var(--color-bg)' }}>
      <div className="raised-card" style={{ width: '100%', maxWidth: '400px', padding: '40px 32px' }}>
        <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '32px', fontFamily: 'var(--font-heading)' }}>KnowledgeBase</h1>
        <form onSubmit={handleLogin}>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          <div style={{ position: 'relative' }}>
            <Input label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ paddingRight: '40px' }} />
            <Button 
              variant="icon"
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              style={{ position: 'absolute', right: '12px', top: '38px' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
          </div>
          {error && <div className="error-text" style={{ marginBottom: '16px' }}>{error}</div>}
          <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '8px' }}>Sign In</Button>
        </form>
        <div className="auth-link">Don't have an account? <Link to="/register"><span>Register</span></Link></div>
      </div>
    </div>
  );
}
