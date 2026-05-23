'use client';

import React, { useEffect } from 'react';
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import '@/css/fonts-optimized.css';
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
import '@/css/custom.css'
import { store } from '@/store/store';
import { Provider } from 'react-redux';
import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider } from '@/context/AuthContext';
import { ReferralProvider } from '@/context/ReferralContext';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import { AppKit } from "@/context/appkit";

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
      <AppKit>
        <Provider store={store}>
          <AuthProvider>
            <ReferralProvider>
              <ServiceWorkerRegistration />
              {children}
            </ReferralProvider>
          </AuthProvider>
        </Provider>
      </AppKit>
    </NextIntlClientProvider>
  );
}
