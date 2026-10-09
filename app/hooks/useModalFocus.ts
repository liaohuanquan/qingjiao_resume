"use client";
import { useEffect, useLayoutEffect, useRef } from "react";

const modalStack: symbol[] = [];

export function useModalFocus(open: boolean, close: () => void, selector = "[data-modal]") {
  const latestClose = useRef(close);
  useLayoutEffect(() => { latestClose.current = close; }, [close]);
  useEffect(() => {
    if (!open) return;
    const token = Symbol("modal");
    modalStack.push(token);
    const isTop = () => modalStack[modalStack.length - 1] === token;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    let root: HTMLElement | null = null;
    const focusables = () => [...(root?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]') || [])].filter(element => element.getClientRects().length > 0);
    const frame = requestAnimationFrame(() => {
      const elements = document.querySelectorAll<HTMLElement>(selector);
      root = elements[elements.length - 1] || null;
      if (root) { root.tabIndex = -1; if (isTop()) (focusables()[0] || root).focus(); }
    });
    const handleKey = (event: KeyboardEvent) => {
      if (!isTop()) return;
      if (event.key === "Escape") { event.preventDefault(); latestClose.current(); }
      if (event.key !== "Tab" || !root) return;
      const items = focusables();
      if (!items.length) { event.preventDefault(); root.focus(); return; }
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === root)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === root || !root.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      const wasTop = isTop();
      const index = modalStack.indexOf(token);
      if (index !== -1) modalStack.splice(index, 1);
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKey);
      if (wasTop && previous?.isConnected) previous.focus();
    };
  }, [open, selector]);
}
