'use client';

import { useState } from 'react';
import { getDictionary } from '@/i18n/dictionaries';
import { PageLayout } from '@/components/layout/page-layout';
import Link from 'next/link';

const projectTypes = {
  landing: { name: 'Page d\'atterrissage', base: 500 },
  corporate: { name: 'Site d\'entreprise', base: 1500 },
  ecommerce: { name: 'Boutique en ligne', base: 3000 },
  webapp: { name: 'Application Web', base: 5000 },
};

export default function CalculatorPage() {
  const dict = getDictionary('fr');
  const [projectType, setProjectType] = useState<keyof typeof projectTypes>('corporate');

  return (
    <PageLayout locale="fr" title="Calculateur de prix" subtitle="Estimez le coût de votre projet">
      <div className="py-16">
        <div className="container-section">
          <div className="max-w-2xl mx-auto">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Type de projet</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(projectTypes) as (keyof typeof projectTypes)[]).map((type) => (
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
                        À partir de ${projectTypes[type].base}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 text-white rounded-lg p-6 text-center">
                <h3 className="text-lg font-bold mb-2">Prix estimé</h3>
                <div className="text-4xl font-bold text-accent mb-4">${projectTypes[projectType].base.toLocaleString()}</div>
                <Link href="/fr/contact" className="inline-block px-8 py-3 bg-accent text-white font-medium rounded hover:bg-accent/90 transition-colors">
                  Demander un devis
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
