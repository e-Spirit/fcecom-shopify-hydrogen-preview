import React from 'react';
import {EcomPageSlot} from '../../../contexts/ecomAPI/EcomPageSlot';
import {EcomPage} from '../../../contexts/ecomAPI/EcomPage';
import FirstSpiritComponentSelector from '../../../components/firstSpiritComponentSelector';
import {useRecoilValue} from 'recoil';
import {ecomLanguageAtomic} from '../../../contexts/state/atoms';
import {EcomPageHeader} from '../../../partials/EcomPageHeader';

export const LandingPage = ({fsPageId}) => {
  const {fs: locale} = useRecoilValue(ecomLanguageAtomic);

  return (
    <EcomPage
      pageTarget={{
        fsPageId,
        locale,
        type: 'content',
        fsPageTemplate: 'landingpage',
        isFsDriven: true,
      }}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col">
          <EcomPageHeader />
          <EcomPageSlot slotName="stage">
            <FirstSpiritComponentSelector />
          </EcomPageSlot>

          <div className="flex flex-row justify-evenly gap-10 my-6">
            <div className="flex-grow">
              <EcomPageSlot slotName="left_content">
                <FirstSpiritComponentSelector />
              </EcomPageSlot>
            </div>
            <div className="flex-grow">
              <EcomPageSlot slotName="right_content">
                <FirstSpiritComponentSelector />
              </EcomPageSlot>
            </div>
          </div>

          <EcomPageSlot slotName="content">
            <FirstSpiritComponentSelector />
          </EcomPageSlot>

          <EcomPageSlot slotName="sub_content">
            <FirstSpiritComponentSelector />
          </EcomPageSlot>
        </div>
      </div>
    </EcomPage>
  );
};
