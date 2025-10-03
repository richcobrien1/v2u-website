'use client';

export default function TestImages() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Thumbnail Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border p-4">
          <h2 className="font-semibold mb-2">v2u-ai-now.jpg</h2>
          <img 
            src="/v2u-ai-now.jpg" 
            alt="AI Now Thumbnail"
            className="w-full h-48 object-cover border"
            onLoad={() => console.log('v2u-ai-now.jpg loaded successfully')}
            onError={() => console.error('v2u-ai-now.jpg failed to load')}
          />
        </div>
        
        <div className="border p-4">
          <h2 className="font-semibold mb-2">v2u-ai-now-educate.jpg</h2>
          <img 
            src="/v2u-ai-now-educate.jpg" 
            alt="AI Now Educate Thumbnail"
            className="w-full h-48 object-cover border"
            onLoad={() => console.log('v2u-ai-now-educate.jpg loaded successfully')}
            onError={() => console.error('v2u-ai-now-educate.jpg failed to load')}
          />
        </div>
        
        <div className="border p-4">
          <h2 className="font-semibold mb-2">v2u.png</h2>
          <img 
            src="/v2u.png" 
            alt="V2U Brand Thumbnail"
            className="w-full h-48 object-cover border"
            onLoad={() => console.log('v2u.png loaded successfully')}
            onError={() => console.error('v2u.png failed to load')}
          />
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100">
        <h2 className="font-semibold mb-2">Direct Links:</h2>
        <div className="space-y-2">
          <div><a href="/v2u-ai-now.jpg" target="_blank" className="text-blue-600 underline">v2u-ai-now.jpg</a></div>
          <div><a href="/v2u-ai-now-educate.jpg" target="_blank" className="text-blue-600 underline">v2u-ai-now-educate.jpg</a></div>
          <div><a href="/v2u.png" target="_blank" className="text-blue-600 underline">v2u.png</a></div>
        </div>
      </div>
    </div>
  );
}