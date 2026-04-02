import browser from 'webextension-polyfill'

import { store } from '@src/store'
import { GET_SOLSCAN_TRANSACTION } from '@common/constants'

import {
  renderTxPageAddressLabels,
  renderAlternativeParsers
} from '../feat-scripts'
import { lazyLoad, announceReady } from '../helper'

const initTxPageScript = async () => {
  const { enhancedLabels, quick2Parsers } = await store.get('options')

  const handleTrigger = () => {
    lazyLoad(() => {
      if (enhancedLabels) renderTxPageAddressLabels()
      if (quick2Parsers) renderAlternativeParsers()
    }, 'div[data-state="active"]')
  }

  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message === GET_SOLSCAN_TRANSACTION) {
      handleTrigger()
      sendResponse()
    }
  })

  // Replay any message background sent before this script was ready
  const missed = await announceReady()
  missed.forEach(m => {
    if (m === GET_SOLSCAN_TRANSACTION) handleTrigger()
  })
}

export default initTxPageScript
