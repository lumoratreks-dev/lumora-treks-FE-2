import clsx from "clsx";

/** Inline error state for a failed RTK Query, with an optional retry. */
type QueryErrorProps = {
  message?: string;
  onRetry?: () => void;
  className?: string;
};

export default function QueryError({
  message = "Something went wrong.",
  onRetry,
  className,
}: QueryErrorProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center gap-4 py-16 text-center",
        className,
      )}
    >
      <p className="font-body-alt text-lg tracking-[-0.04em] text-text-secondary">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-foreground px-5 py-2.5 font-body-alt text-base font-medium tracking-[-0.03em] text-background transition-transform hover:scale-[1.03] active:scale-95"
        >
          Try again
        </button>
      )}
    </div>
  );
}
