'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CaseStudyForm } from '@/components/admin/case-studies/case-study-form';

export default function EditCaseStudyPage() {
  const params = useParams();
  const [caseStudy, setCaseStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCaseStudy() {
      try {
        const res = await fetch(`/api/admin/case-studies/${params.id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        // Convert date for form
        if (data.caseStudy.date) {
          data.caseStudy.date = data.caseStudy.date.split('T')[0];
        }

        setCaseStudy(data.caseStudy);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }

    fetchCaseStudy();
  }, [params.id]);

  if (loading) {
    return (
      <div className="text-white/60">Loading...</div>
    );
  }

  if (error || !caseStudy) {
    return (
      <div>
        <Link
          href="/admin/case-studies"
          className="text-white/60 hover:text-white text-sm mb-4 inline-block"
        >
          ← Back to Case Studies
        </Link>
        <div className="text-red-400">{error || 'Case study not found'}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/case-studies"
          className="text-white/60 hover:text-white text-sm mb-2 inline-block"
        >
          ← Back to Case Studies
        </Link>
        <h1 className="text-2xl font-bold text-white">Edit Case Study</h1>
      </div>

      <CaseStudyForm mode="edit" initialData={caseStudy} />
    </div>
  );
}
