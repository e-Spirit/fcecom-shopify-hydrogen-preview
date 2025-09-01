import React from 'react';
import {get} from 'lodash';
import {RichText} from '../../RichText.jsx';

export const FsTextImage = ({section}) => {
  const isImageRight =
    get(section, 'data.st_variant.identifier') === 'image-right';
  const imageOrder = isImageRight ? 'order-2' : 'order-1';
  const textOrder = isImageRight ? 'order-1' : 'order-2';
  const imageMargin = isImageRight ? 'ml-auto' : 'mr-auto';

  const imageSrc = get(section, 'data.st_image.resolutions.4x3_M.url');
  const altText = get(section, 'data.st_image_alt_text');
  const headline = get(section, 'data.st_headline');
  const fsText = get(section, 'data.st_text');

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[30px]"
      data-preview-id={get(section, 'previewId')}
    >
      <div className={`w-full flex flex-col justify-center ${imageOrder}`}>
        <img
          src={imageSrc}
          alt={altText}
          className={`max-h-72 max-w-5xl rounded-lg ${imageMargin}`}
        />
      </div>
      <div className={`w-full flex flex-col justify-center ${textOrder}`}>
        <div>
          {headline && (
            <h2 className="text-4xl text-gray-200 font-bold mb-4">
              {headline}
            </h2>
          )}
          {fsText && <RichText fsText={fsText} />}
        </div>
      </div>
    </div>
  );
};

export default FsTextImage;
