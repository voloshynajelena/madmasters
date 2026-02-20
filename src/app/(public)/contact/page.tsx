'use client';

import { useState, useEffect } from 'react';
import { getDictionary } from '@/i18n/dictionaries';
import { PageLayout } from '@/components/layout/page-layout';
import { useContent } from '@/hooks/use-content';

interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  enabled: boolean;
  order: number;
}

export default function ContactPage() {
  const dict = getDictionary('en');
  const { get } = useContent(undefined, 'en');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/social-links')
      .then(res => res.json())
      .then(data => setSocialLinks(data.links || []))
      .catch(err => console.error('Failed to load social links:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          subject: formData.subject || undefined,
          message: formData.message,
          page: '/contact',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to send');
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout locale="en" title="Contact Us" subtitle="Get in touch">
      <div className="py-16">
        <div className="container-section">
          <div className="max-w-5xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-8 sm:gap-12">
              {/* Contact Info */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Mad Masters</h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <a href={`mailto:${get('contact.email', 'madmweb@gmail.com')}`} className="text-gray-600 hover:text-accent transition-colors">
                        {get('contact.email', 'madmweb@gmail.com')}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Working Hours</h3>
                      <p className="text-gray-600">{get('contact.hours_weekday', 'Mon-Thu: 09:00-19:00')}</p>
                      <p className="text-gray-600">{get('contact.hours_friday', 'Fri: 09:00-18:00')}</p>
                    </div>
                  </div>

                  {socialLinks.length > 0 && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Social Media</h3>
                        <div className="flex flex-wrap gap-3 mt-2">
                          {socialLinks.map((link) => (
                            <a
                              key={link.id}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={link.name}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-accent hover:border-accent transition-colors"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d={link.icon} />
                              </svg>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Form */}
              <div>
                {submitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 sm:p-8 text-center">
                    <svg className="w-10 sm:w-12 h-10 sm:h-12 text-green-500 mx-auto mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-2">Thank you!</h3>
                    <p className="text-green-700 text-sm sm:text-base">Your message has been sent. We'll get back to you soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <input
                        type="text"
                        placeholder="Name *"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-accent bg-white text-gray-900 text-sm sm:text-base"
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-accent bg-white text-gray-900 text-sm sm:text-base"
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email *"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-accent bg-white text-gray-900 text-sm sm:text-base"
                    />
                    <input
                      type="text"
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-accent bg-white text-gray-900 text-sm sm:text-base"
                    />
                    <textarea
                      placeholder="Your message *"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-accent bg-white resize-none text-gray-900 text-sm sm:text-base"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-accent text-white text-sm tracking-wider rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
