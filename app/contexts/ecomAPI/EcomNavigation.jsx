/**
 * === CFC ===
 * Context provider for the navigation.
 */

/** CFC Start **/
import React, {useCallback, useContext, useEffect} from 'react';
import {EcomHooks} from 'fcecom-frontend-api-client';
import {
  useRecoilState,
  useRecoilValueLoadable,
  useSetRecoilState,
} from 'recoil';
import {get} from 'lodash';
import {useNavigate} from '@remix-run/react';

import {
  ecomApiAtomic,
  ecomLanguageAtomic,
  ecomMessageOverlayAtomic,
  ecomNavigationFamily,
} from '../state/atoms';
import {fibonacci} from '../../utils/sleep';
import {bumpRevision, ecomNavigationRevisionAtomic} from '../state/revisions';
import {toFSLocale, toSfLocale} from '../../utils/locale';
import {getHandleById} from '../../utils/fetchHandle.js';

export const EcomNavigation = React.createContext();

export const EcomNavigationProvider = ({children, locale}) => {
  const navigate = useNavigate();

  // Ecom API
  const {
    contents: {ecomApi, isPreview},
  } = useRecoilValueLoadable(ecomApiAtomic);
  const {contents: navigation, state} = useRecoilValueLoadable(
    ecomNavigationFamily(),
  );
  const updateNavigation = useSetRecoilState(ecomNavigationRevisionAtomic);

  // Localization
  const [{sf: sfState}, setLocale] = useRecoilState(ecomLanguageAtomic);
  const ECOM_API_LOCALE = import.meta.env.VITE_ECOM_API_LOCALE;

  // Overlay
  const setOverlay = useSetRecoilState(ecomMessageOverlayAtomic);
  const openOverlay = ({messageId, defaultMessage}) =>
    setOverlay(() => ({messageId, defaultMessage, isOpen: true}));

  useEffect(() => {
    if (locale) {
      const formattedLocale = `${locale.language.toLowerCase()}-${locale.country.toLowerCase()}`;
      setLocale(() => ({
        fs: toFSLocale(formattedLocale) ?? ECOM_API_LOCALE,
        sf: formattedLocale ?? toSfLocale(ECOM_API_LOCALE),
      }));
      updateNavigation(bumpRevision);
    }
  }, [locale]);

  // Localized URL builder
  const buildLocaleUrl = (locale, path) => {
    if (!locale || locale === 'en-gb') {
      return path;
    }
    return `/${locale}${path.startsWith('/') ? path : '/' + path}`;
  };

  // Extracts a navigable link from FS link data
  const resolveReference = useCallback(
    async (linkData) => {
      if (!linkData) {
        return null;
      }

      const {type, referenceType, referenceId} = linkData;
      if (type === 'Reference' && referenceType === 'PageRef') {
        return getSeoUrl(referenceId);
      }

      const template = get(linkData, 'template', null);

      switch (template) {
        case 'external_link':
        case 'dom_external_link':
          return get(linkData, 'data.lt_linkUrl', null);
        case 'internal_link':
        case 'dom_internal_link':
          return getSeoUrl(get(linkData, 'data.lt_pageref.referenceId', null));
        case 'content_link':
        case 'dom_content_link':
          return getSeoUrl(get(linkData, 'data.lt_pageref.referenceId', null));
        case 'category_link':
        case 'dom_category_link':
          const categoryId = get(
            linkData,
            'data.lt_category.value[0].identifier',
          );

          try {
            const handle = await getHandleById(categoryId, 'category');
            const path = `/collections/${handle}`;
            return buildLocaleUrl(sfState, path);
          } catch (error) {
            console.error(`Failed to retrieve handle for category:`, error);
            return `/collections/${categoryId}`;
          }
        case 'product_link':
        case 'dom_product_link':
          const productId = get(
            linkData,
            'data.lt_product.value[0].identifier',
          );

          try {
            const handle = await getHandleById(productId, 'product');
            const path = `/products/${handle}`;
            return buildLocaleUrl(sfState, path);
          } catch (error) {
            console.error(`Failed to retrieve handle for product:`, error);
            return `/products/${productId}`;
          }
        case 'cta_link':
          return await resolveReference(get(linkData, `data.lt_link`));
        default:
          return null;
      }
    },
    [navigation],
  );

  // Get seo url from the navigations idMap
  const getSeoUrl = (pageRefUid) => {
    if (pageRefUid) {
      const navigationElement = navigation?.idMap?.[pageRefUid];
      return getSeoUrlFromNavigationElement(navigationElement);
    }
    return null;
  };

  // Get a localized seo url for pageRefUid
  const getLocalizedSeoUrl = async (pageRefUid, locale) => {
    if (pageRefUid && locale) {
      const navigation = await getLocalizedNavigation(locale);
      const navigationElement = navigation?.idMap?.[pageRefUid];
      return getSeoUrlFromNavigationElement(navigationElement);
    }
    return null;
  };

  // Get seo url from the given navigationElement
  const getSeoUrlFromNavigationElement = (navigationElement) => {
    if (navigationElement) {
      if (navigationElement?.customData?.pageTemplate === 'homepage') {
        return '/';
      }

      const seoUrl = navigationElement?.seoRoute;
      return seoUrl ? seoUrl.replace('.json', '') : null;
    }
    return null;
  };

  const getLocalizedNavigation = async (locale) => {
    const navigation = await ecomApi?.fetchNavigation({
      initialPath: '/',
      locale,
    });
    if (navigation) {
      return navigation;
    }
    return null;
  };

  const pollNavigationElement = useCallback(
    async (id, fs) => {
      if (!ecomApi) {
        return;
      }

      return await new Promise((resolve, reject) => {
        const MAX_TRIES = 5;
        const wait = (tries) => fibonacci(tries) * 250;

        const getNavigationElement = async (tries = 1) => {
          const navigation = await ecomApi?.fetchNavigation({
            initialPath: '/',
            locale: fs,
          });
          return await new Promise(() => {
            const navigationElement = navigation.idMap[id];
            if (navigationElement) {
              updateNavigation(bumpRevision);
              return resolve(navigationElement);
            }

            if (tries >= MAX_TRIES) {
              return reject(
                `Navigation Element ${id} does not exist after ${tries} tries`,
              );
            } else {
              setTimeout(
                () => getNavigationElement(tries + 1).then(),
                wait(tries),
              );
            }
          });
        };

        getNavigationElement();
      });
    },
    [ecomApi, updateNavigation],
  );

  // Hilfsfunktion zur Navigation basierend auf Pfad
  const navigateToPath = useCallback(
    (path, targetLocale) => {
      if (!path) {
        return;
      }

      const targetUrl = buildLocaleUrl(targetLocale, path);
      if (sfState !== targetLocale) {
        window.location = targetUrl;
      } else {
        navigate(targetUrl);
      }
    },
    [sfState, navigate, buildLocaleUrl],
  );

  // Hilfsfunktion für Sprachwechsel
  const handleLocaleChange = useCallback(
    (newLocale) => {
      if (sfState !== newLocale) {
        openOverlay({
          messageId: 'CHANGE_LANGUAGE',
          defaultMessage: 'Changing language...',
        });
        setLocale(() => ({
          fs: toFSLocale(newLocale),
          sf: newLocale,
        }));
      }
    },
    [sfState, setLocale, openOverlay],
  );

  // Hilfsfunktion für Navigation basierend auf Seitentyp
  const navigateByPageTemplate = useCallback(
    (pageTemplate, navigationElement, handle, targetLocale) => {
      switch (pageTemplate) {
        case 'homepage':
          navigateToPath(`/`, targetLocale);
          break;
        case 'landingpage':
        case 'contentpage':
          navigateToPath(
            getSeoUrlFromNavigationElement(navigationElement),
            targetLocale,
          );
          break;
        case 'product':
          navigateToPath(`/products/${handle}`, targetLocale);
          break;
        case 'category':
          navigateToPath(`/collections/${handle}`, targetLocale);
          break;
        default:
          break;
      }
    },
    [navigateToPath],
  );

  // Handler für Preview-Element-Anfragen
  const requestPreviewElement = useCallback(
    async ({previewId}) => {
      const [id, fs] = previewId.split('.');
      const sf = toSfLocale(fs);

      // Locale wechseln wenn nötig
      handleLocaleChange(sf);

      // Navigation-Element abrufen
      const navigationElement = await pollNavigationElement(id, fs);
      if (!navigationElement) {
        return;
      }

      const customData = navigationElement?.customData;
      const pageTemplate = customData?.pageTemplate;
      const ecomShopId = customData?.ecomShopId;

      // Handle für Produkte oder Kategorien abrufen
      let handle = null;
      if (pageTemplate === 'product' || pageTemplate === 'category') {
        handle = await getHandleById(ecomShopId, pageTemplate);
      }

      // Zur entsprechenden Seite navigieren
      navigateByPageTemplate(pageTemplate, navigationElement, handle, sf);
    },
    [handleLocaleChange, pollNavigationElement, navigateByPageTemplate],
  );

  // Handler für Storefront-URL-Öffnung
  const openStorefrontUrl = useCallback(
    async (params) => {
      const {id, type} = params;

      if (
        id &&
        id !== 'homepage' &&
        (type === 'product' || type === 'category' || type === 'content')
      ) {
        const handle = await getHandleById(id, type);

        if (handle) {
          const pathMap = {
            product: `/products/${handle}`,
            category: `/collections/${handle}`,
            content: `/pages/${handle}`,
          };

          navigateToPath(pathMap[type], sfState);
        }
      }
    },
    [navigateToPath, sfState],
  );

  // Hook-Registrierung und -Verwaltung
  useEffect(() => {
    if (isPreview && ecomApi && state === 'hasValue' && navigation) {
      // Hooks registrieren
      ecomApi.addHook(EcomHooks.OPEN_STOREFRONT_URL, openStorefrontUrl);
      ecomApi.addHook(EcomHooks.REQUEST_PREVIEW_ELEMENT, requestPreviewElement);
      ecomApi.addHook(EcomHooks.PAGE_CREATED, requestPreviewElement);

      // Aufräumen beim Unmounting
      return () => {
        ecomApi.removeHook(EcomHooks.OPEN_STOREFRONT_URL, openStorefrontUrl);
        ecomApi.removeHook(
          EcomHooks.REQUEST_PREVIEW_ELEMENT,
          requestPreviewElement,
        );
        ecomApi.removeHook(EcomHooks.PAGE_CREATED, requestPreviewElement);
      };
    }
  }, [
    ecomApi,
    state,
    isPreview,
    navigation,
    requestPreviewElement,
    openStorefrontUrl,
  ]);

  return (
    <EcomNavigation.Provider
      value={{navigation, resolveReference, getLocalizedSeoUrl, buildLocaleUrl}}
    >
      {children}
    </EcomNavigation.Provider>
  );
};

export const useEcomNavigation = () => useContext(EcomNavigation);
/** CFC End **/
