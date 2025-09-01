import React from 'react';
import {get} from 'lodash';
import {RichText} from '../../RichText.jsx';
import {EcomShopLink} from '../fs-link';

const FsFeaturedProducts = ({section}) => {
  const data = section.data;
  const products = data.st_products;
  const headline = data.st_headline;
  const fsText = get(section, 'data.st_text');

  return (
    <div
      data-preview-id={section.previewId}
      className="relative block pt-5 overflow-hidden"
    >
      <h2 className="text-4xl text-center font-bold">{headline}</h2>

      <div className="text-center mx-20 my-4">
        <RichText fsText={fsText} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 my-5">
        {products.value?.map((product) => {
          const {image, id, extract, label} = product.value;

          return (
            <div
              key={id}
              className="group cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
            >
              <EcomShopLink type="product" id={id}>
                <img
                  src={image}
                  alt={label}
                  className="h-[400px] w-full object-contain rounded-lg"
                />
                <h3 className="text-xl font-semibold text-center mt-5 mb-2 px-4">
                  {label}
                </h3>
                <p className="text-base px-5">{extract}</p>
              </EcomShopLink>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FsFeaturedProducts;
