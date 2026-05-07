import { createRoot } from 'react-dom/client'
import $ from 'jquery'

import { chromeEvent } from '@common/event'
import { GET_PRIVATE_VARIABLES } from '@common/constants'
import { pickAddress } from '@common/utils'
import type {
  PrivateVariablesRes,
  PostPrivateVariablesParams
} from '@common/api/types'

import { ReadContractAccordionItem } from '../components'

/** Show private variables */
const genContractPrivateVariables = async (chain: string) => {
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

    $(this).on('load', handleLoad)
    if (
      (this as HTMLIFrameElement).contentDocument?.readyState === 'complete'
    ) {
      handleLoad()
    }
  })
}

export default genContractPrivateVariables
