'use client';


import { useState, useEffect } from 'react';

interface Episode {
  id: string;
  title: string;
  youtubeUrl?: string;
  rumbleUrl?: string;
  spotifyUrl?: string;
  publishDate: string;
  category: string;
}

export default function EpisodesManagementPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    youtubeUrl: '',
    rumbleUrl: '',
    spotifyUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEpisodes();
  }, []);

  const loadEpisodes = async () => {
    try {
      const response = await fetch('/api/episodes');
      const data = await response.json() as Episode[];
      setEpisodes(data);
    } catch (error) {
      console.error('Failed to load episodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (episode: Episode) => {
    setEditingId(episode.id);
    setFormData({
      youtubeUrl: episode.youtubeUrl || '',
      rumbleUrl: episode.rumbleUrl || '',
      spotifyUrl: episode.spotifyUrl || '',
    });
  };

  const handleSave = async (episodeId: string) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/episodes/${episodeId}/platforms`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadEpisodes();
        setEditingId(null);
        alert('Platform URLs updated successfully!');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save platform URLs');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ youtubeUrl: '', rumbleUrl: '', spotifyUrl: '' });
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Episodes Management</h1>
        <p>Loading episodes...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📺 Episodes Management</h1>
      <p className="text-gray-600 mb-8">Add platform URLs to episodes for cross-posting</p>

      <div className="space-y-4">
        {episodes.map((episode) => (
          <div key={episode.id} className="bg-white border rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{episode.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(episode.publishDate).toLocaleDateString()} • {episode.category}
                </p>
              </div>
              {editingId !== episode.id && (
                <button
                  onClick={() => handleEdit(episode)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit URLs
                </button>
              )}
            </div>

            {editingId === episode.id ? (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    🎥 YouTube URL
                  </label>
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    📹 Rumble URL
                  </label>
                  <input
                    type="url"
                    value={formData.rumbleUrl}
                    onChange={(e) => setFormData({ ...formData, rumbleUrl: e.target.value })}
                    placeholder="https://rumble.com/..."
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    🎵 Spotify URL
                  </label>
                  <input
                    type="url"
                    value={formData.spotifyUrl}
                    onChange={(e) => setFormData({ ...formData, spotifyUrl: e.target.value })}
                    placeholder="https://open.spotify.com/episode/..."
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(episode.id)}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">🎥 YouTube:</span>{' '}
                  {episode.youtubeUrl ? (
                    <a href={episode.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400">Not set</span>
                  )}
                </div>
                <div>
                  <span className="font-medium">📹 Rumble:</span>{' '}
                  {episode.rumbleUrl ? (
                    <a href={episode.rumbleUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400">Not set</span>
                  )}
                </div>
                <div>
                  <span className="font-medium">🎵 Spotify:</span>{' '}
                  {episode.spotifyUrl ? (
                    <a href={episode.spotifyUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400">Not set</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
