'use client';

import { getDictionary } from '@/i18n/dictionaries';
import { PageLayout } from '@/components/layout/page-layout';
import { useContent } from '@/hooks/use-content';

export default function AboutPage() {
  const dict = getDictionary('en');
  const { get } = useContent({ page: 'about', locale: 'en' });

  return (
    <PageLayout
      locale="en"
      title={get('header.title', 'About Mad Masters')}
      subtitle={get('header.subtitle', 'Web Studio')}
    >
      <div className="py-16">
        <div className="container-section">
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-8 sm:gap-12">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                  {get('content.who_title', 'Who We Are')}
                </h2>
                <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                  {get('content.who_paragraph1', 'Mad Masters is a client-oriented team of professionals. Using modern technologies, responsibility, precise execution of tasks, maximum efficiency and thoughtful Design - this is about Mad Masters.')}
                </p>
                <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                  {get('content.who_paragraph2', 'We masterfully embody your ideas and wishes, as we put all our experience and knowledge into each project. Our employees are a team with solid experience in web technologies.')}
                </p>
                <p className="text-gray-700 text-sm sm:text-base">
                  {get('content.who_paragraph3', 'Mad Masters works in such areas of web technologies as website creation and support, Internet marketing, custom development, layout and much more.')}
                </p>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                  {get('values.title', 'Our Values')}
                </h2>
                <ul className="space-y-3 sm:space-y-4">
                  <li className="flex items-start gap-3 sm:gap-4">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 sm:w-5 h-4 sm:h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{get('values.quality_title', 'Quality First')}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">{get('values.quality_description', 'Every project meets W3C and Google standards')}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 sm:gap-4">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 sm:w-5 h-4 sm:h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{get('values.speed_title', 'Speed & Performance')}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">{get('values.speed_description', 'Optimized for Google PageSpeed and Core Web Vitals')}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 sm:gap-4">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 sm:w-5 h-4 sm:h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{get('values.client_title', 'Client-Oriented')}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">{get('values.client_description', 'Your success is our priority')}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 sm:gap-4">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 sm:w-5 h-4 sm:h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{get('values.innovation_title', 'Innovation')}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">{get('values.innovation_description', 'Modern technologies and creative solutions')}</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
