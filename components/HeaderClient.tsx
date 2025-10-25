'use client'

import Header from './Header'

type HeaderProps = {
  avatar?: string
  isAdmin?: boolean
}

export default function HeaderClient(props: HeaderProps = {}) {
  return <Header {...props} />
}