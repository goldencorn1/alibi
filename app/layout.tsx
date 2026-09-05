import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { dictionaryFor, LOCALE_COOKIE, normalizeLocale, type Locale } from "@/src/ui/i18n";

async function requestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
}

export async function generateMetadata(): Promise<Metadata> {
  const t = dictionaryFor(await requestLocale());
  return { title: t.metadataTitle, description: t.metadataDescription };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await requestLocale();
  return <html lang={locale}><body>{children}</body></html>;
}
