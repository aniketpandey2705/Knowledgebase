import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FolderOpen, ChevronRight, LogOut, Settings as SettingsIcon } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { useTopics } from '../hooks/useTopics';
import { useContent } from '../hooks/useContent';
import { useModal } from '../contexts/ModalContext';
import { useToast } from '../contexts/ToastContext';

import Sidebar from '../components/Sidebar/Sidebar';
import TopicDetail from '../components/TopicDetail/TopicDetail';
import AddTopicModal from '../components/Modals/AddTopicModal';
import AddContentModal from '../components/Modals/AddContentModal';
import DeleteConfirmModal from '../components/Modals/DeleteConfirmModal';
import LogoutModal from '../components/Modals/LogoutModal';
import SearchOverlay from '../components/Search/SearchOverlay';

export default function Home() {
  const { user, logout } = useAuth();
  const { topics, loading: topicsLoading, fetchTopics, addTopic, editTopic, deleteTopic } = useTopics();
  const { content, loading: contentLoading, fetchContent, addContent, editContent, deleteContent } = useContent();
  const { activeModal, modalData, openModal, closeModal } = useModal();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Persistence: Restore last selected topic
  const [selectedTopicId, setSelectedTopicId] = useState(() => {
    return localStorage.getItem('kb_last_topic') || null;
  });
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  useEffect(() => {
    if (selectedTopicId) {
      localStorage.setItem('kb_last_topic', selectedTopicId);
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <Sidebar 
        topics={topics} loading={topicsLoading}
        selectedTopicId={selectedTopicId} onSelectTopic={setSelectedTopicId}
        onOpenModal={openModal} user={user} onLogout={() => openModal('logout')}
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
                  <button onClick={() => { openModal('logout'); setShowUserDropdown(false); }} className="dropdown-item" style={{ color: 'var(--color-danger)' }}><LogOut size={16} /> Log Out</button>
                </div></>
              )}
            </div>
          </div>
        </header>

        <div style={{ flex: 1 }}>
          {selectedTopicId ? (
            <TopicDetail topic={selectedTopic} content={content} loading={contentLoading} onOpenModal={openModal} />
          ) : (
            <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', textAlign: 'center' }}>
              <div className="raised-card" style={{ width: '120px', height: '120px', borderRadius: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-disabled)' }}><FolderOpen size={48} /></div>
              <div><h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '8px' }}>Select a topic</h2><p style={{ color: 'var(--color-text-secondary)' }}>Choose from sidebar or press <kbd>⌘K</kbd></p></div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {(activeModal === 'addTopic' || activeModal === 'editTopic') && <AddTopicModal topicToEdit={modalData} topics={topics} onSave={handleSaveTopic} onClose={closeModal} loading={topicsLoading} />}
      {(activeModal === 'addContent' || activeModal === 'editContent') && <AddContentModal contentToEdit={activeModal === 'editContent' ? modalData : null} topicId={selectedTopicId || modalData?.topicId} defaultType={modalData?.defaultType} userId={user?.id} onSave={handleSaveContent} onClose={closeModal} />}
      {activeModal === 'deleteTopic' && <DeleteConfirmModal itemName={modalData.name} onConfirm={async () => { await deleteTopic(modalData.id); if (selectedTopicId === modalData.id) setSelectedTopicId(null); closeModal(); }} onClose={closeModal} loading={topicsLoading} />}
      {activeModal === 'deleteContent' && <DeleteConfirmModal itemName={modalData.title} onConfirm={async () => { await deleteContent(modalData.id, modalData.file_url); closeModal(); }} onClose={closeModal} loading={contentLoading} />}
      {activeModal === 'logout' && <LogoutModal onConfirm={async () => { await logout(); navigate('/login'); }} onClose={closeModal} />}
      {activeModal === 'search' && <SearchOverlay onClose={closeModal} onNavigate={setSelectedTopicId} topicsList={topics} />}

      <style>{`.dropdown-item { width: 100%; padding: 10px 12px; display: flex; alignItems: center; gap: 10px; border: none; background: none; cursor: pointer; borderRadius: 6px; fontSize: 0.9rem; color: var(--color-accent); transition: background 0.2s; } .dropdown-item:hover { background: var(--color-bg); }`}</style>
    </div>
  );
}
