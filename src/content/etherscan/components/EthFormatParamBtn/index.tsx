import cls from 'classnames'
import { type FC, useState } from 'react'

import styles from './index.module.less'

interface Props {
  onClick: () => void
}

const EthFormatParamBtn: FC<Props> = ({ onClick }) => {
  const [formatted, setFormatted] = useState(false)

  const onFormat = () => {
    onClick()
    setFormatted(true)
    setTimeout(() => {
      setFormatted(false)
    }, 2000)
  }

  return (
    <span
      className={cls(styles.ethFormatParamBtn, 'btn badge btn-sm')}
      data-bs-toggle="tooltip"
      title="Quick format parameters"
      onClick={onFormat}
    >
      {formatted ? (
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.5 5L3.8 7.5L8.5 2"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 8.5L5.8 4.7"
            stroke="white"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path d="M5.8 4.7L7.8 1.5L9 2.7L5.8 4.7Z" fill="white" />
          <circle cx="1.2" cy="4.5" r="0.9" fill="white" />
          <circle cx="5" cy="1.2" r="0.9" fill="white" />
          <circle cx="9" cy="6.5" r="0.9" fill="white" />
        </svg>
      )}
    </span>
  )
}

export default EthFormatParamBtn
