import { PRODUCTION_SITE_URL, SITE_URL, STAGING_SITE_URL } from '../constants';

export const getIsDev = () => process.env.NODE_ENV === 'development' || import.meta.env?.DEV;
export const getIsStaging = () => SITE_URL === STAGING_SITE_URL;
export const getIsProduction = () => SITE_URL === PRODUCTION_SITE_URL;
