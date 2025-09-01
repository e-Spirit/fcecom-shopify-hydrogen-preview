import React, {useEffect, useCallback, useState} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {ChevronLeftIcon, ChevronRightIcon} from '@heroicons/react/24/solid';
import {get} from 'lodash';

import FsBanner from '../fs-banner';

const FsCarousel = ({section}) => {
  const data = section.data;
  const autoplay = !!data.st_autoplay?.key;
  const autoplayInterval = get(data, ['st_autoplay', 'key'], 3000);
  const items = get(data, 'st_items', []);

  const [emblaRef, emblaApi] = useEmblaCarousel({loop: true});
  const [, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const onSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi]);

  useEffect(() => {
    if (!autoplay || !emblaApi) {
      return;
    }

    const interval = setInterval(() => {
      if (!emblaApi) {
        return;
      }
      emblaApi.scrollNext();
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [autoplay, autoplayInterval, emblaApi]);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

  return items.length > 0 ? (
    <div
      className="relative w-full overflow-hidden"
      data-preview-id={section.previewId}
    >
      <div className="embla" ref={emblaRef}>
        <div className="flex">
          {items.map((item, idx) => (
            <div className="flex-[0_0_100%] min-w-0" key={idx}>
              <FsBanner section={item} />
            </div>
          ))}
        </div>
      </div>

      {items.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-transparent p-2 z-10"
            aria-label="Previous"
          >
            <ChevronLeftIcon className="h-10 w-10 text-gray-700" />
          </button>

          <button
            onClick={scrollNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent p-2 z-10"
            aria-label="Next"
          >
            <ChevronRightIcon className="h-10 w-10 text-gray-700" />
          </button>
        </>
      )}
    </div>
  ) : (
    <div className="w-full h-64 flex items-center justify-center">
      <p className="text-gray-500">No items available</p>
    </div>
  );
};

export default FsCarousel;
