'use client';

import React, { useEffect } from 'react';
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import '@/css/fonts-optimized.css';
import '@suiet/wallet-kit/style.css';
import '@/css/userWalletButton.css';
import '@/css/progressbar.css';
import '@/css/shiny.css';
import "@/css/slidershow.css";
import "@/css/rotating.css";
import "@/css/custom_scroll.css";
import "@/css/chart.css";
import '@/css/confetti.css'
import '@/css/starBackground.css'
import '@/css/bongocat.css'
import '@/css/faqsupport.css'
import '@/css/blinkingdot.css'
import {
  WalletProvider,
  SuietWallet,
  SuiWallet,
  SuiTestnetChain,
  SurfWallet,
} from '@suiet/wallet-kit';
import { store } from '@/store/store';
import { Provider } from 'react-redux';
import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider } from '@/context/AuthContext';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';

export default function ClientRootLayout({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, any>;
}) {
  // Token validation now handled by the AuthProvider
  // No need for duplicate validation here

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <WalletProvider
        defaultWallets={[
          SuiWallet,
          SuietWallet,
          SurfWallet,
        ]}
        chains={[SuiTestnetChain]}
      >
        <Provider store={store}>
          <AuthProvider>
            <ServiceWorkerRegistration />
            {children}
          </AuthProvider>
        </Provider>
      </WalletProvider>
    </NextIntlClientProvider>
  );
}
