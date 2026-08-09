import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  File, 
  Download, 
  Trash2, 
  Eye, 
  Share, 
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Folder,
  FileText,
  Image,
  FileType
} from 'lucide-react';
import { isFeatureEnabled } from '../../../config/features';
import { buildApiUrl } from '../../../config/api';
import './DocumentManager.css';

const DocumentManager = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef(null);
  
  const documentTypes = [
    { id: 'all', label: 'All Documents', icon: File },
    { id: 'lease', label: 'Lease Agreements', icon: FileText },
    { id: 'identification', label: 'ID Documents', icon: FileText },
    { id: 'payment', label: 'Payment Records', icon: FileType },
    { id: 'image', label: 'Images', icon: Image },
    { id: 'other', label: 'Other', icon: File }
  ];
  
  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType === 'application/pdf') return FileType;
    return FileText;
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  useEffect(() => {
    fetchDocuments();
  }, []);
  
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/hq/api/documents/'), {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else {
        throw new Error('Failed to fetch documents');
      }
    } catch (err) {
      setError('Failed to load documents');
      
      // Fallback to cached documents
      const cached = localStorage.getItem('documents_cache');
      if (cached) {
        setDocuments(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileUpload = async (files) => {
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      Array.from(files).forEach((file, index) => {
        formData.append(`files`, file);
        formData.append(`categories`, 'other'); // Default category
      });
      
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/hq/api/documents/upload/'), {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`
        },
        body: formData,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(prev => [...data.documents, ...prev]);
        
        // Update cache
        const updated = [...data.documents, ...documents];
        localStorage.setItem('documents_cache', JSON.stringify(updated));
        
        alert('Files uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  
  const handleDownload = async (document) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/hq/api/documents/${document.id}/download/`), {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = document.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      alert('Download failed. Please try again.');
    }
  };
  
  const handleDelete = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/hq/api/documents/${documentId}/`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        
        // Update cache
        const updated = documents.filter(doc => doc.id !== documentId);
        localStorage.setItem('documents_cache', JSON.stringify(updated));
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      alert('Delete failed. Please try again.');
    }
  };
  
  const handleShare = async (document) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/hq/api/documents/${document.id}/share/`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          expires_in: 7 // 7 days
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        navigator.clipboard.writeText(data.share_url);
        alert('Share link copied to clipboard!');
      } else {
        throw new Error('Share failed');
      }
    } catch (error) {
      alert('Share failed. Please try again.');
    }
  };
  
  const handleBulkDelete = async () => {
    if (selectedDocuments.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedDocuments.length} documents?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/hq/api/documents/bulk-delete/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          document_ids: selectedDocuments
        })
      });
      
      if (response.ok) {
        setDocuments(prev => prev.filter(doc => !selectedDocuments.includes(doc.id)));
        setSelectedDocuments([]);
        
        // Update cache
        const updated = documents.filter(doc => !selectedDocuments.includes(doc.id));
        localStorage.setItem('documents_cache', JSON.stringify(updated));
      } else {
        throw new Error('Bulk delete failed');
      }
    } catch (error) {
      alert('Bulk delete failed. Please try again.');
    }
  };
  
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || doc.category === filterType;
    return matchesSearch && matchesFilter;
  });
  
  const toggleDocumentSelection = (documentId) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };
  
  const selectAllDocuments = () => {
    setSelectedDocuments(filteredDocuments.map(doc => doc.id));
  };
  
  const clearSelection = () => {
    setSelectedDocuments([]);
  };
  
  if (loading) {
    return (
      <div className="document-manager-loading">
        <div className="loading-spinner"></div>
        <p>Loading documents...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="document-manager-error">
        <p>{error}</p>
        <button onClick={fetchDocuments} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="document-manager">
      <div className="document-header">
        <div className="document-title">
          <Folder size={24} />
          <h2>Document Manager</h2>
        </div>
        
        <div className="document-actions">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="upload-btn"
            disabled={uploading}
          >
            <Upload size={16} />
            {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Files'}
          </button>
          
          {selectedDocuments.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="bulk-delete-btn"
            >
              <Trash2 size={16} />
              Delete Selected ({selectedDocuments.length})
            </button>
          )}
        </div>
      </div>
      
      <div className="document-controls">
        <div className="search-section">
          <div className="search-input">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="filter-section">
          <div className="filter-dropdown">
            <Filter size={16} />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
            >
              {documentTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {selectedDocuments.length > 0 && (
        <div className="bulk-actions">
          <div className="selection-info">
            <span>{selectedDocuments.length} documents selected</span>
            <button onClick={clearSelection} className="clear-selection">
              Clear Selection
            </button>
          </div>
        </div>
      )}
      
      <div className={`document-grid ${viewMode}`}>
        {filteredDocuments.length === 0 ? (
          <div className="empty-state">
            <Folder size={48} />
            <h3>No Documents Found</h3>
            <p>Upload some documents to get started.</p>
          </div>
        ) : (
          filteredDocuments.map(document => {
            const FileIcon = getFileIcon(document.file_type);
            const isSelected = selectedDocuments.includes(document.id);
            
            return (
              <div 
                key={document.id}
                className={`document-item ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleDocumentSelection(document.id)}
              >
                <div className="document-icon">
                  <FileIcon size={24} />
                </div>
                
                <div className="document-info">
                  <h4 className="document-name">{document.name}</h4>
                  <p className="document-meta">
                    {formatFileSize(document.size)} • {formatDate(document.created_at)}
                  </p>
                  <p className="document-category">{document.category}</p>
                </div>
                
                <div className="document-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(document);
                    }}
                    className="action-btn"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(document);
                    }}
                    className="action-btn"
                    title="Share"
                  >
                    <Share size={16} />
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(document.id);
                    }}
                    className="action-btn delete"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFileUpload(e.target.files)}
      />
    </div>
  );
};

export default DocumentManager;
