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

export default function R2ManagerPage() {
  const [publicFiles, setPublicFiles] = useState<R2File[]>([])
  const [privateFiles, setPrivateFiles] = useState<R2File[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedBucket, setSelectedBucket] = useState<'public' | 'private'>('public')

  useEffect(() => {
    loadFiles()
  }, [])

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
        setPublicFiles(publicData.files)
        setPrivateFiles(privateData.files)
      }
    } catch (error) {
      console.error('Failed to load files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    const formData = new FormData()
    
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }
    
    formData.append('bucket', selectedBucket)

    try {
      const res = await fetch('/api/admin/r2/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        alert('Upload successful!')
        loadFiles()
      } else {
        const error = await res.json() as { message?: string }
        alert(`Upload failed: ${error.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
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

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 pt-[60px]">
      <Header isAdmin />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">R2 Storage Manager</h1>
          <a
            href="/admin/dashboard"
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            ← Back to Dashboard
          </a>
        </div>

        {/* Upload Section */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Upload Files</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Bucket
            </label>
            <select
              value={selectedBucket}
              onChange={(e) => setSelectedBucket(e.target.value as 'public' | 'private')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-white dark:bg-gray-700"
          >
            <div className="space-y-4">
              <div className="text-4xl">📁</div>
              <div className="text-gray-900 dark:text-gray-300">
                <p className="text-lg font-medium">Drag and drop files here</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">or</p>
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
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Files will be organized by creation date (YYYY/MM/DD) in the {selectedBucket} bucket
              </p>
            </div>
          </div>
        </div>

        {/* File Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Public Bucket */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Public Bucket ({publicFiles.length} files)
            </h2>
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {publicFiles.map((file) => (
                  <div
                    key={file.key}
                    className="p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {file.key}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatBytes(file.size)} • {formatDate(file.lastModified)}
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
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Private Bucket ({privateFiles.length} files)
            </h2>
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {privateFiles.map((file) => (
                  <div
                    key={file.key}
                    className="p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {file.key}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatBytes(file.size)} • {formatDate(file.lastModified)}
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
