'use client';

import { useState } from 'react';

export default function R2TestPage() {
  const [token, setToken] = useState('');
  const [filePath, setFilePath] = useState('test-file.mp4');
  const [result, setResult] = useState<{status: number | string; data: unknown} | null>(null);
  const [loading, setLoading] = useState(false);

  const testR2Access = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/r2/private/${filePath}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      setResult({
        status: response.status,
        data
      });
    } catch (error) {
      setResult({
        status: 'error',
        data: { error: 'Request failed' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">R2 Private Content Access Test</h1>
      
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">
            JWT Token:
          </label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter JWT token for testing"
            className="w-full p-3 border rounded-lg text-black"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            File Path:
          </label>
          <input
            type="text"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            placeholder="e.g. podcasts/premium/episode-001.mp4"
            className="w-full p-3 border rounded-lg text-black"
          />
        </div>
        
        <button
          onClick={testR2Access}
          disabled={loading || !token}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test R2 Access'}
        </button>
      </div>

      {result && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Response:</h3>
          <div className="mb-2">
            <strong>Status:</strong> {result.status}
          </div>
          <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Testing Instructions:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>For now, use any token with 10+ characters (JWT verification will be enhanced)</li>
          <li>Enter a file path like &quot;podcasts/premium/episode-001.mp4&quot;</li>
          <li>Click &quot;Test R2 Access&quot; to see the response</li>
          <li>If successful, you&apos;ll get a presigned URL for the R2 file</li>
        </ol>
      </div>
    </div>
  );
}