import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useRecoilState, useResetRecoilState} from 'recoil';

import {ecomMessageOverlayAtomic} from '../../contexts/state/atoms';
export const DynamicFormattedMessage = (props) => (
  <FormattedMessage {...props} />
);

export const EcomActionOverlay = () => {
  const [{isOpen, messageId, defaultMessage}] = useRecoilState(
    ecomMessageOverlayAtomic,
  );
  const resetOverlay = useResetRecoilState(ecomMessageOverlayAtomic);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={resetOverlay}
        className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Content */}
        <div
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        >
          <div className="flex items-center justify-center space-x-6 w-full">
            <p className="text-xl font-semibold text-center flex-1">
              <DynamicFormattedMessage
                defaultMessage={defaultMessage}
                id={messageId}
              />
            </p>
            <svg
              className="animate-spin h-6 w-6 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-label="Loading spinner"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};
