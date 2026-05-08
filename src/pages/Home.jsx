import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FolderOpen, Folder, ChevronRight, LogOut, Settings as SettingsIcon } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { useTopics } from '../hooks/useTopics';
import { useContent } from '../hooks/useContent';
import { useModal } from '../contexts/ModalContext';
import { useToast } from '../contexts/ToastContext';

import Sidebar from '../components/Sidebar/Sidebar';
import TopicDetail from '../components/TopicDetail/TopicDetail';
import BrowseView from '../components/BrowseView/BrowseView';
import AddTopicModal from '../components/Modals/AddTopicModal';
import AddContentModal from '../components/Modals/AddContentModal';
import DeleteConfirmModal from '../components/Modals/DeleteConfirmModal';
import LogoutModal from '../components/Modals/LogoutModal';
import SearchOverlay from '../components/Search/SearchOverlay';
import { useRecentTopics } from '../hooks/useRecentTopics';

export default function Home() {
  const { user, logout } = useAuth();
  const { topics, flatTopics, loading: topicsLoading, fetchTopics, addTopic, editTopic, deleteTopic } = useTopics();
  const { content, loading: contentLoading, fetchContent, addContent, editContent, deleteContent } = useContent();
  const { activeModal, modalData, openModal, closeModal } = useModal();
  const { showToast } = useToast();
  const { addRecent, getRecent, clearRecent } = useRecentTopics();
  const navigate = useNavigate();

  // Persistence: Restore last selected topic
  const [selectedTopicId, setSelectedTopicId] = useState(() => {
    return localStorage.getItem('kb_last_topic') || null;
  });
  const [browseType, setBrowseType] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [highlightContentId, setHighlightContentId] = useState(null);

  useEffect(() => {
    fetchTopics();
    fetchContent(); // Fetch all content for sidebar counts
  }, [fetchTopics, fetchContent]);

  useEffect(() => {
    if (selectedTopicId) {
      localStorage.setItem('kb_last_topic', selectedTopicId);
      // Removed: fetchContent(selectedTopicId) - we already have all content
      
      const topic = flatTopics.find(t => t.id === selectedTopicId);
      setSelectedTopic(topic);
      if (topic) {
        document.title = `${topic.name} — Knowledge Base`;
        addRecent(topic);
      }
    } else {
      setSelectedTopic(null);
      document.title = "Knowledge Base";
    }
  }, [selectedTopicId, flatTopics, fetchContent, addRecent]);

  const handleSelectTopic = (id) => {
    setSelectedTopicId(id);
    setBrowseType(null);
  };

  const handleSelectBrowse = (type) => {
    setBrowseType(type);
    setSelectedTopicId(null);
  };

  const handleLogout = async () => {
    clearRecent();
    await logout();
    navigate('/login');
  };

  // Keyboard Shortcuts
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

  const handleSaveTopic = async (data) => {
    try {
      if (activeModal === 'editTopic') {
        await editTopic(modalData.id, data);
        showToast('Topic updated.', 'success');
      } else {
        const newTopic = await addTopic(data);
        setSelectedTopicId(newTopic.id); // Auto-select new topic
        showToast('Topic added.', 'success');
      }
      closeModal();
    } catch (err) {}
  };

  const handleSaveContent = async (data) => {
    try {
      if (activeModal === 'editContent') {
        await editContent(modalData.id, data);
        showToast('Content updated.', 'success');
      } else {
        await addContent(data);
        showToast('Content added.', 'success');
      }
      closeModal();
    } catch (err) {}
  };

  const contentCountMap = content.reduce((acc, item) => {
    acc[item.topic_id] = (acc[item.topic_id] || 0) + 1;
    return acc;
  }, {});

  const recentTopics = getRecent(flatTopics);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <Sidebar 
        topics={topics} loading={topicsLoading}
        selectedTopicId={selectedTopicId} onSelectTopic={handleSelectTopic}
        onOpenModal={openModal} user={user} onLogout={() => openModal('logout')}
        browseType={browseType} onSelectBrowse={handleSelectBrowse}
        contentCountMap={contentCountMap}
      />

      <main className="mobile-full" style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header style={{ height: '64px', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--color-base)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            <span>All Topics</span>
            {selectedTopic && (<><ChevronRight size={14} /><span style={{ color: 'var(--color-accent)', fontWeight: 500 }}>{selectedTopic.name}</span></>)}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => openModal('search')} className="btn-active-effect" style={{ height: '40px', padding: '0 12px 0 16px', borderRadius: '20px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
              <Search size={18} /> <span className="mobile-hide">Search...</span> <kbd style={{ fontSize: '0.7rem', backgroundColor: 'var(--color-base)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>⌘K</kbd>
            </button>

            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowUserDropdown(!showUserDropdown)} className="btn-active-effect" style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: 'var(--color-accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                {(user?.user_metadata?.name || user?.email || 'U')[0].toUpperCase()}
              </button>

              {showUserDropdown && (
                <><div onClick={() => setShowUserDropdown(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
                <div className="raised-card" style={{ position: 'absolute', top: '48px', right: 0, width: '200px', padding: '8px', zIndex: 100, backgroundColor: 'var(--color-base)' }}>
                  <button onClick={() => { navigate('/settings'); setShowUserDropdown(false); }} className="dropdown-item"><SettingsIcon size={16} /> Settings</button>
                  <button onClick={() => { setShowUserDropdown(false); handleLogout(); }} className="dropdown-item" style={{ color: 'var(--color-danger)' }}><LogOut size={16} /> Log Out</button>
                </div></>
              )}
            </div>
          </div>
        </header>

        <div style={{ flex: 1 }}>
          {browseType ? (
            <BrowseView 
              type={browseType} 
              onClose={() => setBrowseType(null)} 
              onNavigateToTopic={(topicId, contentId) => {
                setSelectedTopicId(topicId);
                setHighlightContentId(contentId);
                setBrowseType(null);
              }} 
            />
          ) : selectedTopicId ? (
            <TopicDetail 
              topic={selectedTopic} 
              content={content} 
              loading={contentLoading} 
              onOpenModal={openModal}
              highlightContentId={highlightContentId}
              setHighlightContentId={setHighlightContentId}
            />
          ) : (
            <div style={{ padding: '80px 40px', maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', marginBottom: '16px' }}>Welcome back.</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.2rem' }}>Choose a topic or browse by type.</p>
              </div>

              {recentTopics.length > 0 && (
                <div>
                  <h2 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>Recently Visited</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {recentTopics.map(recent => (
                      <div 
                        key={recent.id} 
                        className="raised-card btn-active-effect"
                        onClick={() => handleSelectTopic(recent.id)}
                        style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
                      >
                        <div style={{ color: 'var(--color-accent)' }}><Folder size={20} /></div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 500 }}>{recent.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-disabled)' }}>{formatTimeAgo(recent.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {(activeModal === 'addTopic' || activeModal === 'editTopic') && <AddTopicModal topicToEdit={modalData} topics={topics} onSave={handleSaveTopic} onClose={closeModal} loading={topicsLoading} />}
      {(activeModal === 'addContent' || activeModal === 'editContent') && <AddContentModal contentToEdit={activeModal === 'editContent' ? modalData : null} topicId={selectedTopicId || modalData?.topicId} defaultType={modalData?.defaultType} userId={user?.id} onSave={handleSaveContent} onClose={closeModal} />}
      {activeModal === 'deleteTopic' && <DeleteConfirmModal itemName={modalData.name} onConfirm={async () => { await deleteTopic(modalData.id); if (selectedTopicId === modalData.id) setSelectedTopicId(null); closeModal(); }} onClose={closeModal} loading={topicsLoading} />}
      {activeModal === 'deleteContent' && <DeleteConfirmModal itemName={modalData.title} onConfirm={async () => { await deleteContent(modalData.id, modalData.file_url); closeModal(); }} onClose={closeModal} loading={contentLoading} />}
      {activeModal === 'logout' && <LogoutModal onConfirm={handleLogout} onClose={closeModal} />}
      {activeModal === 'search' && <SearchOverlay onClose={closeModal} onNavigate={setSelectedTopicId} topicsList={topics} />}

      <style>{`.dropdown-item { width: 100%; padding: 10px 12px; display: flex; alignItems: center; gap: 10px; border: none; background: none; cursor: pointer; borderRadius: 6px; fontSize: 0.9rem; color: var(--color-accent); transition: background 0.2s; } .dropdown-item:hover { background: var(--color-bg); }`}</style>
    </div>
  );
}

function formatTimeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
