// src/utils/analytics.js
import { TRACKING_CONFIG } from "./config";

export const trackEvent = (name, params = {}, useAds = false) => {
  if (window.gtag) {
    const finalParams = { ...params };

    // If useAds is true, we automatically route it to your Ads ID
    if (useAds) {
      finalParams.send_to = TRACKING_CONFIG.ADS_ID;
    }

    window.gtag("event", name, finalParams);
  }
};