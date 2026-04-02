import browser from 'webextension-polyfill'

import { CONTENT_SCRIPT_READY } from '@common/constants'

const pending = new Map<number, Set<string>>()

/**
 * Try to send a message to a tab's content script.
 * If the content script isn't loaded yet, store the message so it can be
 * replayed when the script announces itself ready via CONTENT_SCRIPT_READY.
 */
export const sendOrStore = (tabId: number, message: string) => {
  // Pre-create the set so that if onUpdated fires and deletes it while
  // sendMessage is in-flight, the catch below can detect the navigation
  // and discard the now-stale message instead of writing it back.
  if (!pending.has(tabId)) pending.set(tabId, new Set())

  browser.tabs
    .sendMessage(tabId, message)
    .then(() => {
      pending.get(tabId)?.delete(message)
    })
    .catch(() => {
      if (!pending.has(tabId)) return // tab navigated while in-flight, discard
      pending.get(tabId)!.add(message)
    })
}

/**
 * Register all listeners required for store-and-replay.
 * Must be called once at background startup.
 */
export const initTabMessaging = () => {
  // Content script is ready — replay any messages it missed during load
  browser.runtime.onMessage.addListener((message, sender) => {
    if (message === CONTENT_SCRIPT_READY && sender.tab?.id) {
      const messages = [...(pending.get(sender.tab.id) ?? [])]
      pending.delete(sender.tab.id)
      return Promise.resolve(messages)
    }
  })

  // Tab closed — release memory immediately
  browser.tabs.onRemoved.addListener(tabId => {
    pending.delete(tabId)
  })

  // Navigation (SPA or full reload) — stale pending messages are no longer valid
  browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.url || changeInfo.status === 'loading') {
      pending.delete(tabId)
    }
  })
}
