import {useState, useCallback} from 'react';

export function useClipboard(value: string, timeout = 2000) {
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = useCallback(() => {
    if (!value) return;

    navigator.clipboard
      .writeText(value)
      .then(() => {
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), timeout);
      })
      .catch((err) => console.error('Failed to copy:', err));
  }, [value, timeout]);

  return {value, hasCopied, onCopy};
}
