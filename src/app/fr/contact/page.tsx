'use client';

import { useState } from 'react';
import { getDictionary } from '@/i18n/dictionaries';
import { PageLayout } from '@/components/layout/page-layout';

export default function ContactPage() {
  const dict = getDictionary('fr');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
  };

  return (
    <PageLayout locale="fr" title="Contactez-nous" subtitle="Prenez contact">
      <div className="py-16">
        <div className="container-section">
          <div className="max-w-2xl mx-auto">
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 sm:p-8 text-center">
                <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-2">Merci!</h3>
                <p className="text-green-700 text-sm sm:text-base">Votre message a été envoyé.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <input
                  type="text"
                  placeholder="Nom *"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-accent bg-white text-gray-900 text-sm sm:text-base"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-accent bg-white text-gray-900 text-sm sm:text-base"
                />
                <textarea
                  placeholder="Votre message *"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-accent bg-white resize-none text-gray-900 text-sm sm:text-base"
                />
                <button type="submit" className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-accent text-white text-sm tracking-wider rounded-lg hover:bg-accent/90 transition-colors">
                  Envoyer le message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
