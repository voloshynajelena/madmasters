import Link from 'next/link';
import { CaseStudyForm } from '@/components/admin/case-studies/case-study-form';

export default function NewCaseStudyPage() {
  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/case-studies"
          className="text-white/60 hover:text-white text-sm mb-2 inline-block"
        >
          ← Back to Case Studies
        </Link>
        <h1 className="text-2xl font-bold text-white">New Case Study</h1>
      </div>

      <CaseStudyForm mode="create" />
    </div>
  );
}
