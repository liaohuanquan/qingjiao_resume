# Resume Editor AI Vibecoding TODO

## 1. Project Initialization & Dependencies

- [x] Check and install missing dependencies: `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`.
- [ ] Set up Shadcn UI components (Optional, using custom implementations for Tailwind 4 compatibility).

## 2. Core Layout (app/editor/page.tsx)

- [x] Create the full-screen container (`h-screen w-screen overflow-hidden flex flex-col bg-zinc-50`).
- [x] **Header Implementation**:
  - [x] Add "青椒简历" Logo and Emerald badge.
  - [x] Create user profile name ("QingJiao") and theme toggle.
  - [x] Add black "Export" button with download icon.
- [x] **Three-Pane Grid**:
  - [x] Left Sidebar 1 (280px, `bg-white`): Module and config management.
  - [x] Left Sidebar 2 (380px, `bg-zinc-50/50`): Current module form editor.
  - [x] Preview Canvas (flex-1, `bg-zinc-100`): Center-aligned A4 preview.

## 3. Sidebar 1: Global Config & Module Ordering

- [x] Create draggable module list cards (rounded-xl, border-zinc-200).
- [x] Implement theme color circle selector with ring-2 active state.
- [x] Implement Typography settings: font-family select, line-height slider, font-size preset.

## 4. Sidebar 2: Form Editor (Basic Info example)

- [x] Implement module header with icon.
- [x] Implement layout alignment selector (left/center/split).
- [x] Create avatar upload component with preview placeholder.
- [x] Implement draggable input fields with GripVertical handle and visibility/remove icons.

## 5. Preview & Floating Toolbar

- [x] Design the A4 canvas (aspect-[1/1.414]) with realistic shadows and rings.
- [x] Implement the vertical floating toolbar (right-aligned capsule with rounded-full).
- [x] Add icons: templates, typography, layout, download, code, help.

## 6. Polish & Micro-interactions

- [x] Apply Framer Motion for smooth transitions between editor states.
- [x] Ensure consistent rounded-xl/lg across all UI elements.
- [x] Fine-tune zinc-900/500/600 text color usage.
- [x] Local storage integration for avatar/data persistence.
