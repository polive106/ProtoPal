import i18next from './config';

export { useTranslation, Trans, I18nextProvider } from 'react-i18next';
export { resources, ns, defaultNS, supportedLngs, isSupportedLng } from './config';

export function translateApiError(error: { errorKey?: string; message: string }): string {
  return error.errorKey
    ? i18next.t(error.errorKey, { ns: 'errors', defaultValue: error.message })
    : error.message;
}

export default i18next;
