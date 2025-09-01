import React from 'react';
import {get, isEmpty} from 'lodash';
import {Popover} from '@headlessui/react';
import FsProductFlyout from '../fs-product-flyout';
import {RichText} from '../../RichText.jsx';

const createOverlayPositionData = (area, imgWidth, imgHeight) => {
  const leftTopX = get(area, ['leftTop', 'x'], 0);
  const leftTopY = get(area, ['leftTop', 'y'], 0);
  return {
    left: `${toPercentageValue(leftTopX, imgWidth)}%`,
    top: `${toPercentageValue(leftTopY, imgHeight)}%`,
  };
};

const toPercentageValue = (percent, baseValue, decimals = 2) => {
  const usedBaseValue = toIntValue(baseValue, 0);
  const usedPercentageValue = toIntValue(percent, 0);
  return usedBaseValue === 0
    ? '0'
    : ((usedPercentageValue / usedBaseValue) * 100).toFixed(decimals);
};

const toIntValue = (value, fallback = 0) => {
  let result = typeof value === 'number' ? value : null;
  if (typeof value === 'string') {
    result = parseInt(value, 10);
  }
  return result == null || Number.isNaN(result) ? fallback : result;
};

const FsInteractiveImage = ({section}) => {
  const data = section.data;
  const headline = get(data, 'st_headline');
  const text = get(data, 'st_text');
  const imgUrl = get(data, [
    'st_interactive_image',
    'media',
    'resolutions',
    'ORIGINAL',
    'url',
  ]);
  const imgAltText = get(data, 'st_image_alt_text', '');
  const pictureWidth = get(data, [
    'st_interactive_image',
    'media',
    'resolutions',
    'ORIGINAL',
    'width',
  ]);
  const pictureHeight = get(data, [
    'st_interactive_image',
    'media',
    'resolutions',
    'ORIGINAL',
    'height',
  ]);
  const areas = get(data, ['st_interactive_image', 'areas'], []);
  const hasText = headline || !isEmpty(text);

  return (
    <div
      className={`grid gap-6 ${
        hasText ? 'grid-cols-1 lg:grid-cols-[1fr_auto]' : ''
      }`}
      data-preview-id={section.previewId}
    >
      {hasText && (
        <div className="flex flex-col justify-center">
          {headline && (
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              {headline}
            </h2>
          )}
          {text && <RichText fsText={text} />}
        </div>
      )}

      <div className="flex justify-center relative">
        <div className="relative rounded-lg overflow-hidden">
          <img
            src={imgUrl}
            alt={imgAltText}
            className={`w-full h-auto ${
              hasText ? 'max-w-6xl max-h-[32rem]' : ''
            }`}
          />

          {areas.map((area, index) => {
            const pos = createOverlayPositionData(
              area,
              pictureWidth,
              pictureHeight,
            );
            return (
              <Popover
                key={index}
                className="absolute"
                style={{top: pos.top, left: pos.left, zIndex: 50}}
              >
                {({open, close}) => (
                  <>
                    <Popover.Button
                      className="h-4 w-4 rounded-full bg-pink-700/80 shadow-[0_0_0_6px_rgba(186,0,101,0.3),0_0_0_15px_rgba(186,0,101,0.3)] animate-spin-slow focus:outline-none"
                      aria-label="Open product info"
                    />

                    {open && (
                      <Popover.Panel static className="absolute mt-2 w-80">
                        <div className="relative">
                          {/* Close Button */}
                          <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl leading-none"
                            onClick={close}
                            aria-label="Close product info"
                          >
                            ×
                          </button>

                          <FsProductFlyout area={area} />
                        </div>
                      </Popover.Panel>
                    )}
                  </>
                )}
              </Popover>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FsInteractiveImage;
