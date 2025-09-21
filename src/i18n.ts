import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { locales, defaultLocale, type Locale } from "./i18n/config";

export default getRequestConfig(async () => {
	// Get locale from cookie or use default
	const cookieStore = await cookies();
	const localeCookie = cookieStore.get("locale");
	let locale = localeCookie?.value as Locale | undefined;

	// Validate locale
	if (!locale || !locales.includes(locale)) {
		locale = defaultLocale;
	}

	return {
		locale,
		messages: (await import(`./i18n/messages/${locale}.json`)).default,
	};
});
