'use client';
import React from 'react';
import Particleground from '../Particleground';
import { useTranslations } from 'next-intl';

const TermsOfUse = () => {
  const t = useTranslations('TermsOfUse');

  return (
    <div className="mx-auto max-w-[480px] flex">
      <Particleground />
      <div className="px-3 z-10">
        <div className="pt-7">
          <div className="flex items-center justify-center">
            <p className="mb-2.5 text-[24px] leading-[28px] text-white normal">
              {t('Title')}
            </p>
          </div>
          
          <div className="space-y-6 text-white/80 leading-[22px] text-[15px] mt-5">
            <section>
              <p>{t('Introduction')}</p>
            </section>

            <section>
              <h2 className="text-white font-semibold mt-4">{t('Article1')}</h2>
              <p>{t('Article1_1')}</p>
              <p>{t('Article1_2')}</p>
            </section>

            <section>
              <h2 className="text-white font-semibold mt-4">{t('Article2')}</h2>
              <p>{t('Article2_1')}</p>
              <p className="mt-2">{t('Article2_2')}</p>
            </section>

            <section>
              <h2 className="text-white font-semibold mt-4">{t('Article3')}</h2>
              <p>{t('Article3_1')}</p>
              <p className="mt-2">{t('Article3_2')}</p>
              <p className="mt-2">{t('Article3_3')}</p>
            </section>

            <section>
              <h2 className="text-white font-semibold mt-4">{t('Article4')}</h2>
              <p>{t('Article4_1')}</p>
              <p className="mt-2">{t('Article4_2')}</p>
              <p className="mt-2">{t('Article4_3')}</p>
            </section>

            <section>
              <h2 className="text-white font-semibold mt-4">{t('Article5')}</h2>
              <p>{t('Article5_1')}</p>
              <p className="mt-1">{t('Article5_2')}</p>
              <p>{t('Article5_3')}</p>
              <p>{t('Article5_4')}</p>
              <p>{t('Article5_5')}</p>
            </section>

            <section>
              <h2 className="text-white font-semibold mt-4">{t('Article6')}</h2>
              <p>{t('Article6_1')}</p>
              <p className="mt-2">{t('Article6_2')}</p>
              <p className="mt-2">{t('Article6_3')}</p>
            </section>

            <section>
              <h2 className="text-white font-semibold mt-4">{t('Article7')}</h2>
              <p>{t('Article7_1')}</p>
              <p className="mt-2">{t('Article7_2')}</p>
            </section>

            <section>
              <h2 className="text-white font-semibold mt-4">{t('Article8')}</h2>
              <p>{t('Article8_1')}</p>
            </section>

            <section>
              <h2 className="text-white font-semibold mt-4">{t('Article9')}</h2>
              <p>{t('Article9_1')} {t('Article9_2')}</p>
            </section>

            <section className="pb-4">
              <p className="italic text-normal mt-8">
                {t('LastUpdated')}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse; 