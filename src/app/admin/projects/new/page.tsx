'use client';

import Link from 'next/link';
import { ProjectForm } from '@/components/admin/projects/project-form';

export default function NewProjectPage() {
  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/projects" className="text-white/60 hover:text-white text-sm mb-2 inline-block">
          &larr; Back to Projects
        </Link>
        <h1 className="text-2xl font-bold text-white">New Project</h1>
        <p className="text-white/60 mt-1">Add a new project to the knowledge base</p>
      </div>

      <ProjectForm mode="create" />
    </div>
  );
}
