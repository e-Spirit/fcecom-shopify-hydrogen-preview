/*
 * Copyright (c) 2022, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * === CFC ===
 * Component that renders either a Landingpage or a Contentpage depending on the page template.
 * It uses the navigation service to set the id of the CaaS document as fsPageId.
 */

/** CFC Start **/
import React from 'react';
import {useParams} from '@remix-run/react';
import {useRecoilValueLoadable} from 'recoil';

import {NotFound} from '../../components/NotFound';
import {ecomNavigationFamily} from '../../contexts/state/atoms';

import {LandingPage} from './partials/LandingPage';
import {ContentPage} from './partials/ContentPage';

const EcomPageDecider = () => {
  const params = useParams();
  // TODO: Fix the 404 flicker that sometimes occurs switching the language or between pages
  const navigationLoadable = useRecoilValueLoadable(ecomNavigationFamily());

  if (navigationLoadable.state !== 'hasValue') {
    return null;
  }

  const {contents: navigation} = navigationLoadable;

  let path = params['*'];
  let urlLocale = null;

  const match = path.match(/^([a-z]{2}-[a-z]{2})\//);

  if (match) {
    urlLocale = match[1];
    path = path.replace(`${urlLocale}/`, '');
  }

  const seoId = navigation?.seoRouteMap?.[`/${path}.json`];

  if (!seoId) {
    return <NotFound />;
  }

  let navElement = navigation?.idMap[seoId];

  if (!navElement?.customData) {
    navElement = Object.values(navigation?.idMap).find(
      (navElement) => !!navElement.parentIds?.includes(seoId),
    );
  }

  const customData = navElement?.customData;
  const caasId = navElement?.caasDocumentId;
  const pageTemplate = customData?.pageTemplate;

  if (!caasId) {
    return <NotFound />;
  }

  switch (pageTemplate) {
    case 'landingpage':
      return <LandingPage fsPageId={caasId} />;
    case 'contentpage':
      return <ContentPage fsPageId={caasId} />;
    default:
      return <NotFound />;
  }
};

EcomPageDecider.getTemplateName = () => 'ecom-page-decider';

export default EcomPageDecider;
/** CFC End **/
