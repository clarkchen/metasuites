import React from 'react'

import {
  ContractVariableVisibility,
  ContractVariableMutability
} from '@common/constants'
import { IconMetaDock } from '@common/components'

interface ContractVariableAttributesProps {
  originalText: string
  visibility: ContractVariableVisibility
  mutability: ContractVariableMutability
  variant?: 'inline' | 'badge'
}

const ContractVariableAttributes: React.FC<ContractVariableAttributesProps> = ({
  originalText,
  visibility,
  mutability,
  variant = 'inline'
}) => {
  const label = `${
    visibility === ContractVariableVisibility.PRIVATE ? 'Private' : 'Public'
  }${
    mutability === ContractVariableMutability.IMMUTABLE ? ' Immutable' : ''
  } Variable`

  if (variant === 'badge') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}
        className="badge bg-light border border-dark border-opacity-10 text-dark fw-normal py-1.5"
      >
        <IconMetaDock size={12} />
        {label}
      </span>
    )
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      <span>{originalText}</span>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          marginLeft: '0.25rem'
        }}
      >
        <span>(</span>
        <IconMetaDock size={12} />
        <span>{label}</span>
        <span>)</span>
      </span>
    </div>
  )
}

export default ContractVariableAttributes
