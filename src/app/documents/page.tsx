'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload, FileText, Trash2, Download, Search, Filter,
  File, Image, Table, Presentation, X
} from 'lucide-react';

interface DocumentItem {
  id: number;
  title: string;
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  category: string | null;
  createdAt: string;
  uploadedBy: { id: number; name: string | null; email: string } | null;
  project: { id: number; name: string } | null;
}

const CATEGORIES = [
  'All',
  'Charter',
  'Architecture',
  'Evaluation',
  'Security',
  'Compliance',
  'Report',
  'Design',
  'Other',
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType === 'text/csv') return Table;
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return Presentation;
  if (mimeType === 'application/pdf') return FileText;
  return File;
}

function getFileColor(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'text-[#a78bfa] bg-[rgba(139,92,246,0.1)]';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType === 'text/csv') return 'text-[var(--success)] bg-[var(--success-soft)]';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'text-[var(--warning)] bg-[var(--warning-soft)]';
  if (mimeType === 'application/pdf') return 'text-[var(--error)] bg-[var(--error-soft)]';
  if (mimeType.includes('word')) return 'text-[var(--info)] bg-[var(--info-soft)]';
  return 'text-[var(--text-3)] bg-[var(--surface)]';
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dragActive, setDragActive] = useState(false);

  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle.trim()) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle.trim());
      if (uploadCategory) formData.append('category', uploadCategory);

      const res = await fetch('/api/documents', { method: 'POST', body: formData });
      if (res.ok) {
        setUploadTitle('');
        setUploadCategory('');
        setUploadFile(null);
        setShowUpload(false);
        fetchDocuments();
      } else {
        const data = await res.json();
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this document? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadFile(file);
      if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^.]+$/, ''));
      setShowUpload(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^.]+$/, ''));
    }
  };

  const filtered = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.filename.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === 'All' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div
      className="flex flex-col gap-6 animate-fade-in"
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">Documents</h1>
          <p className="text-sm text-[var(--text-3)] mt-1">Upload and manage project documents.</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white text-[13px] font-bold rounded-[var(--radius-sm)] hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Upload size={15} />
          Upload Document
        </button>
      </div>

      {/* Drag overlay */}
      {dragActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--accent)]/10 backdrop-blur-sm pointer-events-none">
          <div className="bg-[var(--surface)] border-2 border-dashed border-[var(--accent)] rounded-2xl p-12 text-center">
            <Upload size={48} className="text-[var(--accent)] mx-auto mb-4" />
            <p className="text-lg font-bold text-[var(--text)]">Drop file to upload</p>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--surface)] rounded-2xl w-full max-w-[480px] mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <h2 className="text-[16px] font-bold text-[var(--text)]">Upload Document</h2>
              <button
                onClick={() => { setShowUpload(false); setUploadFile(null); setUploadTitle(''); setUploadCategory(''); }}
                className="text-[var(--text-4)] hover:text-[var(--text)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              {/* File picker */}
              <div>
                <label className="block text-[12px] font-bold text-[var(--text-3)] mb-1.5">File</label>
                {uploadFile ? (
                  <div className="flex items-center gap-3 px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl">
                    <FileText size={16} className="text-[var(--accent)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-[var(--text)] truncate">{uploadFile.name}</div>
                      <div className="text-[11px] text-[var(--text-4)]">{formatFileSize(uploadFile.size)}</div>
                    </div>
                    <button type="button" onClick={() => setUploadFile(null)} className="text-[var(--text-4)] hover:text-[var(--error)]">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-3 py-6 border-2 border-dashed border-[var(--border)] rounded-xl text-center hover:border-[var(--accent)] hover:bg-[var(--accent-glow)] transition-all"
                  >
                    <Upload size={20} className="text-[var(--text-4)] mx-auto mb-2" />
                    <div className="text-[13px] font-bold text-[var(--text-3)]">Click to select a file</div>
                    <div className="text-[11px] text-[var(--text-4)] mt-1">PDF, DOCX, XLSX, PPTX, images, CSV, TXT (max 20MB)</div>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.md,.png,.jpg,.jpeg,.gif,.webp,.svg"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-[12px] font-bold text-[var(--text-3)] mb-1.5">Title</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Document title"
                  required
                  className="w-full px-3 py-2.5 border border-[var(--border)] rounded-xl text-[14px] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-4)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[12px] font-bold text-[var(--text-3)] mb-1.5">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[var(--border)] rounded-xl text-[14px] bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] transition-all"
                >
                  <option value="">Select category (optional)</option>
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowUpload(false); setUploadFile(null); setUploadTitle(''); setUploadCategory(''); }}
                  className="flex-1 px-4 py-2.5 border border-[var(--border)] rounded-xl text-[13px] font-bold text-[var(--text-2)] hover:bg-[var(--surface-hover)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile || !uploadTitle.trim()}
                  className="flex-1 px-4 py-2.5 bg-[var(--accent)] text-white rounded-xl text-[13px] font-bold hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-4)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-[13px] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-4)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] transition-all"
          />
        </div>
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-4)]" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-8 pr-8 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-[13px] bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none appearance-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] p-4">
          <div className="text-2xl font-bold text-[var(--text)]">{documents.length}</div>
          <div className="text-[11px] font-bold text-[var(--text-3)]">Total Documents</div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] p-4">
          <div className="text-2xl font-bold text-[var(--text)]">
            {formatFileSize(documents.reduce((s, d) => s + d.fileSize, 0))}
          </div>
          <div className="text-[11px] font-bold text-[var(--text-3)]">Total Size</div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] p-4">
          <div className="text-2xl font-bold text-[var(--text)]">
            {new Set(documents.map((d) => d.category).filter(Boolean)).size}
          </div>
          <div className="text-[11px] font-bold text-[var(--text-3)]">Categories</div>
        </div>
      </div>

      {/* Document List */}
      {loading ? (
        <div className="text-center py-16 text-[var(--text-3)]">Loading documents...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={40} className="text-[var(--text-4)] mx-auto mb-3" />
          <p className="text-[var(--text-3)] font-bold">
            {documents.length === 0 ? 'No documents yet' : 'No documents match your search'}
          </p>
          <p className="text-[var(--text-4)] text-[13px] mt-1">
            {documents.length === 0 ? 'Upload your first document to get started.' : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div className="border border-[var(--border)] rounded-[var(--radius-sm)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--surface)] border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)]">Document</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)]">Category</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)]">Size</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)]">Uploaded</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => {
                const Icon = getFileIcon(doc.mimeType);
                const colorClass = getFileColor(doc.mimeType);
                return (
                  <tr key={doc.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 ${colorClass}`}>
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-bold text-[var(--text)] truncate">{doc.title}</div>
                          <div className="text-[11px] text-[var(--text-4)] truncate">{doc.filename}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {doc.category && (
                        <span className="px-2 py-0.5 bg-[var(--accent-soft)] text-[var(--accent)] rounded-[var(--radius-sm)] text-[11px] font-bold">
                          {doc.category}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[var(--text-3)]">{formatFileSize(doc.fileSize)}</td>
                    <td className="px-4 py-3">
                      <div className="text-[12px] text-[var(--text-3)]">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                      {doc.uploadedBy && (
                        <div className="text-[11px] text-[var(--text-4)]">{doc.uploadedBy.name || doc.uploadedBy.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={doc.filePath}
                          download={doc.filename}
                          className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-4)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all"
                          title="Download"
                        >
                          <Download size={14} />
                        </a>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-4)] hover:text-[var(--error)] hover:bg-[var(--error-soft)] transition-all"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
