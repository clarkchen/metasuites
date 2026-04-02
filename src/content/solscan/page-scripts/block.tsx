import browser from 'webextension-polyfill'

import { store } from '@src/store'
import { GET_SOLSCAN_BLOCK_TXS } from '@common/constants'

import { renderTransactionHashPhalconLink } from '../feat-scripts'
import { lazyLoad, announceReady } from '../helper'

const initBlockPageScript = async () => {
  const { quick2Parsers } = await store.get('options')

  lazyLoad(
    () => {
      if (quick2Parsers) renderTransactionHashPhalconLink()
    },
    '.animate-pulse',
    false
  )

  const handleBlockTxs = () => {
    lazyLoad(
      () => {
        if (quick2Parsers) renderTransactionHashPhalconLink()
      },
      '.animate-pulse',
      false
    )
  }

  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message === GET_SOLSCAN_BLOCK_TXS) {
      handleBlockTxs()
      sendResponse()
    }
  })

  const missed = await announceReady()
  missed.forEach(m => {
    if (m === GET_SOLSCAN_BLOCK_TXS) handleBlockTxs()
  })
}

export default initBlockPageScript
