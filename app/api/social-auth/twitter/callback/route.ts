import { NextRequest, NextResponse } from 'next/server';

/**
 * Twitter/X OAuth 2.0 Callback Handler
 * 
 * This endpoint handles the OAuth callback from X (Twitter)
 * and saves the authentication tokens.
 * 
 * Callback URL: https://www.v2u.us/api/social-auth/twitter/callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth error
    if (error) {
      console.error('Twitter OAuth error:', error, errorDescription);
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Error</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 3rem;
                border-radius: 1rem;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 500px;
              }
              .error-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
              }
              h1 {
                color: #e53e3e;
                margin-bottom: 1rem;
              }
              p {
                color: #4a5568;
                margin-bottom: 2rem;
              }
              a {
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 0.75rem 2rem;
                border-radius: 0.5rem;
                text-decoration: none;
                font-weight: 600;
              }
              a:hover {
                background: #5a67d8;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error-icon">❌</div>
              <h1>Authentication Failed</h1>
              <p><strong>Error:</strong> ${error}</p>
              <p>${errorDescription || 'An error occurred during authentication'}</p>
              <a href="/admin/social-posting/settings">Back to Settings</a>
            </div>
          </body>
        </html>`,
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    // Validate authorization code
    if (!code) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>Missing Authorization Code</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 3rem;
                border-radius: 1rem;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 500px;
              }
              h1 {
                color: #e53e3e;
                margin-bottom: 1rem;
              }
              a {
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 0.75rem 2rem;
                border-radius: 0.5rem;
                text-decoration: none;
                font-weight: 600;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Missing Authorization Code</h1>
              <p>No authorization code received from X.</p>
              <a href="/admin/social-posting/settings">Try Again</a>
            </div>
          </body>
        </html>`,
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    // Return success page with the code
    // The code will be displayed for the user to copy if using CLI
    // Or can be handled automatically if using the admin dashboard
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>X Authentication Successful</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 3rem;
              border-radius: 1rem;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 600px;
            }
            .success-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            h1 {
              color: #38a169;
              margin-bottom: 1rem;
            }
            .code-box {
              background: #f7fafc;
              border: 2px solid #e2e8f0;
              border-radius: 0.5rem;
              padding: 1.5rem;
              margin: 2rem 0;
              font-family: 'Courier New', monospace;
              word-break: break-all;
              font-size: 0.875rem;
            }
            .code-label {
              font-weight: 600;
              color: #2d3748;
              margin-bottom: 0.5rem;
            }
            .code-value {
              color: #4a5568;
              user-select: all;
            }
            .instructions {
              color: #4a5568;
              margin-bottom: 2rem;
              line-height: 1.6;
            }
            button, a {
              display: inline-block;
              background: #1da1f2;
              color: white;
              padding: 0.75rem 2rem;
              border-radius: 0.5rem;
              text-decoration: none;
              font-weight: 600;
              border: none;
              cursor: pointer;
              margin: 0.5rem;
            }
            button:hover, a:hover {
              background: #1a91da;
            }
            .secondary {
              background: #667eea;
            }
            .secondary:hover {
              background: #5a67d8;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1>X Authentication Successful!</h1>
            
            <div class="instructions">
              <p><strong>Authorization completed!</strong></p>
              <p>If you're using the CLI tool, copy the code below and paste it when prompted.</p>
              <p>If you're using the admin dashboard, this will be handled automatically.</p>
            </div>

            <div class="code-box">
              <div class="code-label">Authorization Code:</div>
              <div class="code-value" id="authCode">${code}</div>
            </div>

            <button onclick="copyCode()" id="copyBtn">📋 Copy Code</button>
            <a href="/admin/social-posting/settings" class="secondary">Go to Settings</a>
            <a href="/admin/social-posting">Go to Posting Dashboard</a>

            <script>
              function copyCode() {
                const code = document.getElementById('authCode').textContent;
                navigator.clipboard.writeText(code).then(() => {
                  const btn = document.getElementById('copyBtn');
                  btn.textContent = '✓ Copied!';
                  setTimeout(() => {
                    btn.textContent = '📋 Copy Code';
                  }, 2000);
                });
              }

              // Auto-close message for dashboard users
              const params = new URLSearchParams(window.location.search);
              if (params.get('auto') === 'true') {
                setTimeout(() => {
                  window.close();
                }, 3000);
              }
            </script>
          </div>
        </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }
    );

  } catch (error) {
    console.error('Twitter OAuth callback error:', error);
    
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Server Error</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 3rem;
              border-radius: 1rem;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 500px;
            }
            h1 {
              color: #e53e3e;
            }
            a {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 0.75rem 2rem;
              border-radius: 0.5rem;
              text-decoration: none;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ Server Error</h1>
            <p>An unexpected error occurred while processing the callback.</p>
            <p>Please try again or contact support if the issue persists.</p>
            <a href="/admin/social-posting/settings">Back to Settings</a>
          </div>
        </body>
      </html>`,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}
