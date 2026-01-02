// website/components/admin/R2ManagerPage.tsx
'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface R2File {
  key: string
  size: number
  lastModified: string
  bucket: 'public' | 'private'
}

interface BucketListing {
  files: R2File[]
  totalSize: number
  count: number
}

interface UploadResult {
  success: boolean
  bucket?: string
  filename?: string
  key?: string
  size?: number
  url?: string
  file?: string
  error?: string
}

interface UploadProgress {
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'failed'
  error?: string
}

type SortField = 'name' | 'size' | 'date'
type SortOrder = 'asc' | 'desc'

export default function R2ManagerPage() {
  const [publicFiles, setPublicFiles] = useState<R2File[]>([])
  const [privateFiles, setPrivateFiles] = useState<R2File[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedBucket, setSelectedBucket] = useState<'public' | 'private'>('public')
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [copying, setCopying] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [currentFiles, setCurrentFiles] = useState<File[]>([])
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin-whoami')
        if (!res.ok) {
          // Not authenticated, redirect to login
          window.location.href = '/admin/login'
          return
        }
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        window.location.href = '/admin/login'
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadFiles()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  // Re-sort files when sort settings change
  useEffect(() => {
    if (publicFiles.length > 0 || privateFiles.length > 0) {
      setPublicFiles(prev => sortFiles(prev, sortField, sortOrder))
      setPrivateFiles(prev => sortFiles(prev, sortField, sortOrder))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortField, sortOrder])

  const sortFiles = (files: R2File[], field: SortField, order: SortOrder): R2File[] => {
    return [...files].sort((a, b) => {
      let comparison = 0
      
      switch (field) {
        case 'name':
          comparison = a.key.localeCompare(b.key)
          break
        case 'size':
          comparison = a.size - b.size
          break
        case 'date':
          comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
          break
      }
      
      return order === 'asc' ? comparison : -comparison
    })
  }

  const loadFiles = async () => {
    setLoading(true)
    try {
      const [publicRes, privateRes] = await Promise.all([
        fetch('/api/admin/r2/list?bucket=public'),
        fetch('/api/admin/r2/list?bucket=private'),
      ])

      if (publicRes.ok && privateRes.ok) {
        const publicData: BucketListing = await publicRes.json()
        const privateData: BucketListing = await privateRes.json()
        
        // Apply current sort settings
        const sortedPublicFiles = sortFiles(publicData.files, sortField, sortOrder)
        const sortedPrivateFiles = sortFiles(privateData.files, sortField, sortOrder)
        
        setPublicFiles(sortedPublicFiles)
        setPrivateFiles(sortedPrivateFiles)
      }
    } catch (error) {
      console.error('Failed to load files:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteFiles = async (keys: string[], bucket: 'public' | 'private') => {
    if (!confirm(`Are you sure you want to delete ${keys.length} file(s) from the ${bucket} bucket? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch('/api/admin/r2/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys, bucket }),
      })

      if (!res.ok) {
        const error = await res.json() as { error?: string }
        throw new Error(error.error || 'Delete failed')
      }

      const data = await res.json() as {
        success: boolean
        results: Array<{ success: boolean; key: string; error?: string }>
        summary: { total: number; successful: number; failed: number }
      }
      console.log('Delete results:', data)

      if (data.success) {
        alert(`Successfully deleted ${data.summary.successful} file(s)`)
      } else {
        alert(`Deleted ${data.summary.successful} file(s), ${data.summary.failed} failed`)
      }

      // Clear selections and reload files
      setSelectedFiles(new Set())
      loadFiles()
    } catch (error) {
      console.error('Delete error:', error)
      alert(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setDeleting(false)
    }
  }

  const toggleFileSelection = (key: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  const selectAllFiles = (files: R2File[]) => {
    const allKeys = files.map(f => f.key)
    setSelectedFiles(new Set(allKeys))
  }

  const clearSelection = () => {
    setSelectedFiles(new Set())
  }

  const copyMoveFiles = async (keys: string[], fromBucket: 'public' | 'private', toBucket: 'public' | 'private', operation: 'copy' | 'move') => {
    const action = operation === 'move' ? 'move' : 'copy'
    if (!confirm(`Are you sure you want to ${action} ${keys.length} file(s) from ${fromBucket} to ${toBucket} bucket?`)) {
      return
    }

    setCopying(true)
    try {
      const res = await fetch('/api/admin/r2/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys, fromBucket, toBucket, operation }),
      })

      if (!res.ok) {
        const error = await res.json() as { error?: string }
        throw new Error(error.error || `${action} failed`)
      }

      const data = await res.json() as {
        success: boolean
        operation: string
        results: Array<{ success: boolean; key: string; operation: string; error?: string }>
        summary: { total: number; successful: number; failed: number }
      }
      console.log(`${action} results:`, data)

      if (data.success) {
        alert(`Successfully ${action === 'move' ? 'moved' : 'copied'} ${data.summary.successful} file(s)`)
      } else {
        alert(`${action === 'move' ? 'Moved' : 'Copied'} ${data.summary.successful} file(s), ${data.summary.failed} failed`)
      }

      // Clear selections and reload files
      setSelectedFiles(new Set())
      loadFiles()
    } catch (error) {
      console.error(`${action} error:`, error)
      alert(`${action} failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setCopying(false)
    }
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    setCurrentFiles(fileArray)
    setUploading(true)
    const results: UploadResult[] = []
    
    // Initialize progress tracking
    const progressItems: UploadProgress[] = fileArray.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'pending' as const
    }))
    setUploadProgress(progressItems)

    try {
      // Upload each file using presigned URLs (no size limit)
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Update status to uploading
        setUploadProgress(prev => prev.map((item, idx) => 
          idx === i ? { ...item, status: 'uploading' as const } : item
        ))
        
        try {
          console.log(`📤 Uploading: ${file.name} (${formatBytes(file.size)})`)

          // Step 1: Get presigned URL from our API
          const presignedRes = await fetch('/api/admin/r2/presigned-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              lastModified: file.lastModified,
              bucket: selectedBucket,
            }),
          })

          if (!presignedRes.ok) {
            const error = await presignedRes.json() as { error?: string }
            throw new Error(error.error || 'Failed to get upload URL')
          }

          const presignedData = await presignedRes.json() as {
            presignedUrl: string
            key: string
            publicUrl: string
            bucket: string
            fileName: string
            fileSize: number
          }

          console.log(`🔗 Got presigned URL for: ${presignedData.key}`)

          // Step 2: Upload directly to R2 using XMLHttpRequest for progress tracking
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            
            xhr.upload.addEventListener('progress', (event) => {
              if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100)
                setUploadProgress(prev => prev.map((item, idx) => 
                  idx === i ? { ...item, progress } : item
                ))
              }
            })

            xhr.addEventListener('load', () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                console.log(`✅ Uploaded successfully: ${presignedData.key}`)
                setUploadProgress(prev => prev.map((item, idx) => 
                  idx === i ? { ...item, status: 'completed' as const, progress: 100 } : item
                ))
                resolve()
              } else {
                const errorText = xhr.responseText || xhr.statusText
                throw new Error(`R2 upload failed: ${xhr.status} ${xhr.statusText} - ${errorText}`)
              }
            })

            xhr.addEventListener('error', () => {
              setUploadProgress(prev => prev.map((item, idx) => 
                idx === i ? { ...item, status: 'failed' as const, error: 'Network error' } : item
              ))
              reject(new Error('Network error during upload'))
            })

            xhr.addEventListener('abort', () => {
              setUploadProgress(prev => prev.map((item, idx) => 
                idx === i ? { ...item, status: 'failed' as const, error: 'Upload aborted' } : item
              ))
              reject(new Error('Upload aborted'))
            })

            xhr.open('PUT', presignedData.presignedUrl)
            xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
            xhr.send(file)
          })

          results.push({
            success: true,
            bucket: presignedData.bucket,
            filename: presignedData.fileName,
            key: presignedData.key,
            size: presignedData.fileSize,
            url: presignedData.publicUrl,
          })
        } catch (fileError) {
          console.error(`❌ Failed to upload ${file.name}:`, fileError)
          setUploadProgress(prev => prev.map((item, idx) => 
            idx === i ? { 
              ...item, 
              status: 'failed' as const, 
              error: fileError instanceof Error ? fileError.message : 'Upload failed' 
            } : item
          ))
          results.push({
            success: false,
            file: file.name,
            error: fileError instanceof Error ? fileError.message : 'Upload failed',
          })
        }
      }

      setUploadResults(results)
      setShowResults(true)
      loadFiles()
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
      // Clear progress after a delay
      setTimeout(() => setUploadProgress([]), 3000)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleFileUpload(e.dataTransfer.files)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen  pt-[60px]">
        <Header isAdmin />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Checking authentication...</p>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen  pt-[60px]">
      <Header isAdmin />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">R2 Storage Manager</h1>

        {/* Upload Section */}
        <div className="style={{ backgroundColor: 'var(--panel-bg)', color: 'var(--panel-fg)' }} rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Bucket
            </label>
            <select
              value={selectedBucket}
              onChange={(e) => setSelectedBucket(e.target.value as 'public' | 'private')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-fg)' }}"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-fg)' }}"
          >
            <div className="space-y-4">
              <div className="text-4xl">📁</div>
              <div className="text-gray-900 dark:text-gray-300">
                <p className="text-lg font-medium">Drag and drop files here</p>
                <p className="text-sm">or</p>
              </div>
              <label className="inline-block">
                <input
                  type="file"
                  multiple
                  accept="video/*,image/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  disabled={uploading}
                />
                <span className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer inline-block">
                  {uploading ? 'Uploading...' : 'Select Files'}
                </span>
              </label>
              <p className="text-xs">
                Files will be organized by the file&apos;s original creation date (YYYY/MM/DD) in the {selectedBucket} bucket
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                ✅ Supports files of any size (including AI-Now videos 250MB-1GB) via direct R2 upload
              </p>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadProgress.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-100">
              Upload Progress
            </h2>
            <div className="space-y-4">
              {uploadProgress.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-sm truncate flex-1">
                      {item.fileName}
                    </div>
                    <div className="text-sm font-medium ml-4">
                      {item.status === 'pending' && <span className="text-yellow-600 dark:text-yellow-400">⏳ Pending</span>}
                      {item.status === 'uploading' && <span className="text-blue-600 dark:text-blue-400">📤 Uploading</span>}
                      {item.status === 'completed' && <span className="text-green-600 dark:text-green-400">✅ Completed</span>}
                      {item.status === 'failed' && <span className="text-red-600 dark:text-red-400">❌ Failed</span>}
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.status === 'completed' ? 'bg-green-500' :
                        item.status === 'failed' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{item.progress}%</span>
                    {item.status === 'uploading' && (
                      <span>{formatBytes(Math.round((item.progress / 100) * (currentFiles?.[idx]?.size || 0)))} / {formatBytes(currentFiles?.[idx]?.size || 0)}</span>
                    )}
                    {item.status === 'completed' && (
                      <span>{formatBytes(currentFiles?.[idx]?.size || 0)}</span>
                    )}
                  </div>
                  
                  {item.error && (
                    <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                      {item.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Results */}
        {showResults && uploadResults.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-green-900 dark:text-green-100">
                Upload Results ({uploadResults.filter(r => r.success).length} successful)
              </h2>
              <button
                onClick={() => setShowResults(false)}
                className="text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100"
              >
                ✕ Close
              </button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {uploadResults.map((result, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg ${
                    result.success
                      ? 'bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
                  }`}
                >
                  {result.success ? (
                    <>
                      <div className="font-mono text-sm mb-2">
                        <strong>File:</strong> {result.filename}
                      </div>
                      <div className="font-mono text-xs mb-1">
                        <strong>Bucket:</strong> {result.bucket}
                      </div>
                      <div className="font-mono text-xs mb-1">
                        <strong>Key:</strong> {result.key}
                      </div>
                      <div className="font-mono text-xs mb-2">
                        <strong>Size:</strong> {formatBytes(result.size || 0)}
                      </div>
                      <div className="font-mono text-xs break-all">
                        <strong className="text-gray-700 dark:text-gray-300">URL:</strong>{' '}
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {result.url}
                        </a>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-mono text-sm text-red-900 dark:text-red-100 mb-1">
                        <strong>Failed:</strong> {result.file}
                      </div>
                      <div className="text-xs text-red-700 dark:text-red-300">
                        {result.error}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sorting Controls */}
        <div className="style={{ backgroundColor: 'var(--panel-bg)', color: 'var(--panel-fg)' }} rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Sort Files</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Sort by
              </label>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-fg)' }}"
              >
                <option value="date">Date Modified</option>
                <option value="name">File Name</option>
                <option value="size">File Size</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Sort order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-fg)' }}"
              >
                <option value="desc">
                  {sortField === 'date' ? 'Newest First' : 
                   sortField === 'name' ? 'Z to A' : 'Largest First'}
                </option>
                <option value="asc">
                  {sortField === 'date' ? 'Oldest First' : 
                   sortField === 'name' ? 'A to Z' : 'Smallest First'}
                </option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Current sort: <span className="font-medium">
              {sortField === 'date' ? 'Date Modified' : 
               sortField === 'name' ? 'File Name' : 'File Size'} - {' '}
              {sortOrder === 'desc' ? 
                (sortField === 'date' ? 'Newest First' : 
                 sortField === 'name' ? 'Z to A' : 'Largest First') :
                (sortField === 'date' ? 'Oldest First' : 
                 sortField === 'name' ? 'A to Z' : 'Smallest First')
              }
            </span>
          </div>
        </div>

        {/* File Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Public Bucket */}
          <div className="style={{ backgroundColor: 'var(--panel-bg)', color: 'var(--panel-fg)' }} rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">
                  Public Bucket ({publicFiles.length} files)
                </h2>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setSortField('date')
                      setSortOrder(sortField === 'date' && sortOrder === 'desc' ? 'asc' : 'desc')
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      sortField === 'date' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                    title="Sort by date"
                  >
                    📅 {sortField === 'date' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
                  </button>
                  <button
                    onClick={() => {
                      setSortField('name')
                      setSortOrder(sortField === 'name' && sortOrder === 'desc' ? 'asc' : 'desc')
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      sortField === 'name' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                    title="Sort by name"
                  >
                    🏷️ {sortField === 'name' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
                  </button>
                  <button
                    onClick={() => {
                      setSortField('size')
                      setSortOrder(sortField === 'size' && sortOrder === 'desc' ? 'asc' : 'desc')
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      sortField === 'size' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                    title="Sort by size"
                  >
                    📏 {sortField === 'size' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
                  </button>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {selectedFiles.size > 0 && (
                  <>
                    <button
                      onClick={() => copyMoveFiles(Array.from(selectedFiles), 'public', 'private', 'move')}
                      disabled={copying}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm rounded"
                    >
                      {copying ? 'Moving...' : `Move to Private (${selectedFiles.size})`}
                    </button>
                    <button
                      onClick={() => copyMoveFiles(Array.from(selectedFiles), 'public', 'private', 'copy')}
                      disabled={copying}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm rounded"
                    >
                      {copying ? 'Copying...' : `Copy to Private (${selectedFiles.size})`}
                    </button>
                    <button
                      onClick={() => deleteFiles(Array.from(selectedFiles), 'public')}
                      disabled={deleting}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm rounded"
                    >
                      {deleting ? 'Deleting...' : `Delete (${selectedFiles.size})`}
                    </button>
                  </>
                )}
                <button
                  onClick={() => selectAllFiles(publicFiles)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded"
                >
                  Clear
                </button>
              </div>
            </div>
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {publicFiles.map((file) => (
                  <div
                    key={file.key}
                    className="p-3 style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-fg)' }} rounded border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.key)}
                        onChange={() => toggleFileSelection(file.key)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {file.key}
                        </div>
                        <div className="text-xs mt-1">
                          {formatBytes(file.size)} • {formatDate(file.lastModified)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={`https://${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || 'public.d54e57481e824e8752d0f6caa9b37ba7.r2.cloudflarestorage.com'}/${file.key}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                        >
                          View
                        </a>
                        <button
                          onClick={() => deleteFiles([file.key], 'public')}
                          disabled={deleting}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {publicFiles.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No files in public bucket
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Private Bucket */}
          <div className="style={{ backgroundColor: 'var(--panel-bg)', color: 'var(--panel-fg)' }} rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">
                  Private Bucket ({privateFiles.length} files)
                </h2>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setSortField('date')
                      setSortOrder(sortField === 'date' && sortOrder === 'desc' ? 'asc' : 'desc')
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      sortField === 'date' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                    title="Sort by date"
                  >
                    📅 {sortField === 'date' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
                  </button>
                  <button
                    onClick={() => {
                      setSortField('name')
                      setSortOrder(sortField === 'name' && sortOrder === 'desc' ? 'asc' : 'desc')
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      sortField === 'name' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                    title="Sort by name"
                  >
                    🏷️ {sortField === 'name' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
                  </button>
                  <button
                    onClick={() => {
                      setSortField('size')
                      setSortOrder(sortField === 'size' && sortOrder === 'desc' ? 'asc' : 'desc')
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      sortField === 'size' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                    title="Sort by size"
                  >
                    📏 {sortField === 'size' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
                  </button>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {selectedFiles.size > 0 && (
                  <>
                    <button
                      onClick={() => copyMoveFiles(Array.from(selectedFiles), 'private', 'public', 'move')}
                      disabled={copying}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm rounded"
                    >
                      {copying ? 'Moving...' : `Move to Public (${selectedFiles.size})`}
                    </button>
                    <button
                      onClick={() => copyMoveFiles(Array.from(selectedFiles), 'private', 'public', 'copy')}
                      disabled={copying}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm rounded"
                    >
                      {copying ? 'Copying...' : `Copy to Public (${selectedFiles.size})`}
                    </button>
                    <button
                      onClick={() => deleteFiles(Array.from(selectedFiles), 'private')}
                      disabled={deleting}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm rounded"
                    >
                      {deleting ? 'Deleting...' : `Delete (${selectedFiles.size})`}
                    </button>
                  </>
                )}
                <button
                  onClick={() => selectAllFiles(privateFiles)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded"
                >
                  Clear
                </button>
              </div>
            </div>
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {privateFiles.map((file) => (
                  <div
                    key={file.key}
                    className="p-3 style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-fg)' }} rounded border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.key)}
                        onChange={() => toggleFileSelection(file.key)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {file.key}
                        </div>
                        <div className="text-xs mt-1">
                          {formatBytes(file.size)} • {formatDate(file.lastModified)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => deleteFiles([file.key], 'private')}
                          disabled={deleting}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {privateFiles.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No files in private bucket
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
