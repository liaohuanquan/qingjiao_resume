"use client";

import { useCallback, useReducer, type SetStateAction } from "react";
import type { ResumeConfig } from "../lib/resume";

const HISTORY_LIMIT = 30;
const INPUT_GROUP_MS = 500;

type EditState = {
  present: ResumeConfig;
  past: ResumeConfig[];
  future: ResumeConfig[];
  group: Element | null;
  editedAt: number;
};
type EditAction =
  | { type: "edit"; value: SetStateAction<ResumeConfig>; group: Element | null; at: number }
  | { type: "replace"; config: ResumeConfig }
  | { type: "undo" }
  | { type: "redo" };

function initialState(config: ResumeConfig): EditState {
  return { present: config, past: [], future: [], group: null, editedAt: 0 };
}

function editReducer(state: EditState, action: EditAction): EditState {
  if (action.type === "replace") return initialState(action.config);
  if (action.type === "undo") {
    const previous = state.past.at(-1);
    if (!previous) return state;
    return { present: previous, past: state.past.slice(0, -1), future: [state.present, ...state.future], group: null, editedAt: 0 };
  }
  if (action.type === "redo") {
    const next = state.future[0];
    if (!next) return state;
    return { present: next, past: [...state.past, state.present].slice(-HISTORY_LIMIT), future: state.future.slice(1), group: null, editedAt: 0 };
  }
  const present = typeof action.value === "function" ? action.value(state.present) : action.value;
  if (present === state.present) return state;
  const grouped = action.group !== null && state.group === action.group && action.at - state.editedAt < INPUT_GROUP_MS;
  return {
    present,
    past: grouped ? state.past : [...state.past, state.present].slice(-HISTORY_LIMIT),
    future: [],
    group: action.group,
    editedAt: action.at,
  };
}

// Session edits are separate from the ten durable snapshots taken before replacement.
export function useResumeEdits(initialConfig: ResumeConfig) {
  const [state, dispatch] = useReducer(editReducer, initialConfig, initialState);
  const setConfig = useCallback((value: SetStateAction<ResumeConfig>) => {
    const focused = typeof document === "undefined" ? null : document.activeElement;
    const group = typeof value === "function" && focused?.matches("textarea, input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=button]):not([type=submit])") ? focused : null;
    dispatch({ type: "edit", value, group, at: Date.now() });
  }, []);
  const replaceConfig = useCallback((config: ResumeConfig) => dispatch({ type: "replace", config }), []);
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);
  return { config: state.present, setConfig, replaceConfig, undo, redo, canUndo: state.past.length > 0, canRedo: state.future.length > 0 };
}
