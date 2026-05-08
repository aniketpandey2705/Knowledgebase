import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Trash2, ArrowLeft, Loader2, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useModal } from '../hooks/useModal';
import { supabase } from '../lib/supabase';

import Sidebar from '../components/Sidebar/Sidebar';
import { useTopics } from '../hooks/useTopics';
import DeleteAccountModal from '../components/Modals/DeleteAccountModal';
import { ToastContainer } from '../components/Toast/Toast';

export default function Settings() {
  const { user, logout } = useAuth();
  const { showToast, toasts, dismissToast } = useToast();
  const { activeModal, openModal, closeModal } = useModal();
  const { topics, fetchTopics } = useTopics();
  const navigate = useNavigate();

  // Profile State
  const [name, setName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    document.title = "Settings — Knowledge Base";
    fetchTopics();
    if (user?.user_metadata?.name) {
      setName(user.user_metadata.name);
    }
  }, [user, fetchTopics]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name }
      });
      if (error) throw error;
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }

    setPassLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      showToast('Password updated successfully', 'success');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      // Call the SQL function we defined
      const { error } = await supabase.rpc('delete_user');
      if (error) throw error;
      
      await logout();
      navigate('/login');
      showToast('Account deleted permanently', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteLoading(false);
      closeModal();
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <Sidebar 
        topics={topics}
        onOpenModal={() => navigate('/home')} // Redirect to home if they want to manage topics
        user={user}
        onLogout={() => openModal('logout')}
      />

      <main style={{ marginLeft: '260px', flex: 1, padding: '40px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <button 
              onClick={() => navigate('/home')}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '20px',
                border: '1px solid var(--border)',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem' }}>Settings</h1>
          </header>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Profile Section */}
            <section className="raised-card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <User size={24} color="var(--accent)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Profile Information</h2>
              </div>
              
              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text"
                    className="recessed-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email"
                    className="recessed-input"
                    value={user?.email || ''}
                    readOnly
                    style={{ backgroundColor: '#f9f9f9', cursor: 'not-allowed' }}
                  />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Contact support to change your email address.
                  </p>
                </div>
                <button 
                  type="submit" 
                  className="primary-button" 
                  disabled={profileLoading}
                  style={{ width: 'auto', padding: '12px 32px' }}
                >
                  {profileLoading ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
                </button>
              </form>
            </section>

            {/* Password Section */}
            <section className="raised-card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Lock size={24} color="var(--accent)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Security</h2>
              </div>
              
              <form onSubmit={handleUpdatePassword}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input 
                    type="password"
                    className="recessed-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input 
                    type="password"
                    className="recessed-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                  />
                </div>
                <button 
                  type="submit" 
                  className="primary-button" 
                  disabled={passLoading}
                  style={{ width: 'auto', padding: '12px 32px' }}
                >
                  {passLoading ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
                </button>
              </form>
            </section>

            {/* Danger Zone */}
            <section className="raised-card" style={{ padding: '32px', borderLeft: '4px solid var(--danger)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Trash2 size={24} color="var(--danger)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--danger)' }}>Danger Zone</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
                Permanently delete your account and all associated data. This action is irreversible.
              </p>
              <button 
                onClick={() => openModal('deleteAccount')}
                style={{ 
                  padding: '10px 24px', 
                  borderRadius: '8px', 
                  border: '1px solid var(--danger)', 
                  backgroundColor: 'transparent',
                  color: 'var(--danger)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Delete My Account
              </button>
            </section>
          </div>
        </div>
      </main>

      {activeModal === 'deleteAccount' && (
        <DeleteAccountModal 
          onConfirm={handleDeleteAccount}
          onClose={closeModal}
          loading={deleteLoading}
        />
      )}

      <ToastContainer toasts={toasts} dismissToast={dismissToast} />
    </div>
  );
}
