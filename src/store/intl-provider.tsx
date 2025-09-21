"use client";

import { NextIntlClientProvider } from "next-intl";
import { useState, useEffect } from "react";
import { defaultLocale, type Locale, locales } from "@/i18n/config";

// Import all messages
import uzMessages from "@/i18n/messages/uz.json";
import ruMessages from "@/i18n/messages/ru.json";
import enMessages from "@/i18n/messages/en.json";

const messages = {
	uz: uzMessages,
	ru: ruMessages,
	en: enMessages,
};

export function IntlProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [locale, setLocale] = useState<Locale>(defaultLocale);

	useEffect(() => {
		// Get locale from cookie
		const cookieLocale = document.cookie
			.split("; ")
			.find((row) => row.startsWith("locale="))
			?.split("=")[1] as Locale | undefined;

		if (cookieLocale && locales.includes(cookieLocale)) {
			setLocale(cookieLocale);
		}
	}, []);

	return (
		<NextIntlClientProvider
			locale={locale}
			messages={messages[locale]}
			timeZone="Asia/Tashkent"
			now={new Date()}
		>
			{children}
		</NextIntlClientProvider>
	);
}
