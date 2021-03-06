import { useRandomStorageProviderUrl } from '@/api/hooks'
import { AssetAvailability, DataObject } from '@/api/queries'
import { createStorageNodeUrl } from '@/utils/asset'
import { useCallback } from 'react'

export const useAsset = () => {
  const { getRandomStorageProviderUrl } = useRandomStorageProviderUrl()

  const getAssetUrl = useCallback(
    (availability?: AssetAvailability, assetUrls?: string[], dataObject?: DataObject | null) => {
      if (availability !== AssetAvailability.Accepted) {
        return
      }
      if (assetUrls?.length) {
        return assetUrls[0]
      }
      if (!dataObject?.joystreamContentId) {
        return
      }
      if (dataObject?.liaison?.isActive && dataObject?.liaison?.metadata) {
        return createStorageNodeUrl(dataObject.joystreamContentId, dataObject?.liaison?.metadata)
      }

      const randomStorageUrl = getRandomStorageProviderUrl()
      if (randomStorageUrl) {
        return createStorageNodeUrl(dataObject.joystreamContentId, randomStorageUrl)
      }
    },
    [getRandomStorageProviderUrl]
  )

  return { getAssetUrl }
}
