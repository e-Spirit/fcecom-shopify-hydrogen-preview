/**
 * === CFC ===
 * - Add EcomPageHeader which is only shown when log level is set to DEBUG
 * - Add EcomPage payload: content page with contentpage template
 * - Add page slots 'stage' and 'content'
 * - Add FirstSpiritComponentSelector to page slots to render component based on FirstSpirit section template
 * - Use locale from useRecoilValue hook for page creation and forms
 */

import React from 'react';
import {useRecoilValue} from 'recoil';

import {EcomPageSlot} from '../../../contexts/ecomAPI/EcomPageSlot';
import {EcomPage} from '../../../contexts/ecomAPI/EcomPage';
import FirstSpiritComponentSelector from '../../../components/firstSpiritComponentSelector';
import {ecomLanguageAtomic} from '../../../contexts/state/atoms';
import {Section} from '../../../components/Text';
import {EcomPageHeader} from '../../../partials/EcomPageHeader';

export const ContentPage = ({fsPageId}) => {
  const {fs: locale} = useRecoilValue(ecomLanguageAtomic);

  return (
    <EcomPage
      pageTarget={{
        fsPageId,
        locale,
        type: 'content',
        fsPageTemplate: 'contentpage',
        isFsDriven: true,
      }}
    >
      <EcomPageHeader />
      <Section padding={'x'}>
        <EcomPageSlot slotName="stage">
          <FirstSpiritComponentSelector />
        </EcomPageSlot>
      </Section>
      <Section padding={'x'}>
        <EcomPageSlot slotName="content">
          <FirstSpiritComponentSelector />
        </EcomPageSlot>
      </Section>
    </EcomPage>
  );
};
