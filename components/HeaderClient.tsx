'use client'

import Header from './Header'

type HeaderProps = {
  loggedIn: boolean
  firstName: string
  avatar: string
}

export default function HeaderClient(props: HeaderProps) {
  return <Header {...props} />
}