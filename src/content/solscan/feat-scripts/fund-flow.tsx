import { createRoot } from 'react-dom/client'
import $ from 'jquery'

import { pickSolanaAddress } from '@common/utils'
import { type SOLSCAN_PAGE_NAMES, SOLSCAN_PAGES } from '@common/constants'

import { FundFlowButton } from '../components'

const renderFundFlowButton = async (
  pageName: (typeof SOLSCAN_PAGE_NAMES)[number]
) => {
  $('#__metadock-modal-fund-flow__').remove()
  const isAccountPage = pageName === SOLSCAN_PAGES.ACCOUNT.name
  const mainAddress = pickSolanaAddress(window.location.pathname)
  if (mainAddress) {
    const btnRootEl = $('<div id="__metadock-fund-flow-btn__"></div>')
    if (isAccountPage) {
      $('#__metadock-account-box__').append(btnRootEl)
    } else {
      $('#__metadock-fund-flow-btn__').remove()
      btnRootEl.css({ display: 'block' })
      $(
        '#__next > div:nth-of-type(1) > div:nth-of-type(3) > div:first-child > div:first-child > div:last-child > div:first-child'
      ).append(btnRootEl)
    }
    createRoot(btnRootEl[0]).render(
      <FundFlowButton chain="solana" mainAddress={mainAddress} />
    )
  }
}

export default renderFundFlowButton
