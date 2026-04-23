import { createRoot } from 'react-dom/client'
import $ from 'jquery'

import { pickAddress } from '@common/utils'
import { ModalContractVariableLogs } from '@common/components'
import { store } from '@src/store'
import { chromeEvent } from '@common/event'
import {
  GET_CONTRACT_VARIABLE_LIST,
  VARIABLE_LOG_SUPPORT_LIST,
  EXT_SUPPORT_WEB_LIST
} from '@common/constants'
import type { ContractVariableListItem } from '@common/api/types'

import {
  ContractVariableLogBtn,
  EthContractVariableLogBtn,
  ContractVariableAttributes
} from '../components'

type Inputs = {
  name?: string
  type: string
  value: string
}[]

interface RenderModalLogsState {
  chain: string
  address: string
  variableName: string
  inputs: Inputs
  implementation?: string
  returnType: string
}

const ETH_DOMAINS =
  EXT_SUPPORT_WEB_LIST.find(item => item.chain === 'eth')?.domains ?? []

export const renderModalVariableLogs = async ({
  chain,
  inputs,
  address,
  implementation,
  variableName,
  returnType
}: RenderModalLogsState) => {
  const { utc2locale } = await store.get('options')
  const rootEl = $('<div></div>')
  createRoot(rootEl[0]).render(
    <ModalContractVariableLogs
      chain={chain}
      address={address}
      implementation={implementation}
      inputs={inputs}
      variableName={variableName}
      returnType={returnType}
      utc2locale={utc2locale}
    />
  )
  $('body').append()
}

/** Strategy: ETH mainnet (updated page structure) */
const ethVariableLogsHandler = async (chain: string) => {
  const readContractIframes = $('#readcontractiframe')

  readContractIframes.each(function () {
    let executed = false
    const handleLoad = async () => {
      if (executed) return

      const mainAddress = pickAddress(window.location.pathname)
      if (!mainAddress) return

      const container = $(this)
        .contents()
        .find('#js-read-contract-function-container')
      if (!container.find('a[data-counter]').length) return

      executed = true

      const supportedVariableList: ContractVariableListItem[] = []
      const res = await chromeEvent.emit<
        typeof GET_CONTRACT_VARIABLE_LIST,
        ContractVariableListItem[]
      >(GET_CONTRACT_VARIABLE_LIST, { chain, address: mainAddress })
      if (res?.success && res?.data) {
        supportedVariableList.push(...res.data)
      }

      container
        .children('.accordion')
        // exclude private variable items injected by genContractPrivateVariables
        .filter(function () {
          return (
            $(this).find('button[data-bs-target^="#readFunction"]').length > 0
          )
        })
        .each(function () {
          const titleEl = $(this).find('.contract-fn-title')
          const titleText = titleEl.text()
          const match = titleText.match(/\d+\.\s+([^(]+)/)
          const variableName = match ? match[1].trim() : titleText

          const variable = supportedVariableList.find(
            i => i.name === variableName
          )
          if (!variable) return

          const badgeEl = $('<span></span>')[0]
          $(this).find('.contract-fn-title').after(badgeEl)
          createRoot(badgeEl).render(
            <ContractVariableAttributes
              originalText={titleText}
              visibility={variable.visibility}
              mutability={variable.mutability}
              variant="badge"
            />
          )

          const accordionBody = $(this).find('.accordion-body')
          const returnType: string[] = []
          accordionBody
            .find('div[id^="type_myanswer_"] .badge')
            .each(function () {
              returnType.push($(this).text().trim())
            })

          const queryBtn = accordionBody.find('button[id^="btn_"]')
          const rootEl = $('<span></span>')
          if (queryBtn.length) {
            rootEl.css('display', 'inline-block')
            queryBtn.after(rootEl)
          } else {
            rootEl.css('display', 'block')
            accordionBody.append(rootEl)
          }

          createRoot(rootEl[0]).render(
            <EthContractVariableLogBtn
              className={queryBtn.length ? 'ms-2' : 'mt-2'}
              onClick={errorCallback => {
                const inputs: Inputs = []
                let valid = true
                accordionBody.find('.row.g-3 .col-12').each(function () {
                  const val = $(this).find('input').val()
                  if (!val) {
                    valid = false
                    return
                  }
                  const matches = $(this)
                    .find('label')
                    .text()
                    .match(/\((.*?)\)/)
                  if (matches) {
                    inputs.push({ type: matches[1], value: val as string })
                  }
                })
                if (!valid) return errorCallback()
                renderModalVariableLogs({
                  chain,
                  address: mainAddress,
                  variableName,
                  inputs,
                  returnType: returnType.join(',')
                })
              }}
            />
          )
        })
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
const defaultVariableLogsHandler = async (chain: string) => {
  const readContractIframes = $('#readcontractiframe, #readproxycontractiframe')

  readContractIframes.each(function () {
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

      const supportedVariableList: ContractVariableListItem[] = []
      const res = await chromeEvent.emit<
        typeof GET_CONTRACT_VARIABLE_LIST,
        ContractVariableListItem[]
      >(GET_CONTRACT_VARIABLE_LIST, {
        chain,
        address: mainAddress,
        implAddress
      })
      if (res?.success && res?.data) {
        supportedVariableList.push(...res.data)
      }

      $(this)
        .contents()
        .find('#readContractAccordion .card')
        .each(function () {
          const variableNameEl = $(this).find(
            ".card-header > a[href^='#readCollapse'] > div:first-child"
          )
          const variableNameText = variableNameEl.text()
          const match = variableNameText.match(/\d+\.\s+([^(]+)/)
          const variableName = match ? match[1].trim() : variableNameText

          const variable = supportedVariableList.find(
            i => i.name === variableName
          )
          if (!variable) return

          const containerDiv = $('<div></div>')[0]
          variableNameEl.empty().append(containerDiv)
          createRoot(containerDiv).render(
            <ContractVariableAttributes
              originalText={variableNameText}
              visibility={variable.visibility}
              mutability={variable.mutability}
            />
          )

          $(this)
            .find('.collapse .card-body > form')
            .each(function () {
              const returnType: string[] = []
              $(this)
                .find('i')
                .each(function () {
                  returnType.push($(this).text().trim())
                })
              $(this)
                .find('> .form-group')
                .each(function () {
                  const queryBtn = $(this).find('button')
                  const rootEl = $('<span></span>')
                  let cls = ''
                  if (queryBtn.length) {
                    rootEl.css('display', 'inline-block')
                    cls = 'ms-2'
                    queryBtn.after(rootEl)
                  } else {
                    $(this).after(rootEl)
                  }
                  createRoot(rootEl[0]).render(
                    <ContractVariableLogBtn
                      className={cls}
                      onClick={errorCallback => {
                        const inputs: Inputs = []
                        let valid = true
                        $(this)
                          .find('.form-group label')
                          .each(function () {
                            const val = $(this).next('input').val()
                            if (!val) {
                              valid = false
                              return
                            }
                            const matches = $(this)
                              .text()
                              .match(/\((.*?)\)/)
                            if (matches) {
                              inputs.push({
                                type: matches[1],
                                value: val as string
                              })
                            }
                          })
                        if (!valid) return errorCallback()
                        renderModalVariableLogs({
                          chain,
                          address: mainAddress,
                          variableName,
                          inputs,
                          implementation: implAddress,
                          returnType: returnType.join(',')
                        })
                      }}
                    />
                  )
                })
            })
        })
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
  eth: ethVariableLogsHandler,
  default: defaultVariableLogsHandler
}

export const genContractVariableLogsBtn = async (chain: string) => {
  if (!VARIABLE_LOG_SUPPORT_LIST.includes(chain)) return
  const address = pickAddress(window.location.pathname)
  if (!address) return

  const hostname = window.location.hostname
  const strategy = ETH_DOMAINS.includes(hostname)
    ? STRATEGY_MAP.eth
    : STRATEGY_MAP.default
  return strategy(chain)
}
