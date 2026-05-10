import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Create Account — Knowledge Base";
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await register(name, email, password);
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
      <div className="raised-card auth-card" style={{ width: '100%', maxWidth: '400px', padding: '40px 32px' }}>
        <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '32px', fontFamily: 'var(--font-heading)' }}>Create Account</h1>
        <form onSubmit={handleRegister}>
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" />
          {error && <div className="error-text" style={{ marginBottom: '16px' }}>{error}</div>}
          <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '8px' }}>Register</Button>
        </form>
        <div className="auth-link">Already have an account? <Link to="/login"><span>Sign In</span></Link></div>
      </div>
    </div>
  );
}
