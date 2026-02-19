import { getDictionary } from '@/i18n/dictionaries';
import { PageLayout } from '@/components/layout/page-layout';

export const metadata = {
  title: 'About Us',
  description: 'Learn about Mad Masters - a creative web development team',
};

export default function AboutPage() {
  const dict = getDictionary('en');

  return (
    <PageLayout locale="en" title="About Mad Masters" subtitle="Web Studio">
      <div className="py-16">
        <div className="container-section">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
                <p className="text-gray-700 mb-4">
                  Mad Masters is a client-oriented team of professionals. Using modern
                  technologies, responsibility, precise execution of tasks, maximum efficiency
                  and thoughtful Design - this is about Mad Masters.
                </p>
                <p className="text-gray-700 mb-4">
                  We masterfully embody your ideas and wishes, as we put all our experience
                  and knowledge into each project. Our employees are a team with solid
                  experience in web technologies.
                </p>
                <p className="text-gray-700">
                  Mad Masters works in such areas of web technologies as website creation and
                  support, Internet marketing, custom development, layout and much more.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Values</h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Quality First</h3>
                      <p className="text-gray-600 text-sm">Every project meets W3C and Google standards</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Speed & Performance</h3>
                      <p className="text-gray-600 text-sm">Optimized for Google PageSpeed and Core Web Vitals</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Client-Oriented</h3>
                      <p className="text-gray-600 text-sm">Your success is our priority</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Innovation</h3>
                      <p className="text-gray-600 text-sm">Modern technologies and creative solutions</p>
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
