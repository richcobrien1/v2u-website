// Redirect /login → /sign-in (Clerk authentication)
import { redirect } from 'next/navigation'

export default function LoginRoute() {
  redirect('/sign-in')
}
