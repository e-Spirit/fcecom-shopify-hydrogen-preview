import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

type ResourceType = 'product' | 'category' | 'content';

const resourceTypeMapping = {
  product: 'Product',
  category: 'Collection',
  content: 'Page',
};

// API route to fetch handle by id
export async function loader({context, request}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const type = url.searchParams.get('type') as ResourceType;

  if (!id) {
    return new Response(JSON.stringify({error: 'ID is required'}), {
      status: 400,
      headers: {'Content-Type': 'application/json'},
    });
  }

  if (!type || !['product', 'category', 'content'].includes(type)) {
    return new Response(
      JSON.stringify({
        error: 'Valid type is required (product, category, or content)',
      }),
      {
        status: 400,
        headers: {'Content-Type': 'application/json'},
      },
    );
  }

  const {storefront} = context;

  try {
    const shopifyType = resourceTypeMapping[type];
    const globalId = `gid://shopify/${shopifyType}/${id}`;

    // Create the GraphQL query based on the type
    let query;
    const variables = {id: globalId};
    let queryName;

    switch (type) {
      case 'product':
        queryName = 'product';
        query = `#graphql
        query GetProductHandle($id: ID!) {
          product(id: $id) {
            handle
          }
        }
        `;
        break;
      case 'category':
        queryName = 'collection';
        query = `#graphql
        query GetCollectionHandle($id: ID!) {
          collection(id: $id) {
            handle
          }
        }
        `;
        break;
      case 'content':
        queryName = 'page';
        query = `#graphql
        query GetPageHandle($id: ID!) {
          page(id: $id) {
            handle
          }
        }
        `;
        break;
    }

    const data = await storefront.query(query, {variables});
    const resource = data[queryName];

    if (!resource) {
      return new Response(JSON.stringify({error: `${type} not found`}), {
        status: 404,
        headers: {'Content-Type': 'application/json'},
      });
    }

    return new Response(
      JSON.stringify({
        handle: resource.handle,
      }),
      {
        status: 200,
        headers: {'Content-Type': 'application/json'},
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({error: `Failed to fetch ${type} handle`}),
      {
        status: 500,
        headers: {'Content-Type': 'application/json'},
      },
    );
  }
}
