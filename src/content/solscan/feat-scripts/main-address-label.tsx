import type { CallbackResponse } from 'chrome-extension-core/lib/event'
import { createRoot } from 'react-dom/client'
import $ from 'jquery'

import { chromeEvent } from '@common/event'
import type { AddressLabel } from '@common/api/types'
import { GET_ADDRESS_LABELS } from '@common/constants'
import { pickSolanaAddress } from '@common/utils'

import { MainAddressLabel } from '../components'

const renderMainAddressLabel = async () => {
  const mainAddress = pickSolanaAddress(window.location.pathname)
  if (!mainAddress) return

  const labelRootEl = $(
    '<div id="__metadock-main-address-box__" class="inline-flex items-center flex-wrap gap-2"></div>'
  )
  $('#__metadock-account-box__').append(labelRootEl)

  await chromeEvent
    .emit(GET_ADDRESS_LABELS, {
      chain: 'solana',
      addresses: [mainAddress]
    })
    .then((res: CallbackResponse<AddressLabel[]> | undefined) => {
      if (res?.success) {
        createRoot(labelRootEl[0]).render(
          <MainAddressLabel address={mainAddress} label={res.data[0]} />
        )
      }
    })
}

export default renderMainAddressLabel
