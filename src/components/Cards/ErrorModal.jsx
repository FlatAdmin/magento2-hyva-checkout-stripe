import React from 'react';
import PropTypes from 'prop-types';
import { __ } from '@hyva/react-checkout/i18n';

function ErrorModal({ isOpen, errorMessage, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop - no click handler since we always require confirmation */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
        }}
        role="presentation"
      />

      {/* Modal */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow:
            '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          maxWidth: '28rem',
          width: '100%',
          margin: '0 1rem',
          overflow: 'hidden',
        }}
      >
        {/* Header with error icon */}
        <div
          style={{
            background: 'linear-gradient(to right, #ef4444, #dc2626)',
            padding: '1.25rem 1.5rem',
          }}
        >
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <div style={{ flexShrink: 0 }}>
              <svg
                style={{ height: '2rem', width: '2rem', color: '#ffffff' }}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#ffffff',
                margin: 0,
              }}
            >
              {__('Order Could Not Be Completed')}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <p
            style={{
              color: '#374151',
              fontSize: '1rem',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {errorMessage}
          </p>
          <p
            style={{
              marginTop: '1rem',
              color: '#6b7280',
              fontSize: '0.875rem',
              marginBottom: 0,
            }}
          >
            {__(
              'Please return to the pricing page to select a new plan and try again.'
            )}
          </p>
        </div>

        {/* Footer with button */}
        <div
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#f9fafb',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '0.75rem 2rem',
              color: '#ffffff',
              background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            {__('Go to Pricing')}
          </button>
        </div>
      </div>
    </div>
  );
}

ErrorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
};

ErrorModal.defaultProps = {
  errorMessage: '',
};

export default ErrorModal;
