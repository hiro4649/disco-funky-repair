import React, { useCallback, useEffect, useMemo, useState } from "react";
import ButtonDefault from "../../Buttons/ButtonDefault";
import Link from "next/link";
import {
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
  ModalHeader,
  UseDisclosureProps,
} from "@nextui-org/modal";
import { Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";
import apiClient from "../../../../utils/apiClient";
import { usePathname } from "next/navigation";
import { useTranslations } from 'next-intl';

type HeaderProps = {
  onLogout: () => void;
  onToggleSidebar?: () => void;
  currentLocale?: 'en' | 'ja';
  onLocaleChange?: (locale: 'en' | 'ja') => void;
};

const Header = (props: HeaderProps) => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [tokenBalance, setTokenBalance] = useState<Number>(10000);
  const [resTokenData, setResTokenData] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const t = useTranslations('Admin');

  // Language options
  const languages = [
    { key: 'en', label: 'English', flag: '🇺🇸' },
    { key: 'ja', label: '日本語', flag: '🇯🇵' }
  ];

  // Handle language change
  const handleLanguageChange = (newLocale: string) => {
    if (props.onLocaleChange) {
      props.onLocaleChange(newLocale as 'en' | 'ja');
    }
  };

  const navItems = useMemo(() => [
    { href: '/admin/user-manage', label: 'Users' },
    { href: '/admin/airdrop-prizes', label: 'Prizes' },
    { href: '/admin/nfts', label: 'NFTs' },
    { href: '/admin/nft-management', label: 'NFT Management' },
    { href: '/admin/ticket-distribution', label: 'Ticket Timing' },
    { href: '/admin/news', label: 'News' },
    { href: '/admin/illustrations', label: 'Illustrations' },
    { href: '/admin/illustration-history', label: 'Illustration History' }
  ], []);


  const getTokenBalance = useCallback(async () => {
    try {
      const res = await apiClient.get(`/admin/seting/tokenbalance`);
      if (res.status == 200) {
        if (res.data.success) {
          const data = res.data.data
          setResTokenData(data)
          setTokenBalance(data.balance)
        }
      }
    } catch (e) {
      console.log(e);
    }
  }, [setResTokenData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const floatValue = parseFloat(value);

    if (floatValue > 0) {
      setTokenBalance(floatValue)
      console.log(tokenBalance)
      setError(null);
    } else {
      setError("数値を入力してください。");
    }
  };

  const onClose = useCallback(() => {
    setIsOpenModal(false);
  }, [setIsOpenModal]);

  useEffect(() => {
    getTokenBalance();
  }, [getTokenBalance]);
  const onDistributeTicekt = async () => {
    try {
      const payload = {
        id: resTokenData.id,
        token_balance: tokenBalance,
      }
      console.log(payload)
      const res = await apiClient.post(`/admin/seting/tokenbalance`, payload);
      if (res.status == 200) {
        const data = res.data.data
        setResTokenData(data)
        setTokenBalance(data.balance)
      }
    } catch (e) {
      console.log(e);
    }
  }
  return (
    <header className="sticky top-0 z-[43] w-full border-b border-gray-200/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-x-3">
          <div className="flex items-center gap-x-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
              aria-label="Toggle sidebar"
              onClick={props.onToggleSidebar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path fillRule="evenodd" d="M3.75 5.25a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
            </button>
            <Link prefetch={false} href="/admin/user-manage" className="hidden lg:flex items-center gap-x-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gray-900 text-white text-sm">FR</span>
              <span className="text-sm font-semibold text-gray-900">{process.env.NEXT_PUBLIC_APP_NAME} Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-x-2">
            {/* Language Switcher */}
            <Dropdown>
              <DropdownTrigger>
                <Button 
                  variant="flat" 
                  className="min-w-[100px] bg-gray-100 hover:bg-gray-200"
                >
                  {languages.find(l => l.key === props.currentLocale)?.flag || '🌐'} {languages.find(l => l.key === props.currentLocale)?.label || 'Language'}
                </Button>
              </DropdownTrigger>
              <DropdownMenu 
                aria-label="Language Selection"
                onAction={(key) => handleLanguageChange(key as string)}
                selectedKeys={props.currentLocale ? [props.currentLocale] : ['en']}
                selectionMode="single"
              >
                {languages.map((lang) => (
                  <DropdownItem key={lang.key} startContent={<span>{lang.flag}</span>}>
                    {lang.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <ButtonDefault label="Set Token Balance" customClasses="bg-primary px-3 py-2 rounded-lg text-white" onClick={() => { setIsOpenModal(true) }} />
            <ButtonDefault
              label={t('Logout')}
              customClasses="bg-gray-900 px-3 py-2 rounded-lg text-white hover:bg-black"
              onClick={props.onLogout}
            />
          </div>
        </div>
      </div>
      <Modal
        placement={"center"}
        size={"sm"}
        backdrop={"blur"}
        isOpen={isOpenModal}
        onClose={onClose}
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900/60 to-zinc-900/20 backdrop-opacity-20",
          closeButton: "hidden",
        }}
      >
        <ModalContent
          className="w-1/4 rounded-xl border border-white bg-white"
          role={"alertdialog"}
        >
          <ModalBody>
            <p>{process.env.NEXT_PUBLIC_APP_NAME} の残高を設定してください。</p>
            <Input
              errorMessage={error || "このフィールドに入力する必要があります。"}
              label={`${process.env.NEXT_PUBLIC_APP_NAME} の残高`}
              placeholder={`${process.env.NEXT_PUBLIC_APP_NAME} の残高を設定してください。`}
              type="number"
              // step="any"
              name="tokenBalance"
              value={String(tokenBalance)}
              onChange={handleInputChange}
            />
            <div className="flex items-center justify-end gap-x-3">
              <ButtonDefault
                label={loading ? "確認中..." : "公開"}
                customClasses="bg-primary text-white px-4 gap-x-2 py-2 rounded-lg"
                onClick={() => { onDistributeTicekt(); setIsOpenModal(false); }}
                disabled={loading}
              >
                {loading && (
                  <svg
                    className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      stroke="currentColor"
                      strokeWidth="4"
                      cx="12"
                      cy="12"
                      r="10"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
              </ButtonDefault>
              <ButtonDefault
                label="戻る"
                customClasses={`bg-gray-200  text-gray-800 px-4 py-2  rounded-lg`}
                onClick={onClose}
              />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </header>
  );
};

export default Header;
