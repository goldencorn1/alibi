import { cookies } from "next/headers";
import HomePageClient from "./page-client";
import { LOCALE_COOKIE, normalizeLocale } from "@/src/ui/i18n";

export default async function HomePage() {
  const cookieStore = await cookies();
  const initialLocale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  return <HomePageClient initialLocale={initialLocale} />;
}
