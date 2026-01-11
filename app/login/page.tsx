// website/app/login/page.tsx
// This is the route file for the /login page.
// It imports and renders the LoginPage component.

export const dynamic = 'force-dynamic'

import LoginPage from '@/components/LoginPage'

export default function LoginRoute() {
  return <LoginPage />
}
