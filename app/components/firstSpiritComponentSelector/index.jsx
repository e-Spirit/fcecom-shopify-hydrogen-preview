/**
 * === CFC ===
 * Component to select which component should be rendered for a specific FirstSpirit section template.
 */

/** CFC Start **/
import React from 'react';
import {Box} from '@mui/material';

import DataVisualizer from '../data-visualizer';
import {useEcomPageSlot} from '../../contexts/ecomAPI/EcomPageSlot';
import FsBanner from '../fs-components/fs-banner/index.jsx';
import FsCarousel from '../fs-components/fs-carousal/index.jsx';
import FsInteractiveVideo from '../fs-components/fs-interactive-video/index.jsx';
import FsTextImage from '../fs-components/fs-text-image/index.jsx';
import FsFeaturedProducts from '../fs-components/fs-featured-products/index.jsx';
import FsInteractiveImage from '../fs-components/fs-interactive-image/index.jsx';

const EcomSectionWrap = ({children, index}) => (
  <div
    className="outer-container"
    style={{
      minWidth: '100%',
      paddingTop: index === 0 ? '20px' : undefined,
      paddingBottom: '20px',
    }}
  >
    {children}
  </div>
);

const ChooseComponent = ({section}) => {
  switch (section.sectionType) {
    case 'banner':
      return <FsBanner section={section} />;
    case 'carousel':
      return <FsCarousel section={section} />;
    case 'featured_products':
      return <FsFeaturedProducts section={section} />;
    case 'interactive_image':
      return <FsInteractiveImage section={section} />;
    case 'interactive_youtube_video':
      return <FsInteractiveVideo section={section} />;
    case 'text_image':
      return <FsTextImage section={section} />;
    default:
      return <DataVisualizer section={section} />;
  }
};

/*
 * This is the component selector component.
 */
const FirstSpiritComponentSelector = () => {
  const {sections, slotName} = useEcomPageSlot();

  return (
    <Box data-fcecom-slot-name={slotName} style={{minHeight: 20}}>
      <Box>
        {sections?.map((section, index) => (
          <EcomSectionWrap key={section?.id} index={index}>
            <ChooseComponent section={section} />
          </EcomSectionWrap>
        ))}
      </Box>
    </Box>
  );
};

export default FirstSpiritComponentSelector;
/** CFC End **/
