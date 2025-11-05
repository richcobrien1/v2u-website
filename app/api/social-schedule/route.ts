import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

interface ScheduledPost {
  id: string;
  episodeId: string;
  episodeTitle: string;
  platforms: string[];
  customMessage?: string;
  scheduledTime: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  executedAt?: string;
  results?: any;
}

const SCHEDULE_FILE = path.join(process.cwd(), 'data', 'scheduled-posts.json');
const HISTORY_FILE = path.join(process.cwd(), 'data', 'post-history.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load scheduled posts
function loadScheduledPosts(): ScheduledPost[] {
  ensureDataDir();
  try {
    if (fs.existsSync(SCHEDULE_FILE)) {
      return JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading scheduled posts:', error);
  }
  return [];
}

// Save scheduled posts
function saveScheduledPosts(posts: ScheduledPost[]) {
  ensureDataDir();
  fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(posts, null, 2));
}

// Load post history
function loadPostHistory(): ScheduledPost[] {
  ensureDataDir();
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading post history:', error);
  }
  return [];
}

// Save post history
function savePostHistory(history: ScheduledPost[]) {
  ensureDataDir();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

/**
 * GET /api/social-schedule
 * Get all scheduled posts and history
 */
export async function GET() {
  try {
    const scheduled = loadScheduledPosts();
    const history = loadPostHistory();

    // Check for posts that should have been executed
    const now = new Date();
    const pendingPosts = scheduled.filter(p => p.status === 'pending');
    const duePosts = pendingPosts.filter(p => new Date(p.scheduledTime) <= now);

    return NextResponse.json({
      scheduled: scheduled.filter(p => p.status === 'pending'),
      history: history.slice(-50), // Last 50 posts
      due: duePosts.length,
      total: scheduled.length
    });
  } catch (error) {
    console.error('Schedule GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load schedule' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social-schedule
 * Schedule a new post
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as any;
    const { episodeId, episodeTitle, platforms, customMessage, scheduledTime } = body;

    if (!episodeId || !platforms || !scheduledTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const scheduled = loadScheduledPosts();

    const newPost: ScheduledPost = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      episodeId,
      episodeTitle,
      platforms,
      customMessage,
      scheduledTime,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    scheduled.push(newPost);
    saveScheduledPosts(scheduled);

    return NextResponse.json({
      success: true,
      post: newPost
    });

  } catch (error) {
    console.error('Schedule POST error:', error);
    return NextResponse.json(
      { error: 'Failed to schedule post' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/social-schedule?id=xxx
 * Cancel a scheduled post
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID required' },
        { status: 400 }
      );
    }

    const scheduled = loadScheduledPosts();
    const filtered = scheduled.filter(p => p.id !== id);

    if (filtered.length === scheduled.length) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    saveScheduledPosts(filtered);

    return NextResponse.json({
      success: true,
      message: 'Scheduled post cancelled'
    });

  } catch (error) {
    console.error('Schedule DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel post' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/social-schedule
 * Execute due scheduled posts (called by cron job)
 */
export async function PUT() {
  try {
    const scheduled = loadScheduledPosts();
    const history = loadPostHistory();
    const now = new Date();

    const duePosts = scheduled.filter(
      p => p.status === 'pending' && new Date(p.scheduledTime) <= now
    );

    if (duePosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No posts due',
        executed: 0
      });
    }

    const results = [];

    for (const post of duePosts) {
      try {
        // Execute the post
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/social-post`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            platforms: post.platforms,
            episode: {
              id: post.episodeId,
              title: post.episodeTitle
            },
            customMessage: post.customMessage
          })
        });

        const data = await response.json() as any;

        post.status = data.success ? 'completed' : 'failed';
        post.executedAt = new Date().toISOString();
        post.results = data;

        results.push({
          postId: post.id,
          success: data.success
        });

      } catch (error) {
        post.status = 'failed';
        post.executedAt = new Date().toISOString();
        post.results = {
          error: error instanceof Error ? error.message : 'Unknown error'
        };

        results.push({
          postId: post.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Move to history
      history.push(post);
    }

    // Remove executed posts from scheduled
    const remaining = scheduled.filter(p => !duePosts.includes(p));
    saveScheduledPosts(remaining);
    savePostHistory(history);

    return NextResponse.json({
      success: true,
      executed: duePosts.length,
      results
    });

  } catch (error) {
    console.error('Schedule execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute scheduled posts' },
      { status: 500 }
    );
  }
}
