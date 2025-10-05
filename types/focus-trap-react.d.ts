declare module 'focus-trap-react' {
  import * as React from 'react'

  export interface FocusTrapProps {
    active?: boolean
    focusTrapOptions?: Record<string, any>
    children?: React.ReactNode
  }

  const FocusTrap: React.ComponentType<FocusTrapProps>
  export default FocusTrap
}
