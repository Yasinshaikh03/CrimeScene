import React from 'react'
import { AlertCircleIcon, CloseIcon, RefreshIcon } from '../../../components/common/Icons'

interface ErrorMessageProps {
  message: string
  onDismiss: () => void
  onRetry?: () => void
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onDismiss,
  onRetry
}) => {
  return (
    <div className="error-banner glass-panel">
      <div className="error-icon-wrap">
        <AlertCircleIcon size={20} />
      </div>

      <div className="error-content">
        <h5 className="error-title">Analysis Issue</h5>
        <p className="error-text">{message}</p>
      </div>

      <div className="error-actions">
        {onRetry && (
          <button type="button" className="error-btn retry" onClick={onRetry}>
            <RefreshIcon size={14} />
            <span>Retry</span>
          </button>
        )}
        <button type="button" className="error-btn dismiss" onClick={onDismiss} aria-label="Dismiss">
          <CloseIcon size={16} />
        </button>
      </div>
    </div>
  )
}
