/* eslint import/prefer-default-export: 0 */
export const LOCALE_SELECTED = '@@i18n/LOCALE_SELECTED';

export function selectedLocale(locale) {
  return {
    type: LOCALE_SELECTED,
    locale,
  };
}
