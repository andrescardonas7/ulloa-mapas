interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-8 border-b border-brand-border pb-6">
      <h1 className="text-balance text-3xl font-bold text-brand-dark sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-3xl text-pretty text-base leading-relaxed text-brand-muted">
        {description}
      </p>
    </header>
  );
}
