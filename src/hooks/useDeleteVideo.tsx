import { useVideos } from '@/api/hooks'
import { useState } from 'react'
import { useJoystream, useAuthorizedUser, useTransactionManager } from '@/hooks'
import { removeVideoFromCache } from '@/utils/cachingAssets'

export const useDeleteVideo = () => {
  const { joystream } = useJoystream()
  const { handleTransaction } = useTransactionManager()
  const { activeMemberId, activeChannelId } = useAuthorizedUser()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { refetchCount: refetchVideosCount, client } = useVideos({
    where: {
      channelId_eq: activeChannelId,
    },
  })

  const confirmDeleteVideo = async (videoId: string, onTxSync?: () => void) => {
    if (!joystream) {
      return
    }

    setIsDeleteDialogOpen(false)

    handleTransaction({
      txFactory: (updateStatus) => joystream.deleteVideo(videoId, activeMemberId, updateStatus),
      onTxSync: async () => {
        await refetchVideosCount()
        removeVideoFromCache(videoId, client)
        onTxSync?.()
      },
      successMessage: {
        title: 'Video successfully deleted!',
        description: 'Your video was marked as deleted and it will no longer show up on Joystream.',
      },
    })
  }

  return {
    closeVideoDeleteDialog: () => setIsDeleteDialogOpen(false),
    openVideoDeleteDialog: () => setIsDeleteDialogOpen(true),
    confirmDeleteVideo,
    isDeleteDialogOpen,
  }
}
