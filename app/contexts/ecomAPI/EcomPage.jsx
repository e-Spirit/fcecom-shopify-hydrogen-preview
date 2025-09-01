/**
 * === CFC ===
 * Context provider for the page creation and parsing the slots with setElement.
 */

/** CFC Start **/
import React, {useContext, useEffect} from 'react';
import {useRecoilValueLoadable} from 'recoil';

import {ecomApiAtomic, ecomPageFamily} from '../state/atoms';

export const EcomPageContext = React.createContext();

export const EcomPage = ({pageTarget, children}) => {
  const {
    contents: {ecomApi, isPreview},
  } = useRecoilValueLoadable(ecomApiAtomic);

  const isFsDriven = pageTarget.isFsDriven ?? false;

  const {id, fsPageId, type, locale, fsPageTemplate} = pageTarget;
  const {contents: ecomPage} = useRecoilValueLoadable(
    ecomPageFamily({...pageTarget, isFsDriven}),
  );

  useEffect(() => {
    ecomApi &&
      isPreview &&
      (id || fsPageId) &&
      ecomApi.setPage({...pageTarget, isFsDriven});
  }, [
    id,
    fsPageId,
    type,
    locale,
    fsPageTemplate,
    isFsDriven,
    ecomApi,
    isPreview,
  ]);

  return (
    <EcomPageContext.Provider value={{ecomPage, pageTarget}}>
      {children}
    </EcomPageContext.Provider>
  );
};

export const useEcomPage = () => useContext(EcomPageContext);
/** CFC End **/
