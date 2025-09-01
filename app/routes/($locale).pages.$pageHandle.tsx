import {
  json,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import invariant from 'tiny-invariant';
import {getSeoMeta} from '@shopify/hydrogen';
import {useRecoilValue} from 'recoil';

import {PageHeader, Section} from '~/components/Text';
import {routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import {EcomPage} from '~/contexts/ecomAPI/EcomPage';
import {EcomPageSlot} from '~/contexts/ecomAPI/EcomPageSlot';
import FirstSpiritComponentSelector from '~/components/firstSpiritComponentSelector';
import {ecomLanguageAtomic} from '~/contexts/state/atoms';
import {EcomPageHeader} from '~/partials/EcomPageHeader';

export const headers = routeHeaders;

export async function loader({request, params, context}: LoaderFunctionArgs) {
  invariant(params.pageHandle, 'Missing page handle');

  const {page} = await context.storefront.query(PAGE_QUERY, {
    variables: {
      handle: params.pageHandle,
      language: context.storefront.i18n.language,
    },
  });

  if (!page) {
    throw new Response(null, {status: 404});
  }

  const seo = seoPayload.page({page, url: request.url});

  return json({page, seo});
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Page() {
  const {page} = useLoaderData<typeof loader>();

  // Get fs locale from recoil state
  const {fs: fsLocale} = useRecoilValue(ecomLanguageAtomic);

  const extractedId = page.id.replace('gid://shopify/Page/', '');

  return (
    <EcomPage
      pageTarget={{
        id: extractedId,
        type: 'content',
        locale: fsLocale,
        fsPageTemplate: 'contentpage',
        displayNames: {
          EN: page?.title,
          DE: page?.title,
        },
      }}
    >
      <>
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
      </>
    </EcomPage>
  );
}

const PAGE_QUERY = `#graphql
  query PageDetails($language: LanguageCode, $handle: String!)
  @inContext(language: $language) {
    page(handle: $handle) {
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;
