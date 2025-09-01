import React, {useEffect, useState} from 'react';
import ReactPlayer from 'react-player';
import {get, isEmpty, maxBy, sortBy} from 'lodash';
import {Link} from '@remix-run/react';

import {useEcomNavigation} from '../../../contexts/ecomAPI/EcomNavigation';
import {RichText} from '../../RichText';

const FsProductCatalogEntry = ({catalog}) => {
  const product = get(catalog, 'data.st_product.value[0].value');
  const {id, label, extract, image} = product;

  return (
    <div className="flex flex-col justify-center h-full p-2">
      <h2 className="text-xl text-gray-400 font-bold">
        {label ?? 'Related Product'}
      </h2>
      {extract && <p className="text-base mt-2">{extract}</p>}
      {image && (
        <div className="mt-4 flex justify-center items-center">
          <img
            src={image}
            alt={label}
            className="max-h-48 max-w-lg rounded-lg"
          />
        </div>
      )}
      {id && (
        <Link
          to={`/product/${id}`}
          className="mt-4 text-sm py-2 rounded hover:bg-gray-100"
        >
          Go to product
        </Link>
      )}
    </div>
  );
};

const FsInteractiveVideoItem = ({catalog}) => {
  const heading = get(catalog, 'data.st_headline');
  const text = get(catalog, 'data.st_text', []);
  const image = get(catalog, 'data.st_image.resolutions.4x3_M.url');
  const alt = get(catalog, 'data.st_image.description');
  const {resolveReference} = useEcomNavigation();
  const linkTarget = resolveReference(get(catalog, 'data.st_link'));

  return (
    <div className="flex flex-col justify-center h-full p-4 overflow-auto">
      {heading && (
        <h2 className="text-xl text-gray-400 font-bold">{heading}</h2>
      )}
      <RichText fsText={text} />
      {image ? (
        <div className="mt-4 flex justify-center items-center">
          <img src={image} alt={alt} className="max-h-48 max-w-lg rounded-lg" />
        </div>
      ) : (
        <div className="mt-4 text-base text-gray-400">No image available</div>
      )}
      {linkTarget && (
        <Link
          to={linkTarget}
          className="mt-4 py-2 text-sm rounded-lg hover:bg-gray-100"
        >
          Go to detail page
        </Link>
      )}
    </div>
  );
};

const FsAdditionalContentEntry = ({catalog}) => {
  const image = get(catalog, 'data.st_picture');
  //const text = get(catalog, 'data.st_text');
  const text = get(catalog, 'data.st_text');

  return (
    <div className="flex flex-col justify-center h-full p-4">
      {image && (
        <div className="flex justify-center items-center">
          <img
            src={get(image, 'resolutions.4x3_M.url')}
            alt={get(image, 'description')}
            className="max-h-48 max-w-lg rounded-lg"
          />
        </div>
      )}
      {text && (
        <div className="mt-4">
          <RichText fsText={text} />
        </div>
      )}
    </div>
  );
};

const FsExtraContentDecider = ({catalog}) => {
  if (isEmpty(catalog)) {
    return null;
  }
  switch (catalog.sectionType) {
    case 'interactive_video_item':
      return <FsInteractiveVideoItem catalog={catalog} />;
    case 'interactive_video_product_item':
      return (
        <div className="flex flex-col h-full overflow-auto p-4 space-y-4">
          <FsProductCatalogEntry catalog={catalog} />
          <FsAdditionalContentEntry catalog={catalog} />
        </div>
      );
    default:
      return null;
  }
};

const FsInteractiveVideo = ({section}) => {
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [catalog, setCatalog] = useState(get(section, 'data.st_catalog[0]'));
  const [isOpen, setIsOpen] = useState(false);

  const youtubeId = get(section, 'data.st_youtubeVideo.value[0].identifier');
  const titleFallback = get(
    section,
    'data.st_youtubeVideo.value[0].value.title',
  );
  const sortedCatalog = sortBy(section.data?.st_catalog, (o) =>
    get(o, 'data.st_time'),
  );
  const autoplay = section?.data?.st_autoPlay || false;

  const gap = (seconds) => (catalog) => {
    const nextIndex = sortedCatalog.indexOf(catalog) + 1;
    const nextStart = get(sortedCatalog, `[${nextIndex}].data.st_time`, 43200);
    return (
      nextStart > currentSeconds &&
      (currentSeconds <= nextStart - seconds || currentSeconds >= nextStart)
    );
  };

  useEffect(() => {
    const validCatalogs = sortedCatalog
      .filter((catalog) => catalog.data.st_time < currentSeconds)
      .filter(gap(0.25));
    if (isEmpty(validCatalogs)) {
      setIsOpen(false);
      return;
    }
    setCatalog(maxBy(validCatalogs, (o) => get(o, 'data.st_time')));
    setIsOpen(true);
  }, [currentSeconds]);

  return youtubeId ? (
    <div data-preview-id={section?.previewId} key={section?.id}>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="relative w-full aspect-video lg:h-[480px]">
            <ReactPlayer
              width="100%"
              height="100%"
              className="absolute top-0 left-0"
              muted={autoplay}
              loop={false}
              controls
              playing={autoplay}
              url={`https://www.youtube.com/watch?v=${youtubeId}`}
              onProgress={({playedSeconds}) => setCurrentSeconds(playedSeconds)}
              config={{
                youtube: {
                  embedOptions: {
                    allow: 'autoplay; encrypted-media',
                    allowFullScreen: true,
                  },
                },
              }}
              key={section?.id}
            />
          </div>
        </div>

        {isOpen && (
          <div className="w-full lg:w-[360px] lg:h-[480px] text-gray-400 overflow-hidden">
            <FsExtraContentDecider catalog={catalog} />
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-xl text-gray-200 font-bold mb-4">
        {titleFallback || 'Interactive Video'}
      </h2>
      <p className="text-base text-gray-400">No video available</p>
    </div>
  );
};

export default FsInteractiveVideo;
