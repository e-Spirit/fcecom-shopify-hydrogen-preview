import React from 'react';
import {get} from 'lodash';
import {EcomShopLink} from '../fs-link';

const FsProductFlyout = ({area}) => {
  const product = get(area, 'link.data.lt_product.value[0]', null);
  const label = get(product, 'value.label', null);
  const productId = get(product, 'value.id', null);
  const extract = get(product, 'value.extract', null);
  const image = get(product, 'value.image', null);
  const headLine = get(area, 'link.data.lt_headline', null);

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg p-4 relative">
      {/* Close button handled by parent Popover.Panel */}

      {(headLine || label) && (
        <div className="text-lg font-semibold mb-2 text-center">
          {headLine ?? label}
        </div>
      )}

      {(image || extract) && (
        <div>
          {image && (
            <img
              src={image}
              alt={label}
              className="w-full rounded-lg object-contain mb-3"
            />
          )}
          {extract && <p className="text-sm text-gray-700 mb-3">{extract}</p>}
        </div>
      )}

      <div className="flex justify-center">
        <EcomShopLink type="product" id={productId}>
          <button className="border border-gray-300 text-sm px-4 py-1 rounded hover:bg-gray-100 transition">
            Go to product
          </button>
        </EcomShopLink>
      </div>
    </div>
  );
};

export default FsProductFlyout;
