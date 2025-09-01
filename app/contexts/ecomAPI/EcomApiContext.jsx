/**
 * === CFC ===
 * Context provider for the Frontend API.
 */

/** CFC Start **/
import React, {useContext, useEffect, useMemo, useState} from 'react';
import {useResetRecoilState, useSetRecoilState} from 'recoil';
import {useLocation} from '@remix-run/react';

import {ecomApiAtomic, ecomMessageOverlayAtomic} from '../state/atoms';
import {
  bumpRevision,
  ecomExtraMenuRevisionAtomic,
  ecomNavigationRevisionAtomic,
  ecomPageRevisionAtomic,
} from '../state/revisions';
import {EcomAction} from '../EcomAction.jsx';

import {EcomNavigationProvider} from './EcomNavigation.jsx';

export const EcomApiContext = React.createContext();

export const EcomApiProvider = ({children, locale}) => {
  const [ecomApiClient, setEcomApiClient] = useState(null);
  const [ecomHooks, setEcomHooks] = useState(null);
  const [, setIsClient] = useState(false);
  const setEcomApi = useSetRecoilState(ecomApiAtomic);

  const updateNavigation = useSetRecoilState(ecomNavigationRevisionAtomic);
  const updatePage = useSetRecoilState(ecomPageRevisionAtomic);
  const updateExtraMenu = useSetRecoilState(ecomExtraMenuRevisionAtomic);

  // Overlay
  const setOverlay = useSetRecoilState(ecomMessageOverlayAtomic);
  const resetOverlay = useResetRecoilState(ecomMessageOverlayAtomic);
  const openOverlay = ({messageId, defaultMessage}) =>
    setOverlay(() => ({messageId, defaultMessage, isOpen: true}));

  const ECOM_API_URL = import.meta.env.VITE_ECOM_API_URL;
  // Log level needs to be a number to enable dev mode.
  const LOG_LEVEL = Number(import.meta.env.VITE_LOG_LEVEL) ?? 0; // DEBUG = 0, INFO = 1, WARNING = 2, ERROR = 3, NONE = 4
  const ECOM_API_LOCALE = import.meta.env.VITE_ECOM_API_LOCALE;

  const location = useLocation();

  // Client-side only initialization of EcomApi
  useEffect(() => {
    setIsClient(true);

    // Dynamic import to avoid SSR issues
    import('fcecom-frontend-api-client').then(({EcomApi, EcomHooks}) => {
      const apiClient = new EcomApi(ECOM_API_URL, LOG_LEVEL);
      setEcomApiClient(apiClient);
      setEcomHooks(EcomHooks);
    });
  }, [ECOM_API_URL, LOG_LEVEL]);

  const ecomApi = useMemo(() => ecomApiClient, [ecomApiClient]);

  /**
   * It is recommended to update the page on every navigation.
   * This ensures that no cached version of the page is presented.
   */
  useEffect(() => {
    updatePage(bumpRevision);
  }, [location]);

  const registerPageUpdateHooks = () => {
    if (!ecomApi || !ecomHooks) return;

    // Page-Update-Hooks
    const pageUpdateHooks = [
      ecomHooks.CONTENT_CHANGED,
      ecomHooks.SECTION_CREATED,
      ecomHooks.SECTION_CREATION_CANCELLED,
      ecomHooks.ENSURED_PAGE_EXISTS,
      ecomHooks.RERENDER_VIEW,
    ];

    pageUpdateHooks.forEach((hook) => {
      ecomApi.addHook(hook, () => updatePage(bumpRevision));
    });
  };

  const registerMenuUpdateHooks = () => {
    if (!ecomApi || !ecomHooks) return;

    // Navigation-Update
    ecomApi.addHook(ecomHooks.CONTENT_CHANGED, () =>
      updateNavigation(bumpRevision),
    );

    // Extra-Menü-Update
    ecomApi.addHook(ecomHooks.CONTENT_CHANGED, () =>
      updateExtraMenu(bumpRevision),
    );
  };

  const registerOverlayHooks = () => {
    if (!ecomApi || !ecomHooks) return;

    // 2. Overlay-Management
    let timeout;

    const closeOverlay = () => {
      resetOverlay();
      clearTimeout(timeout);
    };

    const showPageCreatingOverlay = () => {
      timeout = setTimeout(() => {
        openOverlay(EcomAction.PAGE_CREATING);
      }, 150);
    };

    // Overlay-Hook-Registrierung
    ecomApi.addHook(ecomHooks.PAGE_CREATING, showPageCreatingOverlay);

    const overlayCloseHooks = [
      ecomHooks.SECTION_CREATED,
      ecomHooks.SECTION_CREATION_CANCELLED,
      ecomHooks.ENSURED_PAGE_EXISTS,
      ecomHooks.PAGE_CREATION_FAILED,
    ];

    overlayCloseHooks.forEach((hook) => {
      ecomApi.addHook(hook, closeOverlay);
    });
  };

  // 1. Gruppiere Hooks nach Funktionalität
  const registerPreviewHooks = () => {
    registerPageUpdateHooks();
    registerMenuUpdateHooks();
    registerOverlayHooks();
  };

  useEffect(() => {
    if (!ecomApi || !ecomHooks) return;

    ecomApi.setDefaultLocale(ECOM_API_LOCALE);

    const registerHooks = (isPreview) => {
      // Reload page when Shared Preview was started or closed
      ecomApi.addHook(ecomHooks.START_SHARED_PREVIEW, () =>
        updatePage(bumpRevision),
      );
      ecomApi.addHook(ecomHooks.END_SHARED_PREVIEW, () =>
        updatePage(bumpRevision),
      );

      isPreview && registerPreviewHooks();
    };

    ecomApi.init().then((isPreview) => {
      // DEBUG = 0, INFO = 1, WARNING = 2, ERROR = 3, NONE = 4
      const logLevel = LOG_LEVEL ?? 1;
      const devMode = logLevel === 0;

      setEcomApi({ecomApi, isPreview, logLevel, devMode});

      registerHooks(isPreview);
    });
  }, [ecomApi, ecomHooks, ECOM_API_LOCALE, LOG_LEVEL]);

  useEffect(() => {
    // Reset overlay when location changes
    const timeout = setTimeout(resetOverlay, 1000);

    return () => {
      clearTimeout(timeout);
      resetOverlay();
    };
  }, [location, resetOverlay]);

  return (
    <EcomNavigationProvider locale={locale} value={{updatePage}}>
      {children}
    </EcomNavigationProvider>
  );
};

export const useEcomApi = () => useContext(EcomApiContext);
/** CFC End **/
