import { cn } from "@/lib/utils";
import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";

// The indicator's slide: 0.25 s, settling with the faintest overshoot (what the original 0.25 s spring
// with bounce 0.05 looked like).
const SLIDE = "transform 250ms cubic-bezier(0.25, 1.06, 0.5, 1)";

export default function AnimatedTabs({
  tabs,
  activeTab: controlledActiveTab,
  defaultTab,
  onChange,
  variant = "underline",
  layoutId: customLayoutId,
  className
}) {
  const generatedId = useId();
  const indicator = useRef(null);
  const lastRect = useRef(null);
  const layoutId = customLayoutId ?? `animated-tabs-${generatedId}`;

  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultTab ?? tabs[0]?.id ?? ""
  );

  const isControlled = controlledActiveTab !== undefined;
  const activeTab = isControlled ? controlledActiveTab : internalActiveTab;

  const handleTabChange = useCallback(
    (tabId) => {
      if (!isControlled) {
        setInternalActiveTab(tabId);
      }
      onChange?.(tabId);
    },
    [isControlled, onChange]
  );

  const handleKeyDown = useCallback(
    (event, currentIndex) => {
      let newIndex = currentIndex;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        newIndex = (currentIndex + 1) % tabs.length;
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        event.preventDefault();
        newIndex = 0;
      } else if (event.key === "End") {
        event.preventDefault();
        newIndex = tabs.length - 1;
      } else {
        return;
      }

      const newTab = tabs[newIndex];
      if (newTab) {
        handleTabChange(newTab.id);
        const tabElement = document.getElementById(
          `${layoutId}-tab-${newTab.id}`
        );
        tabElement?.focus();
      }
    },
    [tabs, handleTabChange, layoutId]
  );

  const baseContainerStyles = cn(
    "relative inline-flex",
    variant === "underline" && "gap-1 border-border border-b",
    variant === "pill" && "gap-1 rounded-full bg-muted p-1",
    variant === "segment" && "gap-0 rounded-lg bg-muted p-1"
  );

  const getTabStyles = (isActive) =>
    cn(
      "relative z-10 flex cursor-pointer items-center justify-center gap-2 px-4 py-2 font-medium text-sm transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      variant === "underline" && [
        "rounded-t-md",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      ],
      variant === "pill" && [
        "rounded-full",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      ],
      variant === "segment" && [
        "flex-1 rounded-md",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      ]
    );

  // FLIP: the indicator lives inside the active tab (so the markup is right without JavaScript); when
  // the active tab changes it starts transformed to where the previous one was and slides into place.
  useLayoutEffect(() => {
    const el = indicator.current;
    if (!el) return;
    // Relative to the tab list, so scrolling between two changes doesn't matter.
    const box = el.closest('[role="tablist"]').getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const rect = { left: r.left - box.left, top: r.top - box.top, width: r.width, height: r.height };
    const prev = lastRect.current;
    lastRect.current = rect;
    if (!prev || !rect.width || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.style.transition = "none";
    el.style.transformOrigin = "0 0";
    el.style.transform = `translate(${prev.left - rect.left}px, ${prev.top - rect.top}px) scale(${prev.width / rect.width}, ${prev.height / rect.height || 1})`;
    el.getBoundingClientRect(); // commit the start position
    el.style.transition = SLIDE;
    el.style.transform = "";
  }, [activeTab]);

  const getIndicatorStyles = () =>
    cn(
      "absolute",
      variant === "underline" && "right-0 -bottom-px left-0 h-0.5 bg-brand",
      variant === "pill" &&
        "inset-0 rounded-full border border-border bg-background shadow-sm",
      variant === "segment" &&
        "inset-0 rounded-md border border-border bg-background shadow-sm"
    );

  return (
    <div
      aria-label="Tabs"
      className={cn(baseContainerStyles, className)}
      role="tablist"
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            aria-selected={isActive}
            className={getTabStyles(isActive)}
            id={`${layoutId}-tab-${tab.id}`}
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            role="tab"
            tabIndex={isActive ? 0 : -1}
            type="button"
          >
            {isActive && (
              <span ref={indicator} className={getIndicatorStyles()} />
            )}
            {tab.icon ? (
              <span className="relative z-10">{tab.icon}</span>
            ) : null}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
