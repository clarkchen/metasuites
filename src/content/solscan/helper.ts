import $ from 'jquery'
import browser from 'webextension-polyfill'
import { chromeEvent } from '@common/event'
import { POST_ADDRESS_TAGS, CONTENT_SCRIPT_READY } from '@common/constants'
import { pickSolanaAddress, waitForSelector } from '@common/utils'

/**
 * Wait for a DOM element to appear (isNegative=true, default) or disappear (isNegative=false),
 * then invoke the callback via requestIdleCallback.
 * Uses MutationObserver — zero polling, no retry limit.
 */
const ACCOUNT_BOX_CONTAINER =
  '#__next > div:nth-of-type(1) > div:nth-of-type(3) > div:first-child > div:first-child > div:last-child > div:first-child > div:first-child'

/**
 * Create (or recreate) the shared account box container that holds
 * renderFundFlowButton and renderMainAddressLabel as a single flex unit.
 * Destroys any existing box so each re-render starts clean.
 */
export const createAccountBox = () => {
  $('#__metadock-account-box__').remove()
  const box = $(
    '<div id="__metadock-account-box__" class="md-flex items-center flex-wrap gap-2"></div>'
  )
  box.css({ marginTop: '24px' })
  $(ACCOUNT_BOX_CONTAINER).append(box)
}

export const lazyLoad = async (
  callback: () => void,
  selector: string,
  isNegative = true
) => {
  await waitForSelector(selector, { hidden: !isNegative })
  requestIdleCallback(callback)
}

/**
 * Announce that this content script is ready and retrieve any messages
 * the background tried to send before the script was loaded.
 * Call this AFTER registering all runtime.onMessage listeners.
 */
export const announceReady = async (): Promise<string[]> => {
  try {
    const messages = await browser.runtime.sendMessage(CONTENT_SCRIPT_READY)
    return Array.isArray(messages) ? messages : []
  } catch {
    return []
  }
}

export const getNameTag = () => {
  const profile = $('.shadow-m > div:nth-of-type(2)')[1]
  const tokenNameLabel = $(profile)
    .find('> div:first-child > div:nth-of-type(1)')
    .text()
  if (tokenNameLabel.toLocaleLowerCase().indexOf('token name') > -1) {
    return $(profile)
      .find('> div:first-child > div:nth-of-type(2)')
      .text()
      .trim()
  }
  const publicNameLabel = $(profile)
    .find('> div:first-child > div:nth-of-type(1)')
    .text()
  if (publicNameLabel.toLocaleLowerCase().indexOf('public name') > -1) {
    return $(profile)
      .find('> div:first-child > div:nth-of-type(2)')
      .text()
      .trim()
  }
}

export const getTags = () => {
  const profile = $('.shadow-m > div:nth-of-type(2)')[1]
  const tagsLabel = $(profile)
    .find('> div:last-child > div:nth-of-type(1)')
    .text()
  if (tagsLabel.toLocaleLowerCase().indexOf('tags') > -1) {
    const container = $(profile).find(
      '> div:last-child > div:nth-of-type(2) > div  > div'
    )
    return container.map((index, el) => el.innerText.trim()).get()
  }
  return []
}

export const trigger = async () => {
  const address = pickSolanaAddress(window.location.pathname)
  console.log('trigger', address)
  if (!address) return
  await chromeEvent.emit<typeof POST_ADDRESS_TAGS>(POST_ADDRESS_TAGS, {
    chain: 'solana',
    address,
    labels: getTags(),
    nameTag: getNameTag()
  })
}
