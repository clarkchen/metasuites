import browser from 'webextension-polyfill'

import { store } from '@src/store'
import { GET_SOLSCAN_ACCOUNT_TAB_DATA, SOLSCAN_PAGES } from '@common/constants'

import {
  renderFundFlowButton,
  renderMainAddressLabel,
  renderEnhancedLabels,
  renderTransactionHashPhalconLink
} from '../feat-scripts'
import { lazyLoad, trigger, announceReady, createAccountBox } from '../helper'

const initAccountPageScript = async () => {
  const { fundFlow, enhancedLabels, quick2Parsers } = await store.get('options')

  lazyLoad(() => {
    if (fundFlow || enhancedLabels) createAccountBox()
    if (fundFlow) renderFundFlowButton(SOLSCAN_PAGES.ACCOUNT.name)
    if (enhancedLabels) {
      renderMainAddressLabel()
      renderEnhancedLabels()
    }
    trigger()
  }, '#account-tabs')

  lazyLoad(
    () => {
      if (quick2Parsers) renderTransactionHashPhalconLink()
    },
    '.animate-pulse',
    false
  )

  const handleTabData = () => {
    requestIdleCallback(() => {
      if (enhancedLabels) renderEnhancedLabels()
      if (quick2Parsers) renderTransactionHashPhalconLink()
    })
  }

  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message === GET_SOLSCAN_ACCOUNT_TAB_DATA) {
      handleTabData()
      sendResponse()
    }
  })

  const missed = await announceReady()
  missed.forEach(m => {
    if (m === GET_SOLSCAN_ACCOUNT_TAB_DATA) handleTabData()
  })
}

export default initAccountPageScript
