import React, {useEffect, useState} from 'react';
import {get, isEmpty} from 'lodash';
import {Link as RouterLink} from '@remix-run/react';
import {
  ArrowTopRightOnSquareIcon,
  LinkIcon as HeroLinkIcon,
} from '@heroicons/react/24/outline';

import {useEcomNavigation} from '../contexts/ecomAPI/EcomNavigation';

export const StyledFsText = ({data, content}) => {
  if (typeof content === 'string') {
    return <span>{content}</span>;
  }

  let baseClass = '';

  switch (data['format']) {
    case 'bold':
      baseClass += ' font-bold';
      break;
    case 'italic':
      baseClass += ' italic';
      break;
    case 'subline':
      baseClass += ' font-bold text-xl';
      break;
  }

  switch (data['data-fs-style']) {
    case 'format.h2':
      baseClass += ' text-2xl font-bold';
      break;
    case 'format.h3':
      baseClass += ' text-xl font-semibold';
      break;
    case 'format.subline':
      baseClass += ' text-xl font-bold';
      break;
  }

  return (
    <span className={baseClass.trim()}>
      <RichText fsText={content} />
    </span>
  );
};

export const EcomCtaLink = ({data}) => {
  const {resolveReference} = useEcomNavigation();
  const [targetLink, setTargetLink] = useState(null);

  const link = get(data, 'data.lt_link');
  const theme = get(data, 'data.lt_theme');

  const external = link?.template === 'external_link';

  useEffect(() => {
    const getLink = async () => {
      try {
        const resolvedLink = await resolveReference(data);
        setTargetLink(resolvedLink);
      } catch (error) {
        console.error('Error resolving CTA link:', error);
        setTargetLink(null);
      }
    };

    getLink();
  }, [data, resolveReference]);

  let baseClass =
    'inline-block px-4 py-2 rounded shadow hover:shadow-md transition text-sm';

  switch (theme.key) {
    case 'light':
      baseClass += ' bg-white border border-gray-200 text-gray-800';
      break;
    case 'dark':
      baseClass += ' bg-blue-800 text-white';
      break;
  }

  const label = get(data, 'data.lt_text');
  const text = <RichText fsText={label} />;

  if (link.template === 'internal_link') {
    return (
      <RouterLink to={targetLink} className={baseClass}>
        {text}
      </RouterLink>
    );
  }

  if (external) {
    return (
      <a
        href={targetLink}
        target="_blank"
        rel="noreferrer"
        className={baseClass}
      >
        {text}
      </a>
    );
  }

  const fallbackLabel = get(
    link,
    `data.lt_${link.template?.split('_')[0]}.value[0].value.label`,
  );
  return (
    <RouterLink to={targetLink} className={baseClass}>
      <RichText fsText={fallbackLabel} />
    </RouterLink>
  );
};

export const EcomRichLink = ({data, content}) => {
  const {resolveReference} = useEcomNavigation();
  const [targetLink, setTargetLink] = useState(null);

  const external = data.template === 'dom_external_link';

  useEffect(() => {
    const getLink = async () => {
      try {
        const link = await resolveReference(data);
        setTargetLink(link);
      } catch (error) {
        console.error('Error resolving rich text link:', error);
        setTargetLink(null);
      }
    };

    getLink();
  }, [data, resolveReference]);

  if (data.template === 'cta_link') {
    return <EcomCtaLink data={data} />;
  }

  return (
    <RouterLink
      to={targetLink}
      target={external ? '_blank' : '_self'}
      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
    >
      <RichText fsText={content} />
      {external ? (
        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
      ) : (
        <HeroLinkIcon className="w-4 h-4" />
      )}
    </RouterLink>
  );
};

export const RichText = ({fsText}) => {
  if (!fsText || isEmpty(fsText)) {
    return null;
  }
  if (typeof fsText === 'string') {
    return fsText;
  }

  return fsText.map((element, i) => {
    const {type, content, data} = element;

    switch (type) {
      case 'block':
        return (
          <div key={i} className="my-2">
            <StyledFsText {...element} />
          </div>
        );
      case 'linebreak':
        return <br key={i} />;
      case 'paragraph':
        return (
          <div key={i} className="my-2">
            <StyledFsText {...element} />
          </div>
        );
      case 'text':
        return <StyledFsText {...element} key={i} />;
      case 'link':
        return <EcomRichLink data={data} content={content} key={i} />;
      case 'list':
        return (
          <ul className="list-disc list-inside my-2" key={i}>
            <RichText fsText={content} />
          </ul>
        );
      case 'listitem':
        return (
          <li className="ml-4" key={i}>
            <RichText fsText={content} />
          </li>
        );
      default:
        return null;
    }
  });
};
