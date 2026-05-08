import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useModal } from '../contexts/ModalContext';
import { supabase } from '../lib/supabase';

import Sidebar from '../components/Sidebar/Sidebar';
import { useTopics } from '../hooks/useTopics';
import DeleteAccountModal from '../components/Modals/DeleteAccountModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Settings() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { activeModal, openModal, closeModal } = useModal();
  const { topics, fetchTopics } = useTopics();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    document.title = "Settings — Knowledge Base";
    fetchTopics();
    if (user?.user_metadata?.name) setName(user.user_metadata.name);
  }, [user, fetchTopics]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { name } });
      if (error) throw error;
      showToast('Profile updated.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { showToast('Passwords do not match.', 'error'); return; }
    setPassLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      showToast('Password updated.', 'success');
      setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <Sidebar topics={topics} onOpenModal={() => navigate('/home')} user={user} onLogout={() => openModal('logout')} />
      <main className="mobile-full" style={{ marginLeft: '260px', flex: 1, padding: '40px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <Button onClick={() => navigate('/home')} variant="outline" style={{ width: '40px', padding: 0 }}><ArrowLeft size={20} /></Button>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem' }}>Settings</h1>
          </header>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <section className="raised-card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <User size={24} color="var(--color-accent)" /> <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Profile</h2>
              </div>
              <form onSubmit={handleUpdateProfile}>
                <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
                <Input label="Email Address" value={user?.email || ''} readOnly style={{ backgroundColor: '#f9f9f9', cursor: 'not-allowed' }} />
                <Button type="submit" loading={profileLoading} style={{ width: 'auto' }}>Save Changes</Button>
              </form>
            </section>

            <section className="raised-card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Lock size={24} color="var(--color-accent)" /> <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Security</h2>
              </div>
              <form onSubmit={handleUpdatePassword}>
                <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" />
                <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <Button type="submit" loading={passLoading} style={{ width: 'auto' }}>Update Password</Button>
              </form>
            </section>

            <section className="raised-card" style={{ padding: '32px', borderLeft: '4px solid var(--color-danger)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Trash2 size={24} color="var(--color-danger)" /> <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-danger)' }}>Danger Zone</h2>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Permanently delete your account and all data.</p>
              <Button onClick={() => openModal('deleteAccount')} variant="danger" style={{ width: 'auto' }}>Delete Account</Button>
            </section>
          </div>
        </div>
      </main>
      {activeModal === 'deleteAccount' && <DeleteAccountModal onConfirm={async () => { setDeleteLoading(true); await supabase.rpc('delete_user'); await logout(); navigate('/login'); }} onClose={closeModal} loading={deleteLoading} />}
    </div>
  );
}
