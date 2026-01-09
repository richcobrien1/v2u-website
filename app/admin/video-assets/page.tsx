'use client';

import { useState, useEffect } from 'react';

interface VideoAsset {
  id: string;
  name: string;
  type: 'background' | 'promo-audio' | 'promo-visual' | 'outro';
  url: string;
  duration?: number;
  enabled: boolean;
  insertAt?: number;
}

interface VideoConfig {
  assets: VideoAsset[];
  defaultBackground: string;
  defaultOutro: string;
  promoSlots: Array<{
    time: number;
    audioAssetId?: string;
    visualAssetId?: string;
    enabled: boolean;
  }>;
  outputType: 'public' | 'private';
}

export default function VideoAssetsPage() {
  const [config, setConfig] = useState<VideoConfig | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    const response = await fetch('/api/admin/video-assets');
    const data = await response.json();
    setConfig(data);
  }

  async function saveConfig() {
    await fetch('/api/admin/video-assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    alert('Configuration saved!');
  }

  async function uploadAsset(file: File, type: VideoAsset['type']) {
    setUploading(true);
    try {
      // Get presigned URL for R2
      const presignResponse = await fetch('/api/admin/r2/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucket: 'private',
          filename: `video-assets/${type}/${file.name}`,
          contentType: file.type
        })
      });
      
      const { url, key } = await presignResponse.json();
      
      // Upload to R2
      await fetch(url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      // Add to config
      const newAsset: VideoAsset = {
        id: crypto.randomUUID(),
        name: file.name,
        type,
        url: key,
        enabled: true
      };

      setConfig(prev => prev ? {
        ...prev,
        assets: [...prev.assets, newAsset]
      } : null);
      
      alert('Asset uploaded!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  if (!config) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Video Production Assets</h1>

        {/* Background Assets */}
        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Background Images/Videos</h2>
          <p className="text-sm text-gray-600 mb-4">
            These loop throughout the podcast duration (like your cyan AI circuit board)
          </p>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            {config.assets.filter(a => a.type === 'background').map(asset => (
              <div key={asset.id} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{asset.name}</span>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={config.defaultBackground === asset.id}
                      onChange={() => setConfig({ ...config, defaultBackground: asset.id })}
                      className="mr-2"
                    />
                    Default
                  </label>
                </div>
                <button
                  onClick={() => setConfig({
                    ...config,
                    assets: config.assets.filter(a => a.id !== asset.id)
                  })}
                  className="text-red-600 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <label className="cursor-pointer inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadAsset(e.target.files[0], 'background')}
            />
            Upload Background
          </label>
        </section>

        {/* Promo Slots */}
        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Promo Insert Slots</h2>
          <p className="text-sm text-gray-600 mb-4">
            Insert promotional content at specific timestamps
          </p>

          {config.promoSlots.map((slot, index) => (
            <div key={index} className="border rounded p-4 mb-4">
              <div className="flex items-center gap-4 mb-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={slot.enabled}
                    onChange={(e) => {
                      const newSlots = [...config.promoSlots];
                      newSlots[index].enabled = e.target.checked;
                      setConfig({ ...config, promoSlots: newSlots });
                    }}
                    className="mr-2"
                  />
                  Enabled
                </label>
                
                <label className="flex items-center gap-2">
                  Time:
                  <input
                    type="number"
                    value={slot.time}
                    onChange={(e) => {
                      const newSlots = [...config.promoSlots];
                      newSlots[index].time = parseInt(e.target.value);
                      setConfig({ ...config, promoSlots: newSlots });
                    }}
                    className="border rounded px-2 py-1 w-20"
                  />
                  seconds {slot.time < 0 && '(from end)'}
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Promo Audio</label>
                  <select
                    value={slot.audioAssetId || ''}
                    onChange={(e) => {
                      const newSlots = [...config.promoSlots];
                      newSlots[index].audioAssetId = e.target.value;
                      setConfig({ ...config, promoSlots: newSlots });
                    }}
                    className="border rounded px-3 py-2 w-full"
                  >
                    <option value="">None</option>
                    {config.assets.filter(a => a.type === 'promo-audio').map(asset => (
                      <option key={asset.id} value={asset.id}>{asset.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Background Ad Visual</label>
                  <select
                    value={slot.visualAssetId || ''}
                    onChange={(e) => {
                      const newSlots = [...config.promoSlots];
                      newSlots[index].visualAssetId = e.target.value;
                      setConfig({ ...config, promoSlots: newSlots });
                    }}
                    className="border rounded px-3 py-2 w-full"
                  >
                    <option value="">None</option>
                    {config.assets.filter(a => a.type === 'promo-visual').map(asset => (
                      <option key={asset.id} value={asset.id}>{asset.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => setConfig({
              ...config,
              promoSlots: [...config.promoSlots, { time: 0, enabled: false }]
            })}
            className="text-blue-600 text-sm"
          >
            + Add Promo Slot
          </button>
        </section>

        {/* Promo Assets Library */}
        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Promo Assets Library</h2>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Promo Audio Clips</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {config.assets.filter(a => a.type === 'promo-audio').map(asset => (
                <div key={asset.id} className="border rounded p-3">
                  <span className="text-sm">{asset.name}</span>
                  <button
                    onClick={() => setConfig({
                      ...config,
                      assets: config.assets.filter(a => a.id !== asset.id)
                    })}
                    className="text-red-600 text-xs ml-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <label className="cursor-pointer inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadAsset(e.target.files[0], 'promo-audio')}
              />
              Upload Promo Audio
            </label>
          </div>

          <div>
            <h3 className="font-medium mb-2">Promo Visuals (Background Ads)</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {config.assets.filter(a => a.type === 'promo-visual').map(asset => (
                <div key={asset.id} className="border rounded p-3">
                  <span className="text-sm">{asset.name}</span>
                  <button
                    onClick={() => setConfig({
                      ...config,
                      assets: config.assets.filter(a => a.id !== asset.id)
                    })}
                    className="text-red-600 text-xs ml-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <label className="cursor-pointer inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadAsset(e.target.files[0], 'promo-visual')}
              />
              Upload Promo Visual
            </label>
          </div>
        </section>

        {/* Outro */}
        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Outro (5s fade in/out)</h2>
          <p className="text-sm text-gray-600 mb-4">
            AI logo fades in (1s), holds (2s), fades out (2s)
          </p>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            {config.assets.filter(a => a.type === 'outro').map(asset => (
              <div key={asset.id} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{asset.name}</span>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={config.defaultOutro === asset.id}
                      onChange={() => setConfig({ ...config, defaultOutro: asset.id })}
                      className="mr-2"
                    />
                    Default
                  </label>
                </div>
                <button
                  onClick={() => setConfig({
                    ...config,
                    assets: config.assets.filter(a => a.id !== asset.id)
                  })}
                  className="text-red-600 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <label className="cursor-pointer inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadAsset(e.target.files[0], 'outro')}
            />
            Upload Outro
          </label>
        </section>

        {/* Output Settings */}
        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Output Settings</h2>
          
          <label className="flex items-center gap-4">
            <span className="font-medium">Output Type:</span>
            <select
              value={config.outputType}
              onChange={(e) => setConfig({ ...config, outputType: e.target.value as 'public' | 'private' })}
              className="border rounded px-3 py-2"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </label>
        </section>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={saveConfig}
            disabled={uploading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            Save Configuration
          </button>
          
          <button
            onClick={loadConfig}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700"
          >
            Reset Changes
          </button>
        </div>
      </div>
    </div>
  );
}
