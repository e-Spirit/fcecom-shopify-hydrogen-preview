/**
 * === CFC ===
 * Context provider for the slot creation.
 */

/** CFC Start **/
import React, {useContext, useEffect, useState} from 'react';
import {EcomApi} from 'fcecom-frontend-api-client';

import {useEcomPage} from './EcomPage';

export const EcomPageSlotContext = React.createContext();

export const EcomPageSlot = ({slotName, children}) => {
  const {ecomPage} = useEcomPage();
  const [sections, setSections] = useState(null);

  useEffect(() => {
    if (ecomPage) {
      setSections(EcomApi.extractSlotSections(ecomPage, slotName));
    }
  }, [ecomPage]);

  return (
    <EcomPageSlotContext.Provider value={{sections, slotName}}>
      {children}
    </EcomPageSlotContext.Provider>
  );
};

export const useEcomPageSlot = () => useContext(EcomPageSlotContext);
/** CFC End **/
