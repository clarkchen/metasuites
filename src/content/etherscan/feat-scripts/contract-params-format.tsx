import { createRoot } from 'react-dom/client'
import $ from 'jquery'
import { getAddress, isAddress } from 'ethers'

import { FormatParamBtn } from '../components'

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
  insertFn: (rootEl: HTMLElement) => void
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
  createRoot(rootEl).render(<FormatParamBtn onClick={handleClick} />)
}

/** Quick format parameters */
const formatWriteContractParams = async () => {
  const writeContractIframes = $(
    '#writecontractiframe, #writeproxycontractiframe'
  )

  writeContractIframes.each(function () {
    const renderButtons = () => {
      $(this)
        .contents()
        .find('input[data-bs-type]')
        .each(function () {
          const input = $(this)
          const label = input.closest('.col-12').find('label').first()
          if (!label.length) return
          renderFormatBtn(input, rootEl => label.append(rootEl))
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

export default formatWriteContractParams
