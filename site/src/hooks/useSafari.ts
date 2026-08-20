import { useState, useEffect } from "react";

/**
 * Custom hook to detect Safari browser
 * @returns boolean - true if the browser is Safari, false otherwise
 */
export const useSafari = (): boolean => {
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(userAgent);
    setIsSafari(isSafariBrowser);
  }, []);

  return isSafari;
};
