"use client";

import { useState } from "react";
import clsx from "clsx";

/** FilterTabs — pill tabs, active one dark. Presentational (highlights on click,
 * no real filtering yet). Figma: Packages page tabs (84:1448). */
type FilterTabsProps = {
  tabs: string[];
  defaultTab?: string;
  onChange?: (tab: string) => void;
  className?: string;
};

export default function FilterTabs({
  tabs,
  defaultTab,
  onChange,
  className,
}: FilterTabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]);

  return (
    <div className={clsx("flex flex-wrap gap-2", className)}>
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => {
            setActive(tab);
            onChange?.(tab);
          }}
          className={clsx(
            "rounded p-3 text-lg font-semibold tracking-[-0.04em] transition-colors",
            active === tab
              ? "bg-foreground text-background"
              : "bg-background text-foreground hover:bg-border/60",
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
