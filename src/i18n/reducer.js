import { ENGLISH_TRANSLATION } from './messages/en';
import { ITALIAN_TRANSLATION } from './messages/it';

export const LOCALE_SELECTED = '@@i18n/LOCALE_SELECTED';

const initialState = {
  lang: ENGLISH_TRANSLATION.lang,
  messages: ENGLISH_TRANSLATION.messages
};

export const localeReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOCALE_SELECTED:
      switch (action.locale) {
        case 'en':
          return { ...initialState, lang: ENGLISH_TRANSLATION.lang, messages: ENGLISH_TRANSLATION.messages };
        case 'it':
          return { ...initialState, lang: ITALIAN_TRANSLATION.lang, messages: ITALIAN_TRANSLATION.messages };
        default:
          return { ...initialState, lang: ENGLISH_TRANSLATION.lang, messages: ENGLISH_TRANSLATION.messages };
      }
    default:
      return state;
  }
};
