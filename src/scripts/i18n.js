import { useI18n } from 'vue-i18n';

export const SUPPORTED_LOCALES = [
  {
    code: 'en',
    name: 'English',
  },
];

export function useT(path) {
  const { messages, locale, fallbackLocale } = useI18n(),
    msgs = messages.value?.[locale.value],
    fallback = messages.value?.[fallbackLocale.value],
    keys = path.split('.'),
    translate = msg => keys.reduce((obj, i) => obj?.[i], msg),
    translated = translate(msgs) || translate(fallback);

  return translated || path;
}

export function useSetupLocale(locale) {
  import(`@/locales/${locale}.json`)
    .then(mod => mod.default)
    .then(mod => {
      window.i18n.global.messages.value[locale] = mod;
    });

  window.i18n.global.locale.value = locale;
}
