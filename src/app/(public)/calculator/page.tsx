'use client';

import { useState } from 'react';
import { getDictionary } from '@/i18n/dictionaries';
import { PageLayout } from '@/components/layout/page-layout';

type ProjectType = 'landing' | 'corporate' | 'ecommerce' | 'webapp';
type DesignOption = 'template' | 'custom' | 'premium';

const projectTypes: Record<ProjectType, { name: string; base: number; description: string }> = {
  landing: { name: 'Landing Page', base: 500, description: 'Single page website for campaigns' },
  corporate: { name: 'Corporate Website', base: 1500, description: 'Multi-page business website' },
  ecommerce: { name: 'E-commerce Store', base: 3000, description: 'Online shop with payments' },
  webapp: { name: 'Web Application', base: 5000, description: 'Custom web application' },
};

const designOptions: Record<DesignOption, { name: string; multiplier: number }> = {
  template: { name: 'Template-based', multiplier: 1 },
  custom: { name: 'Custom Design', multiplier: 1.5 },
  premium: { name: 'Premium Design', multiplier: 2 },
};

const features = [
  { id: 'responsive', name: 'Responsive Design', price: 0, included: true },
  { id: 'seo', name: 'SEO Optimization', price: 300, included: false },
  { id: 'cms', name: 'CMS Integration', price: 500, included: false },
  { id: 'multilang', name: 'Multi-language', price: 400, included: false },
  { id: 'analytics', name: 'Analytics Setup', price: 150, included: false },
  { id: 'speed', name: 'Speed Optimization', price: 200, included: false },
  { id: 'support', name: '1 Year Support', price: 600, included: false },
];

export default function CalculatorPage() {
  const dict = getDictionary('en');

  const [projectType, setProjectType] = useState<ProjectType>('corporate');
  const [design, setDesign] = useState<DesignOption>('custom');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['responsive']);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((f) => f !== featureId)
        : [...prev, featureId]
    );
  };

  const calculatePrice = () => {
    const base = projectTypes[projectType].base;
    const designMultiplier = designOptions[design].multiplier;
    const featuresPrice = features
      .filter((f) => selectedFeatures.includes(f.id) && !f.included)
      .reduce((sum, f) => sum + f.price, 0);

    return Math.round(base * designMultiplier + featuresPrice);
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.email) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'calculator',
          name: leadForm.name,
          email: leadForm.email,
          phone: leadForm.phone,
          message: leadForm.message,
          data: {
            projectType,
            projectTypeName: projectTypes[projectType].name,
            design,
            designName: designOptions[design].name,
            selectedFeatures,
            estimatedPrice: calculatePrice(),
          },
          locale: 'en',
          page: '/calculator',
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout locale="en" title="Price Calculator" subtitle="Estimate your project cost">
      <div className="py-16">
        <div className="container-section">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Options */}
              <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                {/* Project Type */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Project Type</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {(Object.keys(projectTypes) as ProjectType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setProjectType(type)}
                        className={`p-4 rounded-lg text-left transition-colors ${
                          projectType === type
                            ? 'bg-accent text-white'
                            : 'bg-white border border-gray-300 text-gray-900 hover:border-accent'
                        }`}
                      >
                        <div className="font-semibold">{projectTypes[type].name}</div>
                        <div className={`text-xs mt-1 ${projectType === type ? 'text-white/70' : 'text-gray-500'}`}>
                          {projectTypes[type].description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Design Option */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Design</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    {(Object.keys(designOptions) as DesignOption[]).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setDesign(opt)}
                        className={`p-3 sm:p-4 rounded-lg text-center text-sm sm:text-base transition-colors ${
                          design === opt
                            ? 'bg-accent text-white'
                            : 'bg-white border border-gray-300 text-gray-900 hover:border-accent'
                        }`}
                      >
                        {designOptions[opt].name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Additional Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {features.map((feature) => (
                      <button
                        key={feature.id}
                        onClick={() => !feature.included && toggleFeature(feature.id)}
                        disabled={feature.included}
                        className={`p-4 rounded-lg text-left flex items-center gap-3 transition-colors ${
                          selectedFeatures.includes(feature.id)
                            ? 'bg-accent text-white'
                            : feature.included
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border border-gray-300 text-gray-900 hover:border-accent'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center ${
                            selectedFeatures.includes(feature.id)
                              ? 'bg-white border-white'
                              : 'border-current'
                          }`}
                        >
                          {selectedFeatures.includes(feature.id) && (
                            <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{feature.name}</div>
                          {!feature.included && (
                            <div className={`text-xs ${selectedFeatures.includes(feature.id) ? 'text-white/70' : 'text-gray-500'}`}>
                              +${feature.price}
                            </div>
                          )}
                          {feature.included && (
                            <div className="text-xs text-gray-400">Included</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-900 text-white rounded-lg p-4 sm:p-6 lg:sticky lg:top-24">
                  <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Estimated Price</h3>

                  <div className="text-3xl sm:text-4xl font-bold text-accent mb-4 sm:mb-6">
                    ${calculatePrice().toLocaleString()}
                  </div>

                  <div className="text-gray-400 text-sm space-y-2 mb-6">
                    <div className="flex justify-between">
                      <span>Base ({projectTypes[projectType].name})</span>
                      <span>${projectTypes[projectType].base}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Design ({designOptions[design].name})</span>
                      <span>x{designOptions[design].multiplier}</span>
                    </div>
                    {features
                      .filter((f) => selectedFeatures.includes(f.id) && !f.included)
                      .map((f) => (
                        <div key={f.id} className="flex justify-between">
                          <span>{f.name}</span>
                          <span>+${f.price}</span>
                        </div>
                      ))}
                  </div>

                  {!showLeadForm && !submitted && (
                    <button
                      onClick={() => setShowLeadForm(true)}
                      className="block w-full py-3 bg-accent text-white text-center font-medium rounded hover:bg-accent/90 transition-colors"
                    >
                      Get a Quote
                    </button>
                  )}

                  {showLeadForm && !submitted && (
                    <form onSubmit={handleSubmitLead} className="space-y-3">
                      <input
                        type="text"
                        placeholder="Your name *"
                        value={leadForm.name}
                        onChange={(e) => setLeadForm((p) => ({ ...p, name: e.target.value }))}
                        className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-white focus:outline-none text-sm"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email *"
                        value={leadForm.email}
                        onChange={(e) => setLeadForm((p) => ({ ...p, email: e.target.value }))}
                        className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-white focus:outline-none text-sm"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm((p) => ({ ...p, phone: e.target.value }))}
                        className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-white focus:outline-none text-sm"
                      />
                      <textarea
                        placeholder="Any additional details..."
                        value={leadForm.message}
                        onChange={(e) => setLeadForm((p) => ({ ...p, message: e.target.value }))}
                        className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-white focus:outline-none text-sm h-20"
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-accent text-white font-medium rounded hover:bg-accent/90 transition-colors disabled:opacity-50"
                      >
                        {submitting ? 'Sending...' : 'Send Quote Request'}
                      </button>
                    </form>
                  )}

                  {submitted && (
                    <div className="text-center py-4">
                      <div className="text-green-400 text-2xl mb-2">✓</div>
                      <p className="text-white font-medium">Quote Request Sent!</p>
                      <p className="text-white/60 text-sm mt-1">We'll get back to you within 24 hours.</p>
                    </div>
                  )}

                  <p className="text-white/40 text-xs text-center mt-4">
                    * This is an estimate. Final price may vary based on requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
