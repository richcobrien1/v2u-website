'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function R2TestPage() {
  const [token, setToken] = useState('test-token-1234567890');
  const [filePath, setFilePath] = useState('AI-Now-Educate - From Prompts to Architects-Curated with Kevin.mp4');
  const [result, setResult] = useState<{status: number | string; data: unknown} | null>(null);
  const [loading, setLoading] = useState(false);
  const [browseMode, setBrowseMode] = useState<'file' | 'directory'>('file');
  const [directoryPath, setDirectoryPath] = useState('private/educate/beginner/');
  const [directoryResult, setDirectoryResult] = useState<{status: number | string; data: unknown} | null>(null);

  // Generate a proper JWT token for testing
  const generateTestJWT = async () => {
    try {
      // Call our own API to generate a proper JWT token
      const response = await fetch('/api/auth/test-jwt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 'test-customer-123',
          subscription: 'premium'
        })
      });
      
      if (response.ok) {
        const data = await response.json() as { token: string };
        setToken(data.token);
      } else {
        // Fallback to a development token that our API will recognize
        setToken('dev-jwt-test-token-for-development');
      }
    } catch {
      // Fallback to a development token if JWT generation fails
      setToken('dev-jwt-test-token-for-development');
    }
  };

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
    } catch {
      setResult({
        status: 'error',
        data: { error: 'Request failed' }
      });
    } finally {
      setLoading(false);
    }
  };

  const browseDirectory = async () => {
    setLoading(true);
    setDirectoryResult(null);

    try {
      const response = await fetch(`/api/r2/browse/${directoryPath}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      setDirectoryResult({
        status: response.status,
        data
      });
    } catch {
      setDirectoryResult({
        status: 'error',
        data: { error: 'Browse request failed' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--site-bg)] text-[var(--site-fg)]">
      <Header loggedIn={true} firstName="Welcome" avatar="🟡" />

      <div className="max-w-4xl mx-auto p-8 pt-24 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">R2 Private Content Access Test</h1>
      
      <div className="space-y-4 mb-8">
        {/* Mode Selection */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setBrowseMode('file')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              browseMode === 'file' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🔗 Test File Access
          </button>
          <button
            onClick={() => setBrowseMode('directory')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              browseMode === 'directory' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📁 Browse Directories
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            JWT Token:
          </label>
          <div className="space-y-2">
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter JWT token for testing"
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setToken('test-token-1234567890')}
                className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
              >
                Use Test Token
              </button>
              <button
                onClick={generateTestJWT}
                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
              >
                Generate Dev JWT
              </button>
            </div>
          </div>
        </div>
        
        {browseMode === 'file' ? (
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              File Path:
            </label>
            <input
              type="text"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              placeholder="e.g. AI-Now-Educate - From Prompts to Architects-Curated with Kevin.mp4"
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={testR2Access}
              disabled={loading || !token}
              className="mt-3 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Testing...' : 'Test R2 Access'}
            </button>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Directory Path:
            </label>
            <select
              value={directoryPath}
              onChange={(e) => setDirectoryPath(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-3"
            >
              <option value="private/educate/beginner/">📚 Educate - Beginner</option>
              <option value="private/educate/intermediate/">📖 Educate - Intermediate</option>
              <option value="private/educate/advanced/">🎓 Educate - Advanced</option>
              <option value="private/reviews/weekly/">📊 Weekly Reviews</option>
              <option value="private/reviews/monthly/">📈 Monthly Reviews</option>
              <option value="private/projects/safeshipping/">🚢 SafeShipping Project</option>
              <option value="private/projects/trafficjamz/">🎵 TrafficJamz Project</option>
              <option value="private/projects/mealsondemand/">🍽️ MealsOnDemand Project</option>
              <option value="public/daily/portrait/">📱 Public Daily (Portrait)</option>
              <option value="public/daily/landscape/">🖥️ Public Daily (Landscape)</option>
            </select>
            <button
              onClick={browseDirectory}
              disabled={loading || !token}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Browsing...' : '📁 Browse Directory'}
            </button>
          </div>
        )}
      </div>

      {(result || directoryResult) && (
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            {browseMode === 'file' ? '🔗 File Access Response:' : '📁 Directory Browse Response:'}
          </h3>
          {browseMode === 'file' && result && (
            <>
              <div className="mb-2">
                <strong className="text-gray-700">Status:</strong> <span className="text-gray-900">{result.status}</span>
              </div>
              <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </>
          )}
          {browseMode === 'directory' && directoryResult && (
            <>
              <div className="mb-2">
                <strong className="text-gray-700">Status:</strong> <span className="text-gray-900">{directoryResult.status}</span>
              </div>
              <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(directoryResult.data, null, 2)}
              </pre>
            </>
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Testing Instructions:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Use the &quot;Use Test Token&quot; button for simple testing (no JWT errors)</li>
          <li>Use the &quot;Generate JWT Token&quot; button to test with a proper JWT format</li>
          <li>Enter a file path like &quot;AI-Now-Educate - From Prompts to Architects-Curated with Kevin.mp4&quot;</li>
          <li>Click &quot;Test R2 Access&quot; to see the response</li>
          <li>The system now properly handles both test tokens and JWT tokens</li>
        </ol>
      </div>
    </div>

    <Footer />
    </main>
  );
}