export const toFSLocale = (sfLocale) => {
  if (!sfLocale) {
    return sfLocale;
  }
  const parts = sfLocale.split('-');
  if (parts.length !== 2) {
    return sfLocale;
  }
  return `${parts[0]}_${parts[1].toUpperCase()}`;
};

export const toSfLocale = (fsLocale) => {
  if (!fsLocale) {
    return fsLocale;
  }
  return fsLocale.replace('_', '-').toLowerCase();
};
