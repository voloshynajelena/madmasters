'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDictionary } from '@/i18n/dictionaries';
import { PageLayout } from '@/components/layout/page-layout';

type ProjectType = 'website' | 'ecommerce' | 'webapp' | 'mobile' | 'marketing' | 'other';
type Budget = 'small' | 'medium' | 'large' | 'enterprise';
type Timeline = 'urgent' | 'normal' | 'flexible';

interface FormData {
  projectType: ProjectType | '';
  projectDescription: string;
  features: string[];
  hasDesign: boolean;
  hasContent: boolean;
  referenceUrls: string;
  budget: Budget | '';
  timeline: Timeline | '';
  startDate: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  howDidYouFindUs: string;
}

const initialFormData: FormData = {
  projectType: '',
  projectDescription: '',
  features: [],
  hasDesign: false,
  hasContent: false,
  referenceUrls: '',
  budget: '',
  timeline: '',
  startDate: '',
  name: '',
  email: '',
  phone: '',
  company: '',
  howDidYouFindUs: '',
};

const projectTypes: { value: ProjectType; label: string; description: string }[] = [
  { value: 'website', label: 'Site Web', description: 'Site corporate, portfolio ou landing page' },
  { value: 'ecommerce', label: 'E-commerce', description: 'Boutique en ligne avec paiements' },
  { value: 'webapp', label: 'Application Web', description: 'Logiciel web personnalisé' },
  { value: 'mobile', label: 'Application Mobile', description: 'Application iOS et/ou Android' },
  { value: 'marketing', label: 'Marketing', description: 'SEO, publicité, réseaux sociaux' },
  { value: 'other', label: 'Autre', description: 'Quelque chose d\'unique' },
];

const featureOptions = [
  'Authentification',
  'Paiement en ligne',
  'Tableau de bord admin',
  'CMS / Gestion de contenu',
  'Analytique & Rapports',
  'Notifications email',
  'Intégration API',
  'Support multilingue',
  'Recherche',
  'Réseaux sociaux',
];

const budgetRanges: { value: Budget; label: string; range: string }[] = [
  { value: 'small', label: 'Débutant', range: '2 000 € - 5 000 €' },
  { value: 'medium', label: 'Professionnel', range: '5 000 € - 15 000 €' },
  { value: 'large', label: 'Business', range: '15 000 € - 50 000 €' },
  { value: 'enterprise', label: 'Entreprise', range: '50 000 €+' },
];

const timelineOptions: { value: Timeline; label: string; description: string }[] = [
  { value: 'urgent', label: 'Urgent', description: 'Moins d\'un mois' },
  { value: 'normal', label: 'Standard', description: '1-3 mois' },
  { value: 'flexible', label: 'Flexible', description: '3+ mois' },
];

export default function BriefPageFr() {
  const router = useRouter();
  const dict = getDictionary('fr');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const totalSteps = 4;

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.projectType !== '';
      case 2: return true;
      case 3: return formData.budget !== '' && formData.timeline !== '';
      case 4: return formData.name.trim() !== '' && formData.email.trim() !== '';
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'brief',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.projectDescription,
          data: {
            projectType: formData.projectType,
            features: formData.features,
            hasDesign: formData.hasDesign,
            hasContent: formData.hasContent,
            referenceUrls: formData.referenceUrls,
            budget: formData.budget,
            timeline: formData.timeline,
            startDate: formData.startDate,
            company: formData.company,
            howDidYouFindUs: formData.howDidYouFindUs,
          },
          locale: 'fr',
          page: '/fr/brief',
        }),
      });

      if (!res.ok) throw new Error('Failed to submit');
      setSuccess(true);
    } catch (err) {
      setError('Échec de l\'envoi. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <PageLayout locale="fr" title="Brief Envoyé" subtitle="Merci pour votre demande">
        <div className="py-20">
          <div className="container-section max-w-2xl mx-auto text-center">
            <div className="bg-green-500/20 text-green-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-4">Brief Reçu!</h2>
            <p className="text-primary/60 mb-8">
              Merci pour votre brief détaillé. Nous examinerons vos besoins et vous recontacterons dans les 24 heures.
            </p>
            <button
              onClick={() => router.push('/fr')}
              className="px-8 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout locale="fr" title="Brief Projet" subtitle="Parlez-nous de votre projet">
      <div className="py-12">
        <div className="container-section max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map(s => (
                <div
                  key={s}
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-medium transition-colors ${
                    s === step ? 'bg-accent text-white' : s < step ? 'bg-green-500 text-white' : 'bg-primary/10 text-primary/40'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-primary/50 px-2">
              <span>Projet</span>
              <span>Fonctionnalités</span>
              <span>Budget</span>
              <span>Contact</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-primary">Quel type de projet est-ce?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => updateField('projectType', type.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      formData.projectType === type.value ? 'border-accent bg-accent/10' : 'border-primary/10 hover:border-primary/30'
                    }`}
                  >
                    <div className="font-medium text-primary">{type.label}</div>
                    <div className="text-sm text-primary/60">{type.description}</div>
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-primary/70 text-sm mb-2">Décrivez brièvement votre projet</label>
                <textarea
                  value={formData.projectDescription}
                  onChange={e => updateField('projectDescription', e.target.value)}
                  className="w-full border border-primary/20 rounded-lg px-4 py-3 text-primary focus:border-accent focus:outline-none h-32"
                  placeholder="Que souhaitez-vous créer? Quel problème résout-il?"
                />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-primary">Quelles fonctionnalités avez-vous besoin?</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {featureOptions.map(feature => (
                  <button
                    key={feature}
                    onClick={() => toggleFeature(feature)}
                    className={`p-3 rounded-lg border text-sm text-left transition-colors ${
                      formData.features.includes(feature) ? 'border-accent bg-accent/10 text-primary' : 'border-primary/10 text-primary/70 hover:border-primary/30'
                    }`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer ${formData.hasDesign ? 'border-accent bg-accent/10' : 'border-primary/10'}`}>
                  <input type="checkbox" checked={formData.hasDesign} onChange={e => updateField('hasDesign', e.target.checked)} className="w-5 h-5" />
                  <div>
                    <div className="font-medium text-primary">J'ai des designs prêts</div>
                    <div className="text-sm text-primary/60">Fichiers Figma, Sketch ou PSD</div>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer ${formData.hasContent ? 'border-accent bg-accent/10' : 'border-primary/10'}`}>
                  <input type="checkbox" checked={formData.hasContent} onChange={e => updateField('hasContent', e.target.checked)} className="w-5 h-5" />
                  <div>
                    <div className="font-medium text-primary">J'ai du contenu prêt</div>
                    <div className="text-sm text-primary/60">Texte, images, vidéos</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-primary mb-4">Quel est votre budget?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {budgetRanges.map(budget => (
                    <button
                      key={budget.value}
                      onClick={() => updateField('budget', budget.value)}
                      className={`p-4 rounded-lg border-2 text-left transition-colors ${
                        formData.budget === budget.value ? 'border-accent bg-accent/10' : 'border-primary/10 hover:border-primary/30'
                      }`}
                    >
                      <div className="font-medium text-primary">{budget.label}</div>
                      <div className="text-accent font-semibold">{budget.range}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary mb-4">Quel est votre délai?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {timelineOptions.map(timeline => (
                    <button
                      key={timeline.value}
                      onClick={() => updateField('timeline', timeline.value)}
                      className={`p-4 rounded-lg border-2 text-center transition-colors ${
                        formData.timeline === timeline.value ? 'border-accent bg-accent/10' : 'border-primary/10 hover:border-primary/30'
                      }`}
                    >
                      <div className="font-medium text-primary">{timeline.label}</div>
                      <div className="text-sm text-primary/60">{timeline.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-primary">Comment pouvons-nous vous contacter?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-primary/70 text-sm mb-2">Nom *</label>
                  <input type="text" value={formData.name} onChange={e => updateField('name', e.target.value)}
                    className="w-full border border-primary/20 rounded-lg px-4 py-3 text-primary focus:border-accent focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-primary/70 text-sm mb-2">Entreprise</label>
                  <input type="text" value={formData.company} onChange={e => updateField('company', e.target.value)}
                    className="w-full border border-primary/20 rounded-lg px-4 py-3 text-primary focus:border-accent focus:outline-none" />
                </div>
                <div>
                  <label className="block text-primary/70 text-sm mb-2">Email *</label>
                  <input type="email" value={formData.email} onChange={e => updateField('email', e.target.value)}
                    className="w-full border border-primary/20 rounded-lg px-4 py-3 text-primary focus:border-accent focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-primary/70 text-sm mb-2">Téléphone</label>
                  <input type="tel" value={formData.phone} onChange={e => updateField('phone', e.target.value)}
                    className="w-full border border-primary/20 rounded-lg px-4 py-3 text-primary focus:border-accent focus:outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-12 pt-6 border-t border-primary/10">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 1}
              className="px-6 py-3 text-primary/60 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              ← Retour
            </button>
            {step < totalSteps ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
                className="px-8 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Continuer →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={!canProceed() || submitting}
                className="px-8 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {submitting ? 'Envoi...' : 'Envoyer le Brief'}
              </button>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
