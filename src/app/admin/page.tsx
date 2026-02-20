import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Portfolio"
          count={0}
          href="/admin/portfolio"
          description="Manage portfolio projects"
        />
        <DashboardCard
          title="Case Studies"
          count={0}
          href="/admin/case-studies"
          description="Additional case studies"
        />
        <DashboardCard
          title="Testimonials"
          count={0}
          href="/admin/testimonials"
          description="Client testimonials"
        />
        <DashboardCard
          title="Orders"
          count={0}
          href="/admin/orders"
          description="New inquiries"
          highlight
        />
        <DashboardCard
          title="Fresh Works"
          count={0}
          href="/admin/fresh"
          description="GitHub & App Store"
        />
      </div>

      {/* Recent Orders */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Recent Orders
        </h2>
        <div className="bg-surface rounded-xl p-6 border border-border">
          <p className="text-text-muted text-sm">
            No orders yet. Orders will appear here when visitors submit forms.
          </p>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  count,
  href,
  description,
  highlight,
}: {
  title: string;
  count: number;
  href: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block p-6 rounded-xl transition-all hover:scale-[1.02] ${
        highlight
          ? 'bg-accent text-white border border-accent'
          : 'bg-surface hover:bg-surface-hover border border-border'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-semibold ${highlight ? '' : 'text-foreground'}`}>
          {title}
        </h3>
        <span
          className={`text-2xl font-bold ${
            highlight ? '' : 'text-accent'
          }`}
        >
          {count}
        </span>
      </div>
      <p
        className={`text-sm ${
          highlight ? 'text-white/80' : 'text-text-muted'
        }`}
      >
        {description}
      </p>
    </Link>
  );
}
