import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from 'next/image';
import ClickOutside from "@/components/ClickOutside";
import { Globe } from "lucide-react";
import { useLocale, useTranslations } from 'next-intl';
import { Locale } from '@/i18n/config';
import { getUserLocale, setUserLocale } from '@/services/locale';
import '@/css/fonts.css';

const LanguageList = [
  {
    label: 'en',
    title: "English",
    available: true,
    icon: '/images/language_icon/icon_EN.png',
    fontFamily: 'font-noto-sans'
  },
  {
    label: 'ja',
    title: "日本語",
    available: true,
    icon: '/images/language_icon/icon_JA.png',
    fontFamily: 'font-noto-sans-jp'
  },
  {
    label: 'cn',
    title: "简体中文",
    available: true,
    icon: '/images/language_icon/icon_CN.png',
    fontFamily: 'font-noto-sans-sc'
  },
  {
    label: 'tw',
    title: "繁體中文",
    available: true,
    icon: '/images/language_icon/icon_TW.png',
    fontFamily: 'font-noto-sans-tc'
  },
  {
    label: 'es',
    title: 'Español',
    available: true,
    icon: '/images/language_icon/icon_ES.png',
    fontFamily: 'font-noto-sans'
  },
  {
    label: 'ar',
    title: 'العربية',
    available: true,
    icon: '/images/language_icon/icon_AR.png',
    fontFamily: 'font-noto-sans-arabic'
  },
  {
    label: 'ru',
    title: 'русский',
    available: true,
    icon: '/images/language_icon/icon_RU.png',
    fontFamily: 'font-noto-sans-cyrillic'
  },
  {
    label: 'fr',
    title: 'Français',
    available: true,
    icon: '/images/language_icon/icon_FR.png',
    fontFamily: 'font-noto-sans'
  },
  {
    label: 'hi',
    title: 'हिन्दी',
    available: true,
    icon: '/images/language_icon/icon_HI.png',
    fontFamily: 'font-noto-sans-devanagari'
  },
  {
    label: 'pt',
    title: 'Português',
    available: true,
    icon: '/images/language_icon/icon_PT.png',
    fontFamily: 'font-noto-sans'
  },
  {
    label: 'ko',
    title: '한국어',
    available: true,
    icon: '/images/language_icon/icon_KO.png',
    fontFamily: 'font-noto-sans-kr'
  },
  {
    label: 'ms',
    title: 'Bahasa Melayu',
    available: true,
    icon: '/images/language_icon/icon_MS.png',
    fontFamily: 'font-noto-sans'
  },
  {
    label: 'id',
    title: 'Indonesia',
    available: true,
    icon: '/images/language_icon/icon_ID.png',
    fontFamily: 'font-noto-sans'
  },
  {
    label: 'th',
    title: 'ภาษาไทย',
    available: true,
    icon: '/images/language_icon/icon_TH.png',
    fontFamily: 'font-noto-sans-thai'
  },
  {
    label: 'vi',
    title: 'Tiếng Việt',
    available: true,
    icon: '/images/language_icon/icon_VI.png',
    fontFamily: 'font-noto-sans-vietnamese'
  },
  {
    label: 'de',
    title: 'Deutsch',
    available: true,
    icon: '/images/language_icon/icon_DE.png',
    fontFamily: 'font-noto-sans'
  },
  {
    label: 'it',
    title: 'Italiano',
    available: true,
    icon: '/images/language_icon/icon_IT.png',
    fontFamily: 'font-noto-sans'
  },
  {
    label: 'fa',
    title: 'فارسی',
    available: true,
    icon: '/images/language_icon/icon_FA.png',
    fontFamily: 'font-noto-sans-arabic'
  },
  {
    label: 'ur',
    title: 'اردو',
    available: true,
    icon: '/images/language_icon/icon_UR.png',
    fontFamily: 'font-noto-sans-arabic'
  },
  {
    label: 'tr',
    title: 'Türkçe',
    available: true,
    icon: '/images/language_icon/icon_TR.png',
    fontFamily: 'font-noto-sans'
  }
];

const LanguageSelector = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [languageLocale, setLanguageLocale] = useState('');
  const [notifying, setNotifying] = useState(true);
  const t = useTranslations('Menu');
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const onChangeLanguage = (value: string) => {
    const locale = value as Locale;
    setLanguageLocale(locale);
    startTransition(() => {
      setUserLocale(locale);
      const selectedLanguage = LanguageList.find(lang => lang.label === locale);
      if (selectedLanguage) {
        document.body.className = selectedLanguage.fontFamily;
      }
    });
  }
  const getLanguageLocale = async () => {
    const locale = await getUserLocale();
    setLanguageLocale(locale);
    const selectedLanguage = LanguageList.find(lang => lang.label === locale);
    if (selectedLanguage) {
      document.body.className = selectedLanguage.fontFamily;
    }
  }
  useEffect(() => {
    getLanguageLocale()
  }, []);
  useEffect(() => {
    setDropdownOpen(false)
  }, [languageLocale])
  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <li>
        <Link
          onClick={() => {
            setNotifying(false);
            setDropdownOpen(!dropdownOpen);
          }}
          href="#"
          className="flex hover:text-primary items-center justify-center relative rounded-full text-dark"
        >
            <span className="relative">
              <Image 
                src={LanguageList.find(lang => lang.label === languageLocale)?.icon || '/images/language_icon/icon_EN.png'} 
                alt="Selected Language" 
                width={28} 
                height={28} 
              />
            </span>
        </Link>

        {dropdownOpen && (
          <div
            className={`absolute right-0 mt-3 flex h-auto w-[364px] flex-col rounded-xl border-[0.5px] border-stroke bg-white px-2 sm:px-4 py-4 shadow-default dark:border-white dark:bg-black sm:right-0 language-selector-dropdown z-1`}
          >
            <ul className="grid grid-cols-2 gap-1 sm:gap-2">
              {LanguageList.map((item, index) => (
                <li key={index}>
                  <div
                    className={`flex items-center my-1 rounded-[10px] cursor-pointer ${item.fontFamily}`}
                    onClick={() => {
                      if (item.available) {
                        onChangeLanguage(item.label)
                      }
                    }}
                  >
                    <span className="block">
                      <span className={`block text-[16px] ${item.label == languageLocale ? "text-[#00FFCC]" : item.available ? "text-[#ffffff]" : "text-[#666666]"}`}>
                        {item.title}
                      </span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </li>
    </ClickOutside>
  );
};

export default LanguageSelector;
