import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FolderOpen, ChevronRight, LogOut, Settings as SettingsIcon, User as UserIcon } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { useTopics } from '../hooks/useTopics';
import { useContent } from '../hooks/useContent';
import { useModal } from '../hooks/useModal';
import { useToast } from '../hooks/useToast';

import Sidebar from '../components/Sidebar/Sidebar';
import TopicDetail from '../components/TopicDetail/TopicDetail';
import AddTopicModal from '../components/Modals/AddTopicModal';
import AddContentModal from '../components/Modals/AddContentModal';
import DeleteConfirmModal from '../components/Modals/DeleteConfirmModal';
import LogoutModal from '../components/Modals/LogoutModal';
import SearchOverlay from '../components/Search/SearchOverlay';
import { ToastContainer } from '../components/Toast/Toast';

export default function Home() {
  const { user, logout } = useAuth();
  const { topics, loading: topicsLoading, fetchTopics, addTopic, editTopic, deleteTopic } = useTopics();
  const { content, loading: contentLoading, fetchContent, addContent, editContent, deleteContent } = useContent();
  const { activeModal, modalData, openModal, closeModal } = useModal();
  const { toasts, showToast, dismissToast } = useToast();
  const navigate = useNavigate();

  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Initial fetch
  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // Page Title & Content Fetch
  useEffect(() => {
    if (selectedTopicId) {
      fetchContent(selectedTopicId);
      
      const findTopic = (items) => {
        for (const item of items) {
          if (item.id === selectedTopicId) return item;
          if (item.children) {
            const found = findTopic(item.children);
            if (found) return found;
          }
        }
        return null;
      };
      const topic = findTopic(topics);
      setSelectedTopic(topic);
      if (topic) document.title = `${topic.name} — Knowledge Base`;
    } else {
      setSelectedTopic(null);
      document.title = "Knowledge Base";
    }
  }, [selectedTopicId, topics, fetchContent]);

  // Keyboard Shortcuts (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openModal('search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openModal]);

  // Handlers
  const handleSaveTopic = async (data) => {
    try {
      if (activeModal === 'editTopic') {
        await editTopic(modalData.id, data);
        showToast('Topic updated successfully', 'success');
      } else {
        await addTopic(data);
        showToast('Topic created successfully', 'success');
      }
      closeModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteTopic = async () => {
    try {
      await deleteTopic(modalData.id);
      showToast('Topic deleted', 'success');
      if (selectedTopicId === modalData.id) setSelectedTopicId(null);
      closeModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveContent = async (data) => {
    try {
      if (activeModal === 'editContent') {
        await editContent(modalData.id, data, selectedTopicId);
        showToast('Content updated', 'success');
      } else {
        await addContent(data);
        showToast('Content added', 'success');
      }
      closeModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteContent = async () => {
    try {
      await deleteContent(modalData.id, selectedTopicId);
      showToast('Content deleted', 'success');
      closeModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <Sidebar 
        topics={topics}
        selectedTopicId={selectedTopicId}
        onSelectTopic={setSelectedTopicId}
        onOpenModal={openModal}
        user={user}
        onLogout={() => openModal('logout')}
      />

      <main style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header style={{
          height: '64px',
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'white',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <span>All Topics</span>
            {selectedTopic && (
              <>
                <ChevronRight size={14} />
                <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{selectedTopic.name}</span>
              </>
            )}
          </div>
          
          {/* Navbar Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => openModal('search')}
              style={{
                height: '40px',
                padding: '0 12px 0 16px',
                borderRadius: '20px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              <Search size={18} />
              <span style={{ fontSize: '0.85rem' }}>Search...</span>
              <kbd style={{ 
                fontSize: '0.7rem', 
                backgroundColor: 'white', 
                padding: '2px 6px', 
                borderRadius: '4px',
                border: '1px solid var(--border)',
                marginLeft: '4px'
              }}>⌘K</kbd>
            </button>

            {/* User Avatar & Dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '20px',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {(user?.user_metadata?.name || user?.email || 'U')[0].toUpperCase()}
              </button>

              {showUserDropdown && (
                <>
                  <div 
                    onClick={() => setShowUserDropdown(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                  />
                  <div className="raised-card" style={{
                    position: 'absolute',
                    top: '48px',
                    right: 0,
                    width: '200px',
                    padding: '8px',
                    zIndex: 100,
                    backgroundColor: 'white'
                  }}>
                    <button 
                      onClick={() => { navigate('/settings'); setShowUserDropdown(false); }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        color: 'var(--accent)',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <SettingsIcon size={16} />
                      Settings
                    </button>
                    <button 
                      onClick={() => { openModal('logout'); setShowUserDropdown(false); }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        color: 'var(--danger)',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,59,48,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div style={{ flex: 1 }}>
          {selectedTopicId ? (
            <TopicDetail 
              topic={selectedTopic}
              content={content}
              loading={contentLoading}
              onOpenModal={openModal}
            />
          ) : (
            <div style={{ 
              height: 'calc(100vh - 64px)', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '24px',
              textAlign: 'center'
            }}>
              <div className="raised-card" style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '60px', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--disabled)'
              }}>
                <FolderOpen size={48} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '8px' }}>
                  Select a topic to get started
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Choose a topic from the sidebar or press <kbd style={{ background: '#eee', padding: '2px 4px', borderRadius: '4px' }}>⌘K</kbd> to search.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals Container */}
      {(activeModal === 'addTopic' || activeModal === 'editTopic') && (
        <AddTopicModal 
          topicToEdit={modalData}
          topics={topics}
          onSave={handleSaveTopic}
          onClose={closeModal}
          loading={topicsLoading}
        />
      )}

      {(activeModal === 'addContent' || activeModal === 'editContent') && (
        <AddContentModal 
          contentToEdit={activeModal === 'editContent' ? modalData : null}
          topicId={selectedTopicId || modalData?.topicId}
          defaultType={modalData?.defaultType}
          userId={user?.id}
          onSave={handleSaveContent}
          onClose={closeModal}
        />
      )}

      {activeModal === 'deleteTopic' && (
        <DeleteConfirmModal 
          itemName={modalData.name}
          onConfirm={handleDeleteTopic}
          onClose={closeModal}
          loading={topicsLoading}
        />
      )}

      {activeModal === 'deleteContent' && (
        <DeleteConfirmModal 
          itemName={modalData.title}
          onConfirm={handleDeleteContent}
          onClose={closeModal}
          loading={contentLoading}
        />
      )}

      {activeModal === 'logout' && (
        <LogoutModal 
          onConfirm={handleLogout}
          onClose={closeModal}
        />
      )}

      {activeModal === 'search' && (
        <SearchOverlay 
          onClose={closeModal}
          onNavigate={setSelectedTopicId}
          topicsList={topics}
        />
      )}

      <ToastContainer toasts={toasts} dismissToast={dismissToast} />
    </div>
  );
}
