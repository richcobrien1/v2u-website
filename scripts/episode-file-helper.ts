// Quick reference for updating episode file paths after upload

export const updateEpisodePaths = {
  // Current episode configuration
  currentEpisode: {
    id: '2',
    title: 'AI-Now-Educate: From Prompts to Architects',
    audioUrl: '/api/r2/private/AI-Now-Educate - From Prompts to Architects-Curated with Kevin.mp4'
  },

  // Recommended upload paths based on our directory structure
  recommendedPaths: {
    // For the current episode (premium educate content)
    educateEpisode: 'private/educate/beginner/season-1/episode-001-from-prompts-to-architects.mp4',
    
    // Alternative paths depending on where you upload
    currentPath: 'AI-Now-Educate - From Prompts to Architects-Curated with Kevin.mp4', // Root level
    organizedPath: 'private/educate/advanced/from-prompts-to-architects-kevin.mp4', // Organized structure
  },

  // Quick update function - just change the audioUrl in podcast-dashboard/page.tsx
  updateInstructions: `
    1. Upload your video to R2 bucket
    2. Note the exact file path/name
    3. Update line ~62 in app/podcast-dashboard/page.tsx:
       audioUrl: '/api/r2/private/YOUR-ACTUAL-FILE-PATH-HERE'
    4. Test access at /r2-test with the same path
  `
};

// Example file paths you might use after upload:
export const exampleFilePaths = [
  // If you upload to root of private bucket:
  'your-new-video-filename.mp4',
  
  // If you upload to organized structure:
  'private/educate/beginner/season-1/episode-001.mp4',
  'private/educate/advanced/prompts-to-architects.mp4',
  
  // Current working path:
  'AI-Now-Educate - From Prompts to Architects-Curated with Kevin.mp4'
];