import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import styled from '@emotion/styled'
import { Snackbar } from '@/shared/components'
import { transitions, sizes } from '@/shared/theme'
import { createId } from '@/utils/createId'
import { SvgAlertError, SvgAlertInfo, SvgAlertSuccess, SvgAlertWarning } from '@/shared/icons'

type SnackbarIconType = 'success' | 'error' | 'info' | 'warning'

export type DisplaySnackbarArgs = {
  timeout?: number
  variant?: 'primary' | 'secondary'
  iconType?: SnackbarIconType
  title: string
  description?: string
  actionText?: string
  onActionClick?: () => void
}

type SnackbarsState = {
  id: string
} & Omit<DisplaySnackbarArgs, 'time'>

type SnackbarContextValue = {
  snackbars: SnackbarsState[]
  displaySnackbar: (args: DisplaySnackbarArgs) => string
  updateSnackbar: (id: string, opts: Omit<DisplaySnackbarArgs, 'id'>) => void
  closeSnackbar: (id: string) => void
}

const ICON_TYPE_TO_ICON: Record<SnackbarIconType, ReactNode> = {
  info: <SvgAlertInfo />,
  success: <SvgAlertSuccess />,
  error: <SvgAlertError />,
  warning: <SvgAlertWarning />,
}

const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined)
SnackbarContext.displayName = 'SnackbarContext'

const SNACKBARS_LIMIT = 3

export const SnackbarProvider: React.FC = ({ children }) => {
  const [snackbars, setSnackbars] = useState<SnackbarsState[]>([])

  const displaySnackbar = useCallback(({ timeout, ...args }: DisplaySnackbarArgs) => {
    const id = createId()
    setSnackbars((currentSnackbars) => {
      return [...currentSnackbars, { id, ...args }]
    })

    if (timeout) {
      setTimeout(() => {
        setSnackbars((currentSnackbars) => currentSnackbars.filter((snackbar) => snackbar.id !== id))
      }, timeout)
    }

    return id
  }, [])

  const updateSnackbar = useCallback((id: string, opts: Omit<DisplaySnackbarArgs, 'id'>) => {
    setSnackbars((currentSnackbars) =>
      currentSnackbars.map((snackbar) => (snackbar.id === id ? { ...snackbar, ...opts } : snackbar))
    )
  }, [])

  const closeSnackbar = useCallback((id: string) => {
    setSnackbars((currentSnackbars) => currentSnackbars.filter((snackbar) => snackbar.id !== id))
  }, [])

  useEffect(() => {
    if (snackbars.length > SNACKBARS_LIMIT) {
      setTimeout(() => {
        setSnackbars((currentSnackbars) => currentSnackbars.slice(1))
      }, 500)
    }
  }, [snackbars])

  return (
    <SnackbarContext.Provider value={{ snackbars, displaySnackbar, updateSnackbar, closeSnackbar }}>
      {children}
      <SnackbarsContainer>
        <TransitionGroup>
          {snackbars.map(({ id, iconType, onActionClick, ...snackbarProps }) => (
            <CSSTransition key={id} timeout={2 * parseInt(transitions.timings.regular)} classNames={'snackbar'}>
              <Snackbar
                {...snackbarProps}
                onActionClick={() => {
                  onActionClick?.()
                  closeSnackbar(id)
                }}
                icon={iconType && ICON_TYPE_TO_ICON[iconType]}
                onClick={() => closeSnackbar(id)}
              />
            </CSSTransition>
          ))}
        </TransitionGroup>
      </SnackbarsContainer>
    </SnackbarContext.Provider>
  )
}

const SnackbarsContainer = styled.div`
  position: fixed;
  left: var(--sidenav-collapsed-width);
  bottom: ${sizes(18)};
  margin-left: ${sizes(4)};
  max-width: 360px;
  width: 100%;
  display: grid;
`

export const useSnackbar = () => {
  const ctx = useContext(SnackbarContext)
  if (ctx === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider')
  }
  return ctx
}
