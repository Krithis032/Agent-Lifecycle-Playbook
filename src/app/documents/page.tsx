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

function getFileColor(mimeType: string): { color: string; background: string } {
  if (mimeType.startsWith('image/')) return { color: '#7c3aed', background: 'rgba(139,92,246,0.1)' };
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType === 'text/csv') return { color: 'var(--status-success)', background: 'rgba(34,197,94,0.1)' };
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return { color: 'var(--status-warning)', background: 'rgba(251,191,36,0.1)' };
  if (mimeType === 'application/pdf') return { color: 'var(--status-error)', background: 'rgba(239,68,68,0.1)' };
  if (mimeType.includes('word')) return { color: 'var(--status-info)', background: 'rgba(59,130,246,0.1)' };
  return { color: 'var(--text-tertiary)', background: 'var(--surface-elevated)' };
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

  // Hover states
  const [uploadBtnHover, setUploadBtnHover] = useState(false);
  const [cancelBtnHover, setCancelBtnHover] = useState(false);
  const [submitBtnHover, setSubmitBtnHover] = useState(false);
  const [filePickerHover, setFilePickerHover] = useState(false);
  const [deleteFileHover, setDeleteFileHover] = useState(false);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);
  const [hoveredDownloadId, setHoveredDownloadId] = useState<number | null>(null);
  const [hoveredDeleteId, setHoveredDeleteId] = useState<number | null>(null);

  // Focus states
  const [titleFocused, setTitleFocused] = useState(false);
  const [categorySelectFocused, setCategorySelectFocused] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [filterSelectFocused, setFilterSelectFocused] = useState(false);

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
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Documents</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Upload and manage project documents.</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          onMouseEnter={() => setUploadBtnHover(true)}
          onMouseLeave={() => setUploadBtnHover(false)}
          className="flex items-center gap-2 px-4 py-2 text-white text-[13px] font-bold rounded-lg transition-colors"
          style={{ background: uploadBtnHover ? 'var(--brand-primary-hover)' : 'var(--brand-primary)' }}
        >
          <Upload size={15} />
          Upload Document
        </button>
      </div>

      {/* Drag overlay */}
      {dragActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm pointer-events-none" style={{ background: 'rgba(99,102,241,0.1)' }}>
          <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--surface-elevated)', border: '2px dashed var(--brand-primary)' }}>
            <Upload size={48} className="mx-auto mb-4" style={{ color: 'var(--brand-primary)' }} />
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Drop file to upload</p>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-2xl w-full max-w-[480px] mx-4" style={{ background: 'var(--surface-elevated)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
              <h2 className="text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>Upload Document</h2>
              <button
                onClick={() => { setShowUpload(false); setUploadFile(null); setUploadTitle(''); setUploadCategory(''); }}
                className="transition-colors"
                style={{ color: 'var(--text-quaternary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-quaternary)'}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              {/* File picker */}
              <div>
                <label className="block text-[12px] font-bold mb-1.5" style={{ color: 'var(--text-tertiary)' }}>File</label>
                {uploadFile ? (
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'var(--surface-0)', border: '1px solid var(--border-default)' }}>
                    <FileText size={16} className="shrink-0" style={{ color: 'var(--brand-primary)' }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>{uploadFile.name}</div>
                      <div className="text-[11px]" style={{ color: 'var(--text-quaternary)' }}>{formatFileSize(uploadFile.size)}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadFile(null)}
                      onMouseEnter={() => setDeleteFileHover(true)}
                      onMouseLeave={() => setDeleteFileHover(false)}
                      style={{ color: deleteFileHover ? 'var(--status-error)' : 'var(--text-quaternary)' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onMouseEnter={() => setFilePickerHover(true)}
                    onMouseLeave={() => setFilePickerHover(false)}
                    className="w-full px-3 py-6 rounded-xl text-center transition-all"
                    style={{
                      border: filePickerHover ? '2px dashed var(--brand-primary)' : '2px dashed var(--border-default)',
                      background: filePickerHover ? 'var(--brand-soft)' : 'transparent'
                    }}
                  >
                    <Upload size={20} className="mx-auto mb-2" style={{ color: 'var(--text-quaternary)' }} />
                    <div className="text-[13px] font-bold" style={{ color: 'var(--text-tertiary)' }}>Click to select a file</div>
                    <div className="text-[11px] mt-1" style={{ color: 'var(--text-quaternary)' }}>PDF, DOCX, XLSX, PPTX, images, CSV, TXT (max 20MB)</div>
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
                <label className="block text-[12px] font-bold mb-1.5" style={{ color: 'var(--text-tertiary)' }}>Title</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  onFocus={() => setTitleFocused(true)}
                  onBlur={() => setTitleFocused(false)}
                  placeholder="Document title"
                  required
                  className="w-full px-3 py-2.5 rounded-xl text-[14px] placeholder:text-[var(--text-quaternary)] focus:outline-none transition-all"
                  style={{
                    background: 'var(--surface-0)',
                    color: 'var(--text-primary)',
                    border: titleFocused ? '1px solid var(--border-focus)' : '1px solid var(--border-default)',
                    boxShadow: titleFocused ? '0 0 0 2px var(--brand-soft)' : 'none'
                  }}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[12px] font-bold mb-1.5" style={{ color: 'var(--text-tertiary)' }}>Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  onFocus={() => setCategorySelectFocused(true)}
                  onBlur={() => setCategorySelectFocused(false)}
                  className="w-full px-3 py-2.5 rounded-xl text-[14px] focus:outline-none transition-all"
                  style={{
                    background: 'var(--surface-0)',
                    color: 'var(--text-primary)',
                    border: categorySelectFocused ? '1px solid var(--border-focus)' : '1px solid var(--border-default)',
                    boxShadow: categorySelectFocused ? '0 0 0 2px var(--brand-soft)' : 'none'
                  }}
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
                  onMouseEnter={() => setCancelBtnHover(true)}
                  onMouseLeave={() => setCancelBtnHover(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-colors"
                  style={{
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                    background: cancelBtnHover ? 'var(--surface-1)' : 'transparent'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile || !uploadTitle.trim()}
                  onMouseEnter={() => setSubmitBtnHover(true)}
                  onMouseLeave={() => setSubmitBtnHover(false)}
                  className="flex-1 px-4 py-2.5 text-white rounded-xl text-[13px] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{
                    background: (uploading || !uploadFile || !uploadTitle.trim())
                      ? 'var(--brand-primary)'
                      : submitBtnHover
                        ? 'var(--brand-primary-hover)'
                        : 'var(--brand-primary)'
                  }}
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
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-quaternary)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-[13px] placeholder:text-[var(--text-quaternary)] focus:outline-none transition-all"
            style={{
              background: 'var(--surface-0)',
              color: 'var(--text-primary)',
              border: searchFocused ? '1px solid var(--border-focus)' : '1px solid var(--border-default)',
              boxShadow: searchFocused ? '0 0 0 2px var(--brand-soft)' : 'none'
            }}
          />
        </div>
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-quaternary)' }} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            onFocus={() => setFilterSelectFocused(true)}
            onBlur={() => setFilterSelectFocused(false)}
            className="pl-8 pr-8 py-2 rounded-lg text-[13px] focus:outline-none appearance-none"
            style={{
              background: 'var(--surface-0)',
              color: 'var(--text-primary)',
              border: filterSelectFocused ? '1px solid var(--border-focus)' : '1px solid var(--border-default)'
            }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg p-4" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-default)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{documents.length}</div>
          <div className="text-[11px] font-bold" style={{ color: 'var(--text-tertiary)' }}>Total Documents</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-default)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {formatFileSize(documents.reduce((s, d) => s + d.fileSize, 0))}
          </div>
          <div className="text-[11px] font-bold" style={{ color: 'var(--text-tertiary)' }}>Total Size</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-default)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {new Set(documents.map((d) => d.category).filter(Boolean)).size}
          </div>
          <div className="text-[11px] font-bold" style={{ color: 'var(--text-tertiary)' }}>Categories</div>
        </div>
      </div>

      {/* Document List */}
      {loading ? (
        <div className="text-center py-16" style={{ color: 'var(--text-tertiary)' }}>Loading documents...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={40} className="mx-auto mb-3" style={{ color: 'var(--text-quaternary)' }} />
          <p className="font-bold" style={{ color: 'var(--text-tertiary)' }}>
            {documents.length === 0 ? 'No documents yet' : 'No documents match your search'}
          </p>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-quaternary)' }}>
            {documents.length === 0 ? 'Upload your first document to get started.' : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-default)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--surface-elevated)', borderBottom: '1px solid var(--border-default)' }}>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Document</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Category</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Size</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Uploaded</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => {
                const Icon = getFileIcon(doc.mimeType);
                const colorStyles = getFileColor(doc.mimeType);
                return (
                  <tr
                    key={doc.id}
                    onMouseEnter={() => setHoveredRowId(doc.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    className="last:border-0 transition-colors"
                    style={{
                      borderBottom: '1px solid var(--border-default)',
                      background: hoveredRowId === doc.id ? 'var(--surface-1)' : 'transparent'
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ color: colorStyles.color, background: colorStyles.background }}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>{doc.title}</div>
                          <div className="text-[11px] truncate" style={{ color: 'var(--text-quaternary)' }}>{doc.filename}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {doc.category && (
                        <span
                          className="px-2 py-0.5 rounded-lg text-[11px] font-bold"
                          style={{ background: 'var(--brand-soft)', color: 'var(--brand-primary)' }}
                        >
                          {doc.category}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{formatFileSize(doc.fileSize)}</td>
                    <td className="px-4 py-3">
                      <div className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                      {doc.uploadedBy && (
                        <div className="text-[11px]" style={{ color: 'var(--text-quaternary)' }}>{doc.uploadedBy.name || doc.uploadedBy.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={doc.filePath}
                          download={doc.filename}
                          onMouseEnter={() => setHoveredDownloadId(doc.id)}
                          onMouseLeave={() => setHoveredDownloadId(null)}
                          className="p-1.5 rounded-lg transition-all"
                          style={{
                            color: hoveredDownloadId === doc.id ? 'var(--brand-primary)' : 'var(--text-quaternary)',
                            background: hoveredDownloadId === doc.id ? 'var(--brand-soft)' : 'transparent'
                          }}
                          title="Download"
                        >
                          <Download size={14} />
                        </a>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          onMouseEnter={() => setHoveredDeleteId(doc.id)}
                          onMouseLeave={() => setHoveredDeleteId(null)}
                          className="p-1.5 rounded-lg transition-all"
                          style={{
                            color: hoveredDeleteId === doc.id ? 'var(--status-error)' : 'var(--text-quaternary)',
                            background: hoveredDeleteId === doc.id ? 'rgba(239,68,68,0.1)' : 'transparent'
                          }}
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
