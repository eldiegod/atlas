import React, { useState } from 'react'
import { useDrafts, useActiveUser, useEditVideoSheet, useUploadsManager } from '@/hooks'
import { absoluteRoutes } from '@/config/routes'
import { Button } from '@/shared/components'
import SidenavBase, { NavItemType } from '@/components/Sidenav/SidenavBase'
import { SvgGlyphAddVideo, SvgGlyphExternal, SvgNavChannel, SvgNavUpload, SvgNavVideos } from '@/shared/icons'
import { CSSTransition } from 'react-transition-group'
import { transitions } from '@/shared/theme'

const studioNavbarItems: NavItemType[] = [
  {
    icon: <SvgNavVideos />,
    name: 'Videos',
    expandedName: 'My videos',
    to: absoluteRoutes.studio.videos(),
  },
  {
    icon: <SvgNavChannel />,
    name: 'Channel',
    expandedName: 'My channel',
    to: absoluteRoutes.studio.editChannel(),
  },
  {
    icon: <SvgNavUpload />,
    name: 'Uploads',
    expandedName: 'My uploads',
    to: absoluteRoutes.studio.uploads(),
  },
]

export const StudioSidenav: React.FC = () => {
  const [expanded, setExpanded] = useState(false)
  const { activeUser } = useActiveUser()
  const channelId = activeUser.channelId ?? ''
  const { unseenDrafts } = useDrafts('video', channelId)
  const { sheetState } = useEditVideoSheet()
  const { uploadsState } = useUploadsManager(channelId)

  const assetsInProgress = uploadsState.filter((asset) => asset.lastStatus === 'inProgress')

  const studioNavbarItemsWithBadge = studioNavbarItems.map((item) => {
    if (item.to === absoluteRoutes.studio.videos()) {
      return { ...item, badgeNumber: unseenDrafts.length }
    }
    if (item.to === absoluteRoutes.studio.uploads()) {
      return { ...item, badgeNumber: assetsInProgress.length }
    }
    return item
  })

  return (
    <SidenavBase
      expanded={expanded}
      toggleSideNav={setExpanded}
      isStudio
      items={studioNavbarItemsWithBadge}
      buttonsContent={
        <>
          <CSSTransition
            in={sheetState !== 'open'}
            unmountOnExit
            timeout={parseInt(transitions.timings.loading)}
            classNames={transitions.names.fade}
          >
            <Button
              icon={<SvgGlyphAddVideo />}
              to={absoluteRoutes.studio.editVideo()}
              onClick={() => setExpanded(false)}
            >
              New Video
            </Button>
          </CSSTransition>
          <Button
            variant="secondary"
            onClick={() => setExpanded(false)}
            icon={<SvgGlyphExternal />}
            to={absoluteRoutes.viewer.index()}
          >
            Joystream
          </Button>
        </>
      }
    />
  )
}
