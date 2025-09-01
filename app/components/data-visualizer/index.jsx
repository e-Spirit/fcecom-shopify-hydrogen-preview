/* eslint-disable react/no-unescaped-entities */

/**
 * === CFC ===
 * Component to display CaaS data as JSON.
 */

/** CFC Start **/
import React from 'react';
import {ObjectView} from 'react-object-view';

import {Heading, Text} from '../Text';
import {Box} from '../Box';

/*
 * This is an example slot containing the DataVisualizer component
 */
const DataVisualizer = ({section}) => (
  <>
    <div data-preview-id={section?.id}>
      <Heading color={'gray.200'} as="h2">
        Data Visualizer
      </Heading>
      <Text color="primary" size="lead">
        The following payload will be passed to section '{section?.id}'
      </Text>
      <Box
        className="container"
        style={{
          position: 'relative',
          transform: 'rotate(0deg)',
          minWidth: '100%',
          padding: 0,
        }}
      >
        <Box className="data-container">
          <ObjectView
            data={section}
            options={{
              hideDataTypes: false,
              hideObjectSize: false,
              hidePreviews: false,
              expandLevel: 1,
              previewElementsMaxCount: 7,
              previewOpacity: 0.5,
              previewPropertiesMaxCount: 4,
              previewStringMaxLength: 20,
            }}
            styles={{
              lineHeight: 1.7,
              tabWidth: 2,
              fontSize: 16,
              fontFamily: 'Courier, monospace',
            }}
          />
        </Box>
      </Box>
    </div>
  </>
);

export default DataVisualizer;
/** CFC End **/
