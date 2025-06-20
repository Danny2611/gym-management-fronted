import 'react-i18next';
import common from '../i18n/locales/en/common.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    resources: {
      common: typeof common;
    };
  }
}