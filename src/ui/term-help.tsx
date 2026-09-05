"use client";

import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import type { Locale } from "@/src/ui/i18n";
import { glossaryEntry, type TermId } from "@/src/ui/glossary";

type OpenState = { termId: TermId; kind: "transient" | "pinned" } | null;
type Position = { left: number; top: number; width: number };

const clampPosition = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

type TermHelpContextValue = {
  locale: Locale;
  open: OpenState;
  setOpen: (value: OpenState) => void;
};

const TermHelpContext = createContext<TermHelpContextValue | null>(null);

export function TermHelpProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const [open, setOpen] = useState<OpenState>(null);
  return <TermHelpContext.Provider value={{ locale, open, setOpen }}>{children}</TermHelpContext.Provider>;
}

export function TermHelp({ termId, className }: { termId: TermId; className?: string }) {
  const context = useContext(TermHelpContext);
  const [position, setPosition] = useState<Position | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLSpanElement>(null);
  const popoverId = useId();
  if (!context) throw new Error("TermHelp must be rendered inside TermHelpProvider");

  const entry = glossaryEntry(termId);
  const isOpen = context.open?.termId === termId;
  const isPinned = isOpen && context.open?.kind === "pinned";

  const updatePosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const width = Math.min(360, window.innerWidth - 16);
    const left = clampPosition(rect.left, 8, window.innerWidth - width - 8);
    const preferredTop = rect.bottom + 8;
    const popoverHeight = popoverRef.current?.getBoundingClientRect().height ?? 120;
    const top = preferredTop + popoverHeight <= window.innerHeight - 8
      ? preferredTop
      : clampPosition(rect.top - popoverHeight - 8, 8, window.innerHeight - popoverHeight - 8);
    setPosition({ left, top, width });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;
    updatePosition();
  }, [isOpen, updatePosition, context.locale]);

  useEffect(() => {
    if (!isOpen) return;
    const reposition = () => updatePosition();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (isPinned && !buttonRef.current?.contains(target) && !popoverRef.current?.contains(target)) context.setOpen(null);
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") context.setOpen(null);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [isOpen, isPinned, context]);

  const label = (context.locale === "zh-CN" ? "解释: " : "Explain: ") + entry.label[context.locale];
  const style: CSSProperties | undefined = position
    ? { left: position.left, top: position.top, maxWidth: position.width }
    : undefined;

  return (
    <span className={"term-help-wrap " + (className ?? "")}>
      <button
        ref={buttonRef}
        type="button"
        data-testid={"term-help-" + termId}
        className="term-help-button"
        aria-label={label}
        aria-expanded={isOpen}
        aria-describedby={isOpen ? popoverId : undefined}
        onMouseEnter={() => { if (!context.open || context.open.kind === "transient") context.setOpen({ termId, kind: "transient" }); }}
        onMouseLeave={() => { if (context.open?.termId === termId && context.open.kind === "transient") context.setOpen(null); }}
        onFocus={() => { if (!context.open || context.open.kind === "transient") context.setOpen({ termId, kind: "transient" }); }}
        onBlur={() => {
          if (context.open?.termId === termId && context.open.kind === "transient") context.setOpen(null);
        }}
        onClick={() => context.setOpen(isPinned ? null : { termId, kind: "pinned" })}
        onKeyDown={(event: ReactKeyboardEvent<HTMLButtonElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            context.setOpen(isPinned ? null : { termId, kind: "pinned" });
          }
          if (event.key === "Escape") context.setOpen(null);
        }}
      >
        ?
      </button>
      {isOpen && (
        <span ref={popoverRef} id={popoverId} role="tooltip" className={"term-help-popover " + (isPinned ? "is-pinned" : "is-transient")} style={style}>
          <strong>{entry.label[context.locale]}</strong>
          <span>{entry.definition[context.locale]}</span>
          {entry.limitation && <small>{entry.limitation[context.locale]}</small>}
        </span>
      )}
    </span>
  );
}
