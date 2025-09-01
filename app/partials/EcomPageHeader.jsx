/**
 * === CFC ===
 * Component that displays a header that shows whether or not a content page is available in FirstSpirit.
 * This header is only shown when the log level is set to DEBUG.
 */

/** CFC Start **/
// import { Box, Text, useClipboard } from '@chakra-ui/react';

import React from 'react';
import {useRecoilValueLoadable} from 'recoil';

import {useEcomPage} from '../contexts/ecomAPI/EcomPage';
import {ecomApiAtomic} from '../contexts/state/atoms';
import {Box} from '../components/Box';
import {Text} from '../components/Text';
import {Grid} from '../components/Grid';
import {useClipboard} from '../hooks/useClipboard';

export const EcomPageHeader = () => {
  const {ecomPage, pageTarget} = useEcomPage();
  const targetId = ecomPage?.refId;

  const {
    value: idValue,
    hasCopied: hasCopiedId,
    onCopy: onCopyId,
  } = useClipboard(targetId);

  const {
    contents: {isPreview, devMode, ecomApi},
  } = useRecoilValueLoadable(ecomApiAtomic);

  if (!isPreview) {
    return null;
  }

  if (ecomPage instanceof Error) {
    return (
      <Box>
        <Text color={'error'} className="flex">
          Error
          <Text color={'subtle'} className="ml-3">
            {ecomPage.message}
          </Text>
        </Text>
      </Box>
    );
  }

  const temporarily = (func) => {
    func?.(true);
    setTimeout(() => func?.(false), 2000);
  };

  const PageShare = ({label, params}) => {
    const [hasCopied, setCopied] = React.useState(false);
    const [hasError, setError] = React.useState(false);
    const [isLoading, setLoading] = React.useState(false);

    const getShareViewLink = () => {
      setError(false);
      setLoading(true);

      try {
        ecomApi
          .getShareViewLink(params)
          .then((result) => {
            if (!result) {
              console.error(
                'Nothing was returned while creating a ShareView link',
                `${result}`,
              );
              return temporarily(setError);
            }

            navigator.clipboard.writeText(result);
            temporarily(setCopied);
          })
          .catch((error) => {
            console.error(
              'An error occurred when getting ShareView link:',
              error,
            );
            temporarily(setError);
          })
          .finally(() => setLoading(false));
      } catch (error) {
        console.error(
          'An error occurred when processing ShareView link:',
          error,
        );
        temporarily(setError);
      }
    };

    return (
      <Text
        color={'subtle'}
        size={'lead'}
        cursor={hasCopied && !hasError ? 'auto' : 'pointer'}
        onClick={getShareViewLink}
      >
        {isLoading ? (
          'Loading...'
        ) : hasError ? (
          <Text color={'error'}>Failed, retry?</Text>
        ) : hasCopied ? (
          <Text color={'success'}>Link copied</Text>
        ) : (
          label
        )}
      </Text>
    );
  };

  const LIFETIME_24_HR = 24 * 60 * 60 * 1000; // real-life
  const LIFETIME_5_SEC = 5 * 1000; // development duration

  return (
    <Box className="px-6 md:px-8 lg:px-12 py-4">
      {ecomPage?.name ? (
        <Grid items={3}>
          <Text color={'success'} size={'lead'}>
            Page „{ecomPage.name}” is available in FirstSpirit
          </Text>
          <Text
            color={'subtle'}
            size={'lead'}
            className="flex justify-start space-x-4"
          >
            <PageShare
              label={'Share this Page'}
              params={{
                id: pageTarget?.isFsDriven
                  ? pageTarget.fsPageId
                  : pageTarget?.id,
                type: pageTarget?.type,
                lifetimeMs: LIFETIME_24_HR,
                fsDriven: pageTarget?.isFsDriven,
              }}
            />
            <PageShare
              label={'Share all Pages'}
              params={{
                universalAllow: true,
                lifetimeMs: LIFETIME_24_HR,
              }}
            />
          </Text>
          {devMode && targetId && (
            <Text
              color={'subtle'}
              size={'lead'}
              cursor={hasCopiedId ? 'auto' : 'pointer'}
              onClick={onCopyId}
            >
              CaaS Document ID: {hasCopiedId ? 'Copied' : idValue}
            </Text>
          )}
        </Grid>
      ) : (
        devMode && (
          <Text color={'error'} size={'lead'}>
            Page is not available in FirstSpirit
          </Text>
        )
      )}
    </Box>
  );
};
/** CFC End **/
