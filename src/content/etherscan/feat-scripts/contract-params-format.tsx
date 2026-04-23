import { createRoot } from 'react-dom/client'
import $ from 'jquery'
import { getAddress, isAddress } from 'ethers'

import { EXT_SUPPORT_WEB_LIST } from '@common/constants'

import { FormatParamBtn, EthFormatParamBtn } from '../components'

const ETH_DOMAINS =
  EXT_SUPPORT_WEB_LIST.find(item => item.chain === 'eth')?.domains ?? []

const formatTuple = (params: string): string => {
  const toArray = (str: string): string => {
    const arr = str.split(';').map(subStr =>
      subStr.split(',').map(i => {
        const v = i.trim()
        if (v === 'true') {
          return true
        }
        if (v === 'false') {
          return false
        }
        return isAddress(v) ? getAddress(v) : v
      })
    )
    const arrFlat = arr.length === 1 ? arr.flat(1) : arr
    return JSON.stringify(arrFlat)
  }
  try {
    if (params.indexOf(',') === -1 && params.indexOf(';') === -1) {
      if (params.indexOf(' ') === -1) {
        return params
      } else {
        return JSON.stringify(params.split(' '))
      }
    }
    if (Array.isArray(JSON.parse(params))) {
      return params
    }
    return toArray(params)
  } catch (e) {
    if (params[0] === '[' && params[params.length - 1] === ']') {
      return params.replace(/(\w+)/g, '"$1"').replace(/undefined/g, 'null')
    }
    return toArray(params)
  }
}

const renderFormatBtn = (
  input: JQuery<HTMLElement>,
  insertFn: (rootEl: HTMLElement) => void,
  isEth = false
) => {
  const rootEl = document.createElement('span')
  const type = input.attr('data-bs-type')
  const handleClick = () => {
    const val = input.val()
    if (typeof val !== 'string') return
    if (type === 'address') {
      if (isAddress(val)) input.val(getAddress(val))
    } else {
      input.val(formatTuple(val))
    }
  }
  insertFn(rootEl)
  createRoot(rootEl).render(
    isEth ? (
      <EthFormatParamBtn onClick={handleClick} />
    ) : (
      <FormatParamBtn onClick={handleClick} />
    )
  )
}

/** Strategy: ETH mainnet (updated page structure) */
const ethFormatHandler = (writeContractIframes: JQuery<HTMLElement>) => {
  writeContractIframes.each(function () {
    const renderButtons = () => {
      $(this)
        .contents()
        .find('input[data-bs-type]')
        .each(function () {
          const input = $(this)
          const label = input.closest('.col-12').find('label').first()
          if (!label.length) return
          renderFormatBtn(input, rootEl => label.append(rootEl), true)
        })
    }

    const iframeContentsExist = !!$(this)
      .contents()
      .find('#js-write-contract-function-container')
      .children('.accordion').length

    if (iframeContentsExist) {
      renderButtons()
      return
    }

    $(this).on('load', async () => {
      renderButtons()
    })
  })
}

/** Strategy: other Etherscan-compatible sites (original page structure) */
const defaultFormatHandler = (writeContractIframes: JQuery<HTMLElement>) => {
  writeContractIframes.each(function () {
    const renderButtons = () => {
      $(this)
        .contents()
        .find('.collapse .card-body form .form-group input')
        .each(function () {
          const input = $(this)
          input.siblings('br').remove()
          renderFormatBtn(input, rootEl => input.before(rootEl))
        })
    }

    const iframeContentsExist = !!$(this).contents().find('#header').children()
      .length

    if (iframeContentsExist) {
      renderButtons()
      return
    }

    $(this).on('load', async () => {
      renderButtons()
    })
  })
}

/** Quick format parameters */
const formatWriteContractParams = async () => {
  const writeContractIframes = $(
    '#writecontractiframe, #writeproxycontractiframe'
  )

  const hostname = window.location.hostname
  const handler = ETH_DOMAINS.includes(hostname)
    ? ethFormatHandler
    : defaultFormatHandler

  handler(writeContractIframes)
}

export default formatWriteContractParams
