import { createRoot } from 'react-dom/client'
import $ from 'jquery'

import { chromeEvent } from '@common/event'
import { GET_PRIVATE_VARIABLES, EXT_SUPPORT_WEB_LIST } from '@common/constants'
import { pickAddress } from '@common/utils'
import type {
  PrivateVariablesRes,
  PostPrivateVariablesParams
} from '@common/api/types'

import {
  ReadContractAccordionItem,
  EthReadContractAccordionItem
} from '../components'

// ETH mainnet domains that have updated page structure requiring separate handling
const ETH_DOMAINS =
  EXT_SUPPORT_WEB_LIST.find(item => item.chain === 'eth')?.domains ?? []

/** Strategy: ETH mainnet (updated page structure) */
const ethPageHandler = async (chain: string) => {
  const readContractIframes = $('#readcontractiframe, #readproxycontractiframe')

  readContractIframes.each(function () {
    $(this).contents().find('body').css('height', 'fit-content')

    let executed = false
    const handleLoad = async () => {
      if (executed) return

      const isProxy = $(this).attr('id') === 'readproxycontractiframe'
      const mainAddress = pickAddress(window.location.pathname)
      const implAddress = isProxy
        ? pickAddress(
            $('#ContentPlaceHolder1_readProxyMessage').find('a').text()
          )
        : undefined
      if (!mainAddress || (isProxy && !implAddress)) return

      const readContractAccordion = $(this)
        .contents()
        .find('#js-read-contract-function-container')
      if (!readContractAccordion.find('a[data-counter]').length) return

      executed = true

      const params: PostPrivateVariablesParams = {
        chain: chain,
        address: mainAddress,
        implAddress
      }

      const res = await chromeEvent.emit<
        typeof GET_PRIVATE_VARIABLES,
        PrivateVariablesRes
      >(GET_PRIVATE_VARIABLES, params)
      if (res?.success && res?.data) {
        const lastIdx =
          readContractAccordion
            .children('.accordion')
            .last()
            .find('a[data-counter]')
            .attr('data-counter') ?? '0'

        if (res.data.length) {
          const expandBtn = $(this)
            .contents()
            .find('#js-btn-read-contract-function')
          if (expandBtn.text().indexOf('Expand') !== -1) {
            expandBtn.on('click', () => {
              setTimeout(() => {
                const iframeHeight = $(this).contents().find('body').height()
                if (iframeHeight) {
                  $(this).height(iframeHeight)
                }
              }, 1000)
            })
          }
        }

        res.data.forEach((item, index) => {
          const wrapperEl = document.createElement('div')
          wrapperEl.className = 'accordion mb-2'
          const rootEl = document.createElement('div')
          wrapperEl.appendChild(rootEl)
          readContractAccordion.append(wrapperEl)
          createRoot(rootEl).render(
            <EthReadContractAccordionItem
              chain={chain}
              implAddress={implAddress}
              address={mainAddress}
              data={item}
              id={`accordion-${Number(lastIdx) + 1 + index}`}
            />
          )
        })

        requestIdleCallback(() => {
          const iframeHeight = $(this).contents().find('body').height()
          if (iframeHeight) {
            $(this).height(iframeHeight)
          }
        })
      }
    }

    $(this).on('load', handleLoad)
    if (
      (this as HTMLIFrameElement).contentDocument?.readyState === 'complete'
    ) {
      handleLoad()
    }
  })
}

/** Strategy: other Etherscan-compatible sites (original page structure) */
const defaultPageHandler = async (chain: string) => {
  const readContractIframes = $('#readcontractiframe, #readproxycontractiframe')

  readContractIframes.each(function () {
    $(this).contents().find('body').css('height', 'fit-content')

    let executed = false
    const handleLoad = async () => {
      if (executed) return

      const isProxy = $(this).attr('id') === 'readproxycontractiframe'
      const mainAddress = pickAddress(window.location.pathname)
      const implAddress = isProxy
        ? pickAddress(
            $('#ContentPlaceHolder1_readProxyMessage').find('a').text()
          )
        : undefined
      if (!mainAddress || (isProxy && !implAddress)) return

      executed = true

      const params: PostPrivateVariablesParams = {
        chain: chain,
        address: mainAddress,
        implAddress
      }

      const res = await chromeEvent.emit<
        typeof GET_PRIVATE_VARIABLES,
        PrivateVariablesRes
      >(GET_PRIVATE_VARIABLES, params)
      if (res?.success && res?.data) {
        const readContractAccordion = $(this)
          .contents()
          .find('#readContractAccordion')
        const lastIdx = readContractAccordion
          .children(':last-child')
          .find("a.btn[data-bs-toggle='collapse'] > .text-left")
          .text()
          .split('.')[0]

        if (res.data.length) {
          const expandBtn = $(this).contents().find('a.expandCollapseAllButton')
          if (expandBtn.text().indexOf('Expand') !== -1) {
            expandBtn.bind('click', () => {
              setTimeout(() => {
                const iframeHeight = $(this).contents().find('body').height()
                if (iframeHeight) {
                  $(this).height(iframeHeight)
                }
              }, 1000)
            })
          }
        }

        res.data.forEach((item, index) => {
          const rootEl = document.createElement('div')
          readContractAccordion.append(rootEl)
          createRoot(rootEl).render(
            <ReadContractAccordionItem
              chain={chain}
              implAddress={implAddress}
              address={mainAddress}
              data={item}
              id={`accordion-${Number(lastIdx) + 1 + index}`}
            />
          )
        })

        requestIdleCallback(() => {
          const iframeHeight = $(this).contents().find('body').height()
          if (iframeHeight) {
            $(this).height(iframeHeight)
          }
        })
      }
    }

    $(this).on('load', () => {
      executed = false
      handleLoad()
    })
    if (
      (this as HTMLIFrameElement).contentDocument?.readyState === 'complete'
    ) {
      handleLoad()
    }
  })
}

type Strategy = (chain: string) => Promise<void>

const STRATEGY_MAP: Record<string, Strategy> = {
  eth: ethPageHandler,
  default: defaultPageHandler
}

/** Show private variables */
const genContractPrivateVariables = async (chain: string) => {
  const hostname = window.location.hostname
  const strategy = ETH_DOMAINS.includes(hostname)
    ? STRATEGY_MAP.eth
    : STRATEGY_MAP.default
  return strategy(chain)
}

export default genContractPrivateVariables
