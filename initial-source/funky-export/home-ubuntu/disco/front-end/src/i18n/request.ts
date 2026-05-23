import {getRequestConfig} from 'next-intl/server';
import {getUserLocale} from '../services/locale';
import fs from 'fs';
import path from 'path';

export default getRequestConfig(async () => {
  const locale = await getUserLocale();
  
  // Check if the requested locale file exists
  const localeFilePath = path.resolve(process.cwd(), `locales/${locale}.json`);
  const fallbackLocale = 'en';
  
  let messages;
  try {
    // Try to load the requested locale
    messages = (await import(`../../locales/${locale}.json`)).default;
  } catch (error) {
    // If locale file doesn't exist, fall back to English
    console.log(`Locale file for "${locale}" not found, falling back to ${fallbackLocale}`);
    messages = (await import(`../../locales/${fallbackLocale}.json`)).default;
  }

  return {
    locale,
    messages,
    timeZone: 'Asia/Tokyo'
  };
});