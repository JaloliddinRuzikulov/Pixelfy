import { useTranslations, useLocale } from "next-intl";
import { type Locale, locales } from "@/i18n/config";

export function useI18n() {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  
  const changeLocale = (newLocale: Locale) => {
    if (locales.includes(newLocale)) {
      document.cookie = `locale=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
      window.location.reload();
    }
  };
  
  return {
    locale,
    t,
    changeLocale,
    locales,
  };
}