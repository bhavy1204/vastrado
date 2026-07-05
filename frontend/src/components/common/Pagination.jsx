import { CaretLeft, CaretRight } from "@phosphor-icons/react";

/**
 * Pagination
 *
 * Designed to plug directly into usePagination():
 *   const { page, totalPages, nextPage, prevPage, goToPage, hasNextPage, hasPrevPage } = usePagination();
 *   <Pagination page={page} totalPages={totalPages} onNext={nextPage} onPrev={prevPage}
 *               onGoTo={goToPage} hasNextPage={hasNextPage} hasPrevPage={hasPrevPage} />
 */

export default function Pagination({
  page,
  totalPages,
  onNext,
  onPrev,
  onGoTo,
  hasNextPage,
  hasPrevPage,
  siblingCount = 1,
}) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = getPageRange(page, totalPages, siblingCount);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5"
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={!hasPrevPage}
        aria-label="Previous page"
        className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-border text-text-secondary hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <CaretLeft size={16} />
      </button>

      {pages.map((entry, idx) =>
        entry === "…" ? (
          <span
            key={`ellipsis-${idx}`}
            className="px-1 text-text-muted select-none"
          >
            …
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => onGoTo?.(entry)}
            aria-current={entry === page ? "page" : undefined}
            className={[
              "inline-flex items-center justify-center h-9 min-w-9 px-2 rounded-md text-sm font-medium",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              entry === page
                ? "bg-primary text-text-on-primary"
                : "text-text-secondary hover:bg-surface border border-transparent",
            ].join(" ")}
          >
            {entry}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={!hasNextPage}
        aria-label="Next page"
        className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-border text-text-secondary hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <CaretRight size={16} />
      </button>
    </nav>
  );
}

/** Builds a compact page list like: 1 … 4 5 [6] 7 8 … 12 */
function getPageRange(current, total, siblingCount) {
  const totalNumbers = siblingCount * 2 + 5; // first, last, current, 2 ellipses

  if (total <= totalNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, total);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;

  const range = [];
  range.push(1);
  if (showLeftEllipsis) range.push("…");

  for (
    let i = Math.max(leftSibling, 2);
    i <= Math.min(rightSibling, total - 1);
    i++
  ) {
    range.push(i);
  }

  if (showRightEllipsis) range.push("…");
  range.push(total);

  return range;
}



