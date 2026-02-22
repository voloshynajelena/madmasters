'use client';

// Technology icon mapping using simple SVG icons
const techIcons: Record<string, string> = {
  // Frontend
  'next.js': '▲',
  'nextjs': '▲',
  'react': '⚛',
  'vue': '🟢',
  'vue.js': '🟢',
  'angular': '🅰',
  'svelte': '🔥',
  'typescript': '𝗧𝗦',
  'javascript': '𝗝𝗦',
  'tailwind': '🎨',
  'tailwind css': '🎨',

  // Backend
  'node.js': '🟩',
  'nodejs': '🟩',
  'node': '🟩',
  'nestjs': '🐱',
  'express': '⚡',
  'python': '🐍',
  'django': '🎸',
  'fastapi': '⚡',
  'ruby': '💎',
  'rails': '🛤',
  'go': '🐹',
  'golang': '🐹',
  'rust': '🦀',
  'java': '☕',
  'spring': '🌱',
  'php': '🐘',
  'laravel': '🔺',
  '.net': '🔷',
  'c#': '🔷',

  // Database
  'postgresql': '🐘',
  'postgres': '🐘',
  'mysql': '🐬',
  'mongodb': '🍃',
  'mongo': '🍃',
  'redis': '🔴',
  'firebase': '🔥',
  'firebase firestore': '🔥',
  'firestore': '🔥',
  'supabase': '⚡',
  'prisma': '◮',
  'sqlite': '📦',
  'dynamodb': '📊',

  // Cloud & Hosting
  'vercel': '▲',
  'netlify': '💚',
  'aws': '☁',
  'amazon': '☁',
  'gcp': '☁',
  'google cloud': '☁',
  'azure': '☁',
  'heroku': '💜',
  'digitalocean': '💧',
  'cloudflare': '🟠',
  'docker': '🐳',
  'kubernetes': '☸',

  // Auth
  'firebase auth': '🔐',
  'auth0': '🔐',
  'clerk': '🔐',
  'nextauth': '🔐',
  'oauth': '🔐',
  'jwt': '🔑',
  'mock auth': '🔐',

  // CI/CD
  'github actions': '⚙',
  'gitlab ci': '🦊',
  'jenkins': '🎩',
  'circleci': '⭕',
  'travis': '🔧',

  // Analytics & Monitoring
  'google analytics': '📊',
  'mixpanel': '📈',
  'amplitude': '📉',
  'sentry': '🐛',
  'datadog': '🐕',
  'newrelic': '📡',
  'platform logs': '📋',
  'logflare': '📋',

  // Other
  'graphql': '◈',
  'rest': '🔗',
  'stripe': '💳',
  'twilio': '📱',
  'sendgrid': '📧',
  'cloudinary': '☁',
  'sanity': '📝',
  'contentful': '📝',
  'shopify': '🛒',
  'wordpress': '📰',
  'woocommerce': '🛒',
};

export function getTechIcon(techName: string): string {
  const normalized = techName.toLowerCase().trim();
  return techIcons[normalized] || '🔧';
}

interface TechIconProps {
  name: string;
  showName?: boolean;
  className?: string;
}

export function TechIcon({ name, showName = true, className = '' }: TechIconProps) {
  const icon = getTechIcon(name);

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="text-sm">{icon}</span>
      {showName && <span>{name}</span>}
    </span>
  );
}

export function TechBadge({ name, className = '' }: { name: string; className?: string }) {
  const icon = getTechIcon(name);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 bg-accent/20 text-accent rounded text-xs ${className}`}>
      <span>{icon}</span>
      <span>{name}</span>
    </span>
  );
}
