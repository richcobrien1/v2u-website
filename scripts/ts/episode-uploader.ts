// Quick episode uploader - handles your specific landscape episode
import { uploadEpisode } from './r2-upload.js';

async function uploadLandscapeEpisode() {
  const localPath = "C:\\Users\\richc\\OneDrive\\Work\\V2U\\Assets\\Education\\Standard\\AI-Now\\Desktop\\October 2, 2025, AI-Now - Practical AI, Advanced Robotics - Deep Dive with Alex and Jessica.mp4";
  
  const metadata = {
    title: "AI-Now: Practical AI, Advanced Robotics - Deep Dive",
    description: "Alex and Jessica explore practical AI applications and advanced robotics developments, diving deep into real-world implementations and future possibilities.",
    category: 'ai-now' as const,
    format: 'landscape' as const,
    isPremium: false,
    duration: "45:30", // Estimate - update with actual duration
    publishDate: "2025-10-02"
  };
  
  console.log('🎬 Uploading your landscape episode...');
  
  const result = await uploadEpisode(localPath, metadata);
  
  if (result.success) {
    console.log('\n🎉 SUCCESS! Here\'s what to do next:');
    console.log('1. 🧪 Test access:', `http://localhost:3000/r2-test`);
    console.log('2. 📝 Update podcast-dashboard with path:', result.apiPath);
    console.log('3. 🎵 Add to episode list in podcast-dashboard/page.tsx');
    
    console.log('\n📋 Episode Data for Dashboard:');
    console.log(`{
  id: '${Date.now()}',
  title: '${metadata.title}',
  description: '${metadata.description}',
  duration: '${metadata.duration}',
  publishDate: '${metadata.publishDate}',
  thumbnail: '/Ai-Now-Educate-YouTube.jpg',
  category: '${metadata.category}',
  isPremium: ${metadata.isPremium},
  audioUrl: '${result.apiPath}',
  isNew: true
}`);
  } else {
    console.log('❌ Upload failed. Check your R2 credentials in .env.local');
  }
}

uploadLandscapeEpisode().catch(console.error);