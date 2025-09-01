/**
 * === CFC ===
 * Component to display images as a banner.
 */

/** CFC Start **/
import React from 'react';

import {Box} from '../../Box';
import {Heading, Text} from '../../Text';
import {EcomLinkOverlay} from '../fs-link/index.jsx';

const LEFT = 'left';
const CENTER = 'center';
const RIGHT = 'right';
const BG_DARK = 'black';
const BG_LIGHT = 'white';
const TEXT_DARK = 'black';
const TEXT_LIGHT = 'white';

let textPosition, textColor, bgColor;

const setVariant = (variant) => {
  switch (variant) {
    case 'left-light':
      textPosition = LEFT;
      textColor = TEXT_DARK;
      bgColor = BG_LIGHT;
      break;
    case 'center-dark':
      textPosition = CENTER;
      textColor = TEXT_LIGHT;
      bgColor = BG_DARK;
      break;
    case 'center-light':
      textPosition = CENTER;
      textColor = TEXT_DARK;
      bgColor = BG_LIGHT;
      break;
    case 'right-dark':
      textPosition = RIGHT;
      textColor = TEXT_LIGHT;
      bgColor = BG_DARK;
      break;
    case 'right-light':
      textPosition = RIGHT;
      textColor = TEXT_DARK;
      bgColor = BG_LIGHT;
      break;
    default:
      textPosition = LEFT;
      textColor = TEXT_LIGHT;
      bgColor = BG_DARK;
      break;
  }
};

const FsBanner = ({section}) => {
  const data = section.data;
  const imgUrl = data.st_image?.resolutions?.['16x9_L']?.url;

  setVariant(data.st_variant?.key);

  return (
    <EcomLinkOverlay fsLink={data.st_link}>
      <Box
        data-preview-id={section.previewId}
        className="block relative py-32 min-h-[400px] rounded-lg overflow-hidden"
        style={{
          backgroundImage: `url(${imgUrl})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
        title={data.st_image_alt_text ?? ''}
      >
        {(data.st_title || data.st_subtitle) && (
          <Box
            className={`
            ${bgColor === 'black' ? 'bg-black' : 'bg-white'}
            ${textColor === 'black' ? 'text-black' : 'text-white'}
            ${
              textPosition === 'left'
                ? 'text-left'
                : textPosition === 'center'
                ? 'text-center'
                : 'text-right'
            }
            opacity-60 py-5 px-20 mx-auto
          `}
          >
            {data.st_title && (
              <Heading as={'h1'} className="mb-4 opacity-100">
                {data.st_title}
              </Heading>
            )}
            {data.st_subtitle && (
              <Text className="opacity-100">{data.st_subtitle}</Text>
            )}
          </Box>
        )}
      </Box>
    </EcomLinkOverlay>
  );
};

export default FsBanner;
/** CFC End **/
