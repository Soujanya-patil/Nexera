import PageHeader from "./PageHeader";
import { LAST_UPDATED, LAST_UPDATED_ISO } from "../lib/lastUpdated";

/**
 * The legal pages' frame (Privacy Policy, Terms of Use): the plain pages' compact header (breadcrumbs,
 * the h1, "Last updated" with the commit's date), then the text on white at a comfortable measure. No
 * image, no motion beyond the header's own. The words are the director's, as given (pages/*.jsx).
 */
export default function LegalPage({ title, crumb, children }) {
  return (
    <div>
      <PageHeader
        eyebrow="Legal"
        crumb={crumb}
        title={title}
        subtitle={
          <>
            Last updated: <time dateTime={LAST_UPDATED_ISO}>{LAST_UPDATED}</time>
          </>
        }
      />
      <section className="bg-white">
        <div className="container-site py-section">
          <div className="max-w-measure text-body text-copy">{children}</div>
        </div>
      </section>
    </div>
  );
}

/** A section: its h2, then its paragraphs and lists. */
export function LegalSection({ title, children }) {
  return (
    <section className="mt-10">
      <h2 className="text-h3 font-semibold text-ink">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

/** A bulleted list. */
export function LegalList({ children }) {
  return <ul className="list-disc space-y-2 pl-5 marker:text-label">{children}</ul>;
}
