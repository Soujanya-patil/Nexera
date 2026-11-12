import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/**
 * Visible breadcrumbs for the plain heroes (PageHeader, ResourcesHero, /products): small and quiet, on the
 * eyebrow's own row (so the hero is no taller), Home first and the current page last — the same names as
 * the page's BreadcrumbList data (scripts/seo-pages.mjs; route labels in src/seo/routes.js). One line: on a
 * narrow screen the current page's name (the same words as the eyebrow and h1 beside it) is cut short with
 * an ellipsis rather than wrapping. `trail`: [[name, path], …] after Home, the last being this page.
 */
export default function Crumbs({ trail, className = "" }) {
  const items = [["Home", "/"], ...trail];
  return (
    <nav aria-label="Breadcrumb" className={`min-w-0 text-micro leading-none text-paper/75 ${className}`}>
      <ol className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
        {items.map(([name, to], i) => {
          const last = i === items.length - 1;
          return [
            i > 0 && (
              <li key={`sep-${to}`} aria-hidden="true" className="shrink-0">
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
            ),
            last ? (
              <li key={to} aria-current="page" className="min-w-0 truncate text-paper/90">
                {name}
              </li>
            ) : (
              <li key={to} className="shrink-0">
                <Link to={to} className="hit-area hover:text-white focus-visible:text-white">
                  {name}
                </Link>
              </li>
            ),
          ];
        })}
      </ol>
    </nav>
  );
}
