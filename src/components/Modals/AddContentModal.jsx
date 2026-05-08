import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, File, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useUpload } from '../../hooks/useUpload';

export default function AddContentModal({ 
  contentToEdit, 
  topicId, 
  defaultType,
  userId,
  onSave, 
  onClose 
}) {
  const [type, setType] = useState(defaultType || 'question');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const { uploadFile, progress, loading: uploading, error: uploadError } = useUpload();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (contentToEdit) {
      setType(contentToEdit.type);
      setTitle(contentToEdit.title);
      setBody(contentToEdit.body || '');
      if (contentToEdit.file_url) {
        setFilePreview(contentToEdit.file_url);
      }
    }
  }, [contentToEdit]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(selectedFile));
      } else {
        setFilePreview(null);
      }
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const selectedFile = e.dataTransfer.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(selectedFile));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    let file_url = contentToEdit?.file_url || null;
    let file_name = contentToEdit?.file_name || null;

    try {
      if (file && (type === 'pdf' || type === 'image')) {
        const uploadResult = await uploadFile(file, userId);
        file_url = uploadResult.publicUrl;
        file_name = uploadResult.fileName;
      }

      onSave({
        topic_id: topicId,
        type,
        title: title.trim(),
        body: (type === 'question' || type === 'note') ? body.trim() : null,
        file_url,
        file_name
      });
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const types = [
    { id: 'question', label: 'Question' },
    { id: 'pdf', label: 'PDF' },
    { id: 'image', label: 'Image' },
    { id: 'note', label: 'Note' },
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="raised-card" style={{
        width: '100%',
        maxWidth: '550px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)'
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{ 
          fontFamily: 'var(--font-heading)', 
          fontSize: '1.5rem', 
          marginBottom: '24px' 
        }}>
          {contentToEdit ? 'Edit Content' : 'Add New Content'}
        </h2>

        {/* Segmented Control */}
        {!contentToEdit && (
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--background)',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '24px'
          }}>
            {types.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  backgroundColor: type === t.id ? 'white' : 'transparent',
                  color: type === t.id ? 'var(--accent)' : 'var(--text-secondary)',
                  boxShadow: type === t.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 150ms ease'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input 
              type="text"
              required
              className="recessed-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Enter ${type} title`}
            />
          </div>

          {(type === 'question' || type === 'note') ? (
            <div className="form-group">
              <label className="form-label">Body Text</label>
              <textarea 
                className="recessed-input"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                placeholder="Write your content here..."
                style={{ resize: 'vertical' }}
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">File Upload</label>
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  height: '160px',
                  border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  backgroundColor: isDragging ? 'rgba(0,0,0,0.02)' : 'transparent',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden'
                }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept={type === 'pdf' ? '.pdf' : 'image/*'}
                  style={{ display: 'none' }}
                />
                
                {filePreview && type === 'image' ? (
                  <img src={filePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : file ? (
                  <>
                    <File size={32} color="var(--accent)" />
                    <p style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 500 }}>{file.name}</p>
                  </>
                ) : (
                  <>
                    <Upload size={32} color="var(--disabled)" />
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Drag and drop or <span style={{ color: 'var(--accent)', fontWeight: 500 }}>browse</span>
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--disabled)' }}>
                      {type === 'pdf' ? 'Supports: PDF' : 'Supports: JPG, PNG, GIF'}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {uploading && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--background)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--accent)', transition: 'width 0.2s ease' }} />
              </div>
            </div>
          )}

          {uploadError && <p className="error-text" style={{ marginBottom: '16px' }}>{uploadError}</p>}

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button 
              type="button" 
              onClick={onClose}
              className="primary-button"
              style={{ backgroundColor: 'var(--disabled)', background: 'var(--disabled)', flex: 1 }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="primary-button"
              disabled={uploading || (file && uploading)}
              style={{ flex: 1 }}
            >
              {uploading ? <Loader2 size={18} className="animate-spin" /> : (contentToEdit ? 'Save Changes' : 'Add Content')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
