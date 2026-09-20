export default function PageHeader({ eyebrow, title, subtitle }) {
  return (
    <section className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        {eyebrow && (
          <p className="text-sm text-signal font-medium mb-3">{eyebrow}</p>
        )}
        <h1 className="font-serif text-3xl md:text-4xl font-semibold max-w-2xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-ice/75 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
