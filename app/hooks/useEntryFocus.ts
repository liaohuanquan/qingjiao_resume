"use client";

import { useEffect, useRef } from "react";

export function useEntryFocus(scope: string) {
  const frame = useRef<number | null>(null);
  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current); }, [scope]);
  return (trigger: HTMLButtonElement, removed: boolean) => {
    if (document.activeElement !== trigger) return;
    const root = trigger.closest<HTMLElement>("[data-entry-list]");
    const group = trigger.closest<HTMLElement>("[data-entry-id]");
    if (!root || !group) return;
    const groups = [...root.querySelectorAll<HTMLElement>("[data-entry-id]")];
    const index = groups.indexOf(group);
    const targetId = removed ? (groups[index + 1] ?? groups[index - 1])?.dataset.entryId : group.dataset.entryId;
    const action = trigger.dataset.entryAction;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      // A newer interaction or a different editor must keep its own focus.
      if (!root.isConnected || (document.activeElement !== trigger && document.activeElement !== document.body)) return;
      const target = [...root.querySelectorAll<HTMLElement>("[data-entry-id]")].find(element => element.dataset.entryId === targetId);
      const buttons = [...(target?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? [])];
      const button = (!removed && buttons.find(element => element.dataset.entryAction === action)) || buttons[0] || root.querySelector<HTMLButtonElement>("[data-add-entry]");
      if (button && getComputedStyle(button).visibility !== "hidden") button.focus({ preventScroll: true });
    });
  };
}
