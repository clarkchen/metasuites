import { waitForSelector, waitForDomStable } from '@common/utils'

/**
 * Wait for a loading spinner to finish and DOM to stabilize, then run callback.
 * Handles two SPA timing scenarios:
 *   - execute() fires BEFORE spinner appears → wait up to 500ms for it, then wait for it to go
 *   - execute() fires AFTER spinner appears  → wait for it to go immediately
 */
export const lazyLoad = async (callback: () => void, selector: string) => {
  if (!document.querySelector(selector)) {
    await waitForSelector(selector, { timeout: 500 })
  }
  if (document.querySelector(selector)) {
    const resolved = await waitForSelector(selector, {
      hidden: true,
      timeout: 30_000
    })
    if (!resolved) return // spinner didn't disappear within 30s, abort injection
  }
  // Wait for React to finish all render cycles after spinner is gone
  await waitForDomStable()
  requestIdleCallback(callback)
}
