/**
 * === CFC ===
 * Define atomics that are used with Recoil:
 * - ecom-api for the config
 * - ecom-language for the FirstSpirit and Salesforce locale
 * - ecom-message for the overlay when executing specific actions in the ContentCreator
 * - ecom-page for getting the pageTarget and fsPageId information
 * - ecom-navigation for fetching the navigation from the navigation service
 * - ecom-extra-menu for getting the seo urls and labels for FirstSpirit-Driven content pages
 */

/** CFC Start **/
import {atom, selectorFamily} from 'recoil';
import set from 'lodash.set';

import {fibonacci} from '../../utils/sleep.js';

import {
  ecomExtraMenuRevisionAtomic,
  ecomNavigationRevisionAtomic,
  ecomPageRevisionAtomic,
} from './revisions';

export const ecomApiAtomic = atom({
  key: 'ecom-api',
  default: {
    ecomApi: undefined,
    isPreview: false,
    logLevel: 1, // DEBUG = 0, INFO = 1, WARNING = 2, ERROR = 3, NONE = 4
    devMode: false,
  },
  dangerouslyAllowMutability: true,
  effects: [
    ({onSet}) => {
      onSet(async (_, oldValue) => oldValue?.ecomApi?.clear());
    },
  ],
});

export const ecomLanguageAtomic = atom({
  key: 'ecom-locale',
  default: {
    fs: undefined,
    sf: undefined,
  },
});

export const ecomMessageOverlayAtomic = atom({
  key: 'ecom-message',
  default: {
    isOpen: false,
    messageId: undefined,
    defaultMessage: '',
  },
});

/**
 * Prüft, ob das pageTarget-Objekt gültige Daten enthält
 */
function isValidPageTarget(pageTarget, ecomApi) {
  if (!pageTarget || !ecomApi) {
    return false;
  }

  if (pageTarget.isFsDriven && !pageTarget.fsPageId) {
    return false;
  }

  if (!pageTarget.isFsDriven && !pageTarget.id) {
    return false;
  }

  return true;
}

/**
 * Verarbeitet FirstSpirit-getriebene Seiten
 */
async function handleFsDrivenPage(pageTarget, ecomApi, get) {
  const navigation = await get(ecomNavigationFamily());
  const {fs} = get(ecomLanguageAtomic);

  const caasDocumentId = await fetchCaasDocumentId(
    pageTarget,
    navigation,
    ecomApi,
    fs,
  );

  return await ecomApi?.findElement({
    ...pageTarget,
    fsPageId: caasDocumentId,
  });
}

/**
 * Ermittelt die caasDocumentId mit Wiederholungslogik
 */
async function fetchCaasDocumentId(pageTarget, navigation, ecomApi, fs) {
  // Prüfen, ob die ID bereits in der Navigation existiert
  const existing = navigation?.idMap[pageTarget.fsPageId]?.caasDocumentId;
  if (existing) {
    return existing;
  }

  const MAX_TRIES = 5;
  const wait = (tries) => fibonacci(tries) * 250;

  return new Promise((resolve, reject) => {
    const getNavigationElement = async (tries = 1) => {
      try {
        const freshNavigation = await ecomApi?.fetchNavigation({
          initialPath: '/',
          locale: fs,
        });

        const navigationElement = freshNavigation.idMap[pageTarget.fsPageId];
        if (navigationElement) {
          if (tries >= MAX_TRIES) {
            return resolve(navigationElement.caasDocumentId);
          }
        }

        if (tries >= MAX_TRIES) {
          return reject(
            `Navigation Element ${pageTarget.fsPageId} does not exist after ${tries} tries`,
          );
        }

        setTimeout(() => getNavigationElement(tries + 1), wait(tries));
      } catch (error) {
        reject(error);
      }
    };

    getNavigationElement();
  });
}

export const ecomPageFamily = selectorFamily({
  key: 'ecom-page',
  default: {},
  get:
    (pageTarget) =>
    async ({get}) => {
      get(ecomPageRevisionAtomic);

      const {ecomApi} = get(ecomApiAtomic);

      // Frühe Validierungsprüfungen
      if (!isValidPageTarget(pageTarget, ecomApi)) {
        return;
      }

      return pageTarget.isFsDriven
        ? await handleFsDrivenPage(pageTarget, ecomApi, get)
        : await ecomApi?.findPage(pageTarget);
    },
});

export const ecomNavigationFamily = selectorFamily({
  key: 'ecom-navigation',
  default: {},
  dangerouslyAllowMutability: true,
  get:
    () =>
    async ({get}) => {
      get(ecomNavigationRevisionAtomic);
      const {fs} = get(ecomLanguageAtomic);

      const {ecomApi} = get(ecomApiAtomic);
      if (ecomApi) {
        return await ecomApi?.fetchNavigation({initialPath: '/', locale: fs});
      }
    },
});

export const ecomExtraMenuFamily = selectorFamily({
  key: 'ecom-extra-menu',
  default: {},
  get: () => {
    return async ({get}) => {
      get(ecomExtraMenuRevisionAtomic);

      const navigation = await get(ecomNavigationFamily());
      if (!navigation?.seoRouteMap) {
        return {};
      }

      const relevantSeoRoutes = {};

      Object.entries(navigation.seoRouteMap).forEach(([route, id]) => {
        if (route.startsWith('/[products]')) {
          return;
        }
        if (route.startsWith('/[categories]')) {
          return;
        }
        if (route.toLowerCase().startsWith('/homepage')) {
          return;
        }

        const paths = route.replace('.json', '').split('/');
        paths.shift();

        set(relevantSeoRoutes, paths, {
          navigationElement: navigation.idMap[id],
          route: route.replace('.json', ''),
          label: navigation.idMap[id].label,
        });
      });

      return relevantSeoRoutes;
    };
  },
});
/** CFC End **/
