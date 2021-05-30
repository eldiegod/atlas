import React, { useContext, useState, useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router'
import { useSnackbar, useUser } from '@/hooks'
import { useChannel, useVideos } from '@/api/hooks'
import { absoluteRoutes } from '@/config/routes'
import { ChannelId } from '@/joystream-lib'
import { UploadManagerValue } from './types'
import { LiaisonJudgement } from '@/api/queries'
import { useMST } from '../useStore'
import { IAssetUpload } from '@/models/UploadsManagerStore'

type GroupByParentObjectIdAcc = {
  [key: string]: IAssetUpload[]
}

type AssetFile = {
  contentId: string
  blob: File | Blob
}

const UploadManagerContext = React.createContext<UploadManagerValue | undefined>(undefined)
UploadManagerContext.displayName = 'UploadManagerContext'

export const UploadManagerProvider: React.FC = observer(({ children }) => {
  const navigate = useNavigate()
  const { uploadsManagerStore } = useMST()
  const { displaySnackbar } = useSnackbar()
  const [assetsFiles] = useState<AssetFile[]>([])
  const { activeChannelId } = useUser()
  const { channel, loading: channelLoading } = useChannel(activeChannelId ?? '')
  const { videos, loading: videosLoading } = useVideos(
    {
      where: {
        id_in: uploadsManagerStore.uploadingAssetsState
          .filter((item) => item.parentObject.type === 'video')
          .map((item) => item.parentObject.id),
      },
    },
    { skip: !uploadsManagerStore.uploadingAssetsState.length }
  )
  const pendingNotificationsCounts = useRef({ uploading: 0, uploaded: 0 })

  const channelDataObjects = [channel?.avatarPhotoDataObject, channel?.coverPhotoDataObject]
  const videosDataObjects = videos?.flatMap((video) => [video.mediaDataObject, video.thumbnailPhotoDataObject]) || []
  const allDataObjects = [...channelDataObjects, ...videosDataObjects]

  // Enriching data with pending/accepted/rejected status
  const uploadsStateWithLiaisonJudgement = uploadsManagerStore.uploadingAssetsState
    .map((asset) => {
      const dataObject = allDataObjects.find((dataObject) => dataObject?.joystreamContentId === asset.contentId)
      if (!dataObject && !channelLoading && !videosLoading) {
        return null
      }

      return { ...asset, liaisonJudgement: dataObject?.liaisonJudgement, ipfsContentId: dataObject?.ipfsContentId }
    })
    .filter((asset) => asset !== null)

  const lostConnectionAssets = uploadsStateWithLiaisonJudgement.filter(
    (asset) =>
      asset?.liaisonJudgement === LiaisonJudgement.Pending &&
      asset.lastStatus === 'inProgress' &&
      asset.progress === 0 &&
      !assetsFiles.find((item) => item.contentId === asset.ipfsContentId)
  )

  useEffect(() => {
    if (!lostConnectionAssets.length) {
      return
    }
    displaySnackbar({
      title: `(${lostConnectionAssets.length}) Asset${
        lostConnectionAssets.length > 1 ? 's' : ''
      } waiting to resume upload`,
      description: 'Reconnect files to fix the issue',
      actionText: 'See',
      onActionClick: () => navigate(absoluteRoutes.studio.uploads()),
      iconType: 'warning',
    })
  }, [displaySnackbar, lostConnectionAssets.length, navigate])

  // Enriching video type assets with video title
  const uploadsStateWithVideoTitles = uploadsStateWithLiaisonJudgement.map((asset) => {
    if (asset?.type === 'video') {
      const video = videos?.find((video) => video.mediaDataObject?.joystreamContentId === asset.contentId)
      const title = video?.title ?? null
      return { ...asset, title }
    }
    return asset
  })

  // Check if liaison data and video title is available
  uploadsStateWithVideoTitles.map((asset) => {
    if (!channelLoading && !videosLoading && (!asset?.liaisonJudgement || !asset?.ipfsContentId)) {
      console.warn(`Asset does not contain liaisonJudgement. ContentId: ${asset?.contentId}`)
    }
    if (!channelLoading && !videosLoading && asset?.type === 'video' && !asset?.title) {
      console.warn(`Video type asset does not contain title. ContentId: ${asset.contentId}`)
    }
  })

  // Grouping all assets by parent id (videos, channel)
  const uploadsStateGroupedByParentObjectId = Object.values(
    uploadsStateWithVideoTitles.reduce((acc: GroupByParentObjectIdAcc, asset) => {
      if (!asset) {
        return acc
      }
      const key = asset.parentObject.id
      !acc[key] ? (acc[key] = [{ ...asset }]) : acc[key].push(asset)
      return acc
    }, {})
  )

  // const displayUploadingNotification = useRef(
  //   debounce(() => {
  //     displaySnackbar({
  //       title:
  //         pendingNotificationsCounts.current.uploading > 1
  //           ? `${pendingNotificationsCounts.current.uploading} assets being uploaded`
  //           : 'Asset being uploaded',
  //       iconType: 'info',
  //       timeout: UPLOADING_SNACKBAR_TIMEOUT,
  //       actionText: 'See',
  //       onActionClick: () => navigate(absoluteRoutes.studio.uploads()),
  //     })
  //     pendingNotificationsCounts.current.uploading = 0
  //   }, 700)
  // )

  // const displayUploadedNotification = useRef(
  //   debounce(() => {
  //     displaySnackbar({
  //       title:
  //         pendingNotificationsCounts.current.uploaded > 1
  //           ? `${pendingNotificationsCounts.current.uploaded} assets uploaded`
  //           : 'Asset uploaded',
  //       iconType: 'success',
  //       timeout: UPLOADED_SNACKBAR_TIMEOUT,
  //       actionText: 'See',
  //       onActionClick: () => navigate(absoluteRoutes.studio.uploads()),
  //     })
  //     pendingNotificationsCounts.current.uploaded = 0
  //   }, 700)
  // )

  // const startFileUpload = useCallback(
  //   async (file: File | Blob | null, asset: IAssetUpload, storageMetadata: string, opts?: StartFileUploadOptions) => {
  //     const fileInState = assetsFiles?.find((file) => file.contentId === asset.contentId)
  //     if (!fileInState && file) {
  //       setAssetsFiles((prevState) => [...prevState, { contentId: asset.contentId, blob: file }])
  //     }

  //     rax.attach()
  //     try {
  //       if (!fileInState && !file) {
  //         throw Error('File was not provided nor found')
  //       }
  //       if (!opts?.isReUpload && file) {
  //         uploadsManagerStore.addAsset(
  //           AssetUpload.create({ ...asset, lastStatus: 'inProgress', size: file.size, progress: 0 })
  //         )
  //       }
  //       // setAssetUploadProgress(0)
  //       const assetUrl = createStorageNodeUrl(asset.contentId, storageMetadata)

  //       const setUploadProgressThrottled = ({ loaded, total }: ProgressEvent) => {
  //         uploadsManagerStore.updateAsset({ ...asset, lastStatus: 'inProgress', progress: (loaded / total) * 100 })
  //       }

  //       pendingNotificationsCounts.current.uploading++
  //       displayUploadingNotification.current()

  //       await axios.put(assetUrl.toString(), opts?.changeHost ? fileInState?.blob : file, {
  //         headers: {
  //           // workaround for a bug in the storage node
  //           'Content-Type': '',
  //         },
  //         raxConfig: {
  //           retry: RETRIES_COUNT,
  //           noResponseRetries: RETRIES_COUNT,
  //           onRetryAttempt: (err) => {
  //             const cfg = rax.getConfig(err)
  //             if (cfg?.currentRetryAttempt === 1) {
  //               uploadsManagerStore.updateAsset({
  //                 ...asset,
  //                 lastStatus: 'reconnecting',
  //               })
  //             }

  //             if (cfg?.currentRetryAttempt === RETRIES_COUNT) {
  //               throw Error(RECONNECTION_ERROR_MESSAGE)
  //             }
  //           },
  //         },
  //         onUploadProgress: setUploadProgressThrottled,
  //       })

  //       // Cancel delayed functions that would overwrite asset status back to 'inProgres'
  //       // setUploadProgressThrottled.cancel()

  //       // TODO: remove assets from the same parent if all finished
  //       uploadsManagerStore.updateAsset({
  //         ...asset,
  //         lastStatus: 'completed',
  //         progress: 100,
  //       })

  //       pendingNotificationsCounts.current.uploaded++
  //       displayUploadedNotification.current()
  //     } catch (e) {
  //       console.error('Upload failed', e)
  //       if (e.message === RECONNECTION_ERROR_MESSAGE) {
  //         uploadsManagerStore.updateAsset({
  //           ...asset,
  //           lastStatus: 'reconnectionError',
  //         })
  //         displaySnackbar({
  //           title: 'Asset failing to reconnect',
  //           description: 'Host is not responding',
  //           actionText: 'Go to uploads',
  //           onActionClick: () => navigate(absoluteRoutes.studio.uploads()),
  //           iconType: 'warning',
  //         })
  //       } else {
  //         if (asset)
  //           uploadsManagerStore.updateAsset({
  //             ...asset,
  //             lastStatus: 'error',
  //           })
  //       }
  //     }
  //   },
  //   [assetsFiles, displaySnackbar, navigate, uploadsManagerStore]
  // )

  const isLoading = channelLoading || videosLoading

  return (
    <UploadManagerContext.Provider
      value={{
        isLoading,
        uploadsState: uploadsStateGroupedByParentObjectId,
      }}
    >
      {children}
    </UploadManagerContext.Provider>
  )
})

const useUploadsManagerContext = () => {
  const ctx = useContext(UploadManagerContext)
  if (ctx === undefined) {
    throw new Error('useUploadsManager must be used within a UploadManagerProvider')
  }
  return ctx
}

export const useUploadsManager = (channelId: ChannelId) => {
  const { uploadsState, ...rest } = useUploadsManagerContext()
  return {
    uploadsState,
    ...rest,
  }
}
