/**
 * === CFC ===
 * Tailwind component to display various link types.
 */

import React, {useEffect, useState} from 'react';
import {Link as RouteLink} from '@remix-run/react';
import {useRecoilValue} from 'recoil';

import {useEcomNavigation} from '../../../contexts/ecomAPI/EcomNavigation';
import {getHandleById} from '../../../utils/fetchHandle.js';
import {ecomLanguageAtomic} from '../../../contexts/state/atoms.js';

export const EcomLinkOverlay = ({
  fsLink,
  children,
  fallbackToChildren = true,
}) => {
  const {resolveReference} = useEcomNavigation();
  const link = resolveReference(fsLink);

  if (!link && fallbackToChildren) {
    return children;
  }

  switch (fsLink?.template) {
    case 'external_link':
      return (
        <a href={link} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    default:
      return <RouteLink to={link}>{children}</RouteLink>;
  }
};

export const EcomShopLink = ({id, type, children}) => {
  const {sf} = useRecoilValue(ecomLanguageAtomic);
  const {buildLocaleUrl} = useEcomNavigation();

  const [link, setLink] = useState(null);

  useEffect(() => {
    const fetchHandle = async () => {
      try {
        const handle = await getHandleById(id, type);

        if (handle) {
          const pathMap = {
            product: `/products/${handle}`,
            category: `/collections/${handle}`,
            content: `/pages/${handle}`,
          };

          const path = pathMap[type];
          const localizedUrl = buildLocaleUrl(sf, path);

          setLink(localizedUrl);
        }
      } catch (error) {
        console.error('Error generating the localized URL:', error);
        setLink(null);
      }
    };
    fetchHandle();
  }, [id, type, buildLocaleUrl, sf]);

  return <RouteLink to={link}>{children}</RouteLink>;
};
