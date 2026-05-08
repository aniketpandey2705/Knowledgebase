import React, { useState, useEffect, useRef } from 'react';
import { Upload, File, Image as ImageIcon, X } from 'lucide-react';
import { wordCount, charCount } from '../../utils/textUtils';
import { useUpload } from '../../hooks/useUpload';
import ModalBase from '../ui/ModalBase';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function AddContentModal({ contentToEdit, topicId, defaultType, userId, onSave, onClose }) {
  const [type, setType] = useState(defaultType || 'question');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  
  const { uploadFile, progress, loading: uploading, error: uploadError } = useUpload();
  const titleRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
    if (contentToEdit) {
      setType(contentToEdit.type);
      setTitle(contentToEdit.title);
      setBody(contentToEdit.body || '');
      setTags(contentToEdit.tags || []);
      if (contentToEdit.file_url) setFilePreview(contentToEdit.file_url);
    }
  }, [contentToEdit]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase();
      if (val.length > 20) return;
      if (tags.length >= 5) return;
      if (!tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput('');
    }
  };

  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError('File too large (max 10MB)');
        return;
      }
      setError('');
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(selectedFile));
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    if (title.length > 150) { setError('Title too long (max 150)'); return; }
    if (body.length > 10000) { setError('Content too long (max 10,000)'); return; }

    let file_url = contentToEdit?.file_url || null;
    let file_name = contentToEdit?.file_name || null;

    try {
      if (file && (type === 'pdf' || type === 'image')) {
        const uploadResult = await uploadFile(file, userId, type);
        file_url = uploadResult.publicUrl;
        file_name = uploadResult.fileName;
      }
      onSave({
        topic_id: topicId, type, title: title.trim(),
        body: (type === 'question' || type === 'note') ? body.trim() : null,
        file_url, file_name,
        tags
      });
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const hasUnsavedChanges = title.trim() !== (contentToEdit?.title || '') || body.trim() !== (contentToEdit?.body || '');

  return (
    <ModalBase 
      title={contentToEdit ? 'Edit Content' : 'Add New Content'} 
      onClose={onClose} 
      maxWidth="550px"
      hasUnsavedChanges={hasUnsavedChanges}
    >
      {!contentToEdit && (
        <div style={{ display: 'flex', backgroundColor: 'var(--color-bg)', padding: '4px', borderRadius: '10px', marginBottom: '24px' }}>
          {['question', 'pdf', 'image', 'note'].map(t => (
            <button key={t} onClick={() => setType(t)} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', backgroundColor: type === t ? 'white' : 'transparent', color: type === t ? 'var(--accent)' : 'var(--text-secondary)', boxShadow: type === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === 'Enter' && handleSubmit(e)}>
        <Input 
          ref={titleRef} label="Title" required value={title}
          onChange={(e) => { setTitle(e.target.value); setError(''); }}
          error={error} placeholder={`Enter ${type} title`}
        />

        {(type === 'question' || type === 'note') ? (
          <div className="form-group">
            <Textarea 
              label="Body Text" value={body} rows={6} maxLength={10000}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your content here..."
            />
            <div style={{ 
              marginTop: '4px', fontSize: '12px', display: 'flex', justifyContent: 'space-between',
              color: charCount(body) >= 10000 ? '#FF3B30' : charCount(body) >= 8000 ? '#FF9500' : '#6C6C70'
            }}>
              <span>{wordCount(body)} words  &bull;  {charCount(body)} characters</span>
              {charCount(body) >= 8000 && <span>{10000 - charCount(body)} characters remaining</span>}
            </div>
          </div>
        ) : (
          <div className="form-group">
            <label className="form-label">File Upload</label>
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileChange(e.dataTransfer.files[0]); }}
              onClick={() => fileInputRef.current?.click()}
              style={{ height: '160px', border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', backgroundColor: isDragging ? 'rgba(0,0,0,0.02)' : 'transparent', overflow: 'hidden' }}
            >
              <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files[0])} accept={type === 'pdf' ? '.pdf' : 'image/*'} style={{ display: 'none' }} />
              {filePreview && type === 'image' ? (
                <img src={filePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : file ? (
                <><File size={32} color="var(--accent)" /><p style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 500 }}>{file.name}</p></>
              ) : (
                <><Upload size={32} color="var(--disabled)" /><p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Drag and drop or browse</p></>
              )}
            </div>
            {uploadError && <p className="error-text">{uploadError}</p>}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Tags (Enter to add)</label>
          <div className="recessed-input" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '44px' }}>
            {tags.map((tag, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#F2F2F7', color: '#6C6C70', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                #{tag} <X size={12} onClick={() => setTags(tags.filter((_, idx) => idx !== i))} style={{ cursor: 'pointer' }} />
              </span>
            ))}
            <input 
              type="text" value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder={tags.length === 0 ? "add tags..." : ""}
              style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, minWidth: '60px' }}
            />
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Max 5 tags, 20 chars each.</p>
        </div>

        {uploading && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}><span>Uploading...</span><span>{progress}%</span></div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-bg)', borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--color-accent)', transition: 'width 0.2s ease' }} /></div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
          <Button type="submit" loading={uploading} style={{ flex: 1 }}>{contentToEdit ? 'Save Changes' : 'Add Content'}</Button>
        </div>
      </form>
    </ModalBase>
  );
}
