# Resume Editor Design Specification

## Overview
A modern, minimalist, yet feature-rich online resume editor with a three-pane layout.

## Aesthetics & Core Theme
- **Background**: `bg-zinc-50` (Extreme light gray)
- **Typography**: Google Fonts (Inter/Roboto/Outfit recommended), using Lucide icons.
- **Colors**:
  - Main titles: `#18181b` (`zinc-900`)
  - Body & Icons: `#71717a` (`zinc-500`) or `#52525b` (`zinc-600`)
  - Status badges: Emerald (e.g., `text-emerald-600`, `bg-emerald-50`)
- **Components**: Everything rounded (`rounded-xl` or `rounded-lg`).

## Layout Structure (H-screen, W-screen, no overflow)

### 1. Header (~60px)
- `flex items-center justify-between px-6 bg-white border-b border-zinc-200 shadow-sm z-10`
- **Left**: "青椒简历" Logo + Badge ("保存已配置")
- **Right**: Username ("QingJiao") + Theme Switch + "Export" button (Black, Shadcn Default).

### 2. Main Content (Three-Column Layout)
#### Column 1: Config & Module Management (280px)
- `bg-white border-r border-zinc-100 p-4 overflow-y-auto`
- **Draggable Sections**: Cards with drag handles, hide/delete icons.
- **Theme Color**: Circle color picker with ring-2 ring-offset-2.
- **Typography Settings**: Font selection, line-height slider, base font size.

#### Column 2: Form Editor (380px)
- `bg-zinc-50/50 border-r border-zinc-200 p-6 overflow-y-auto`
- **Current Module**: e.g., "Basic Info" with icon.
- **Layout Selector**: Align left/center/split distribution.
- **Form Controls**: Minimalist inputs, drag handles for list items, visibility/delete toggles.
- **Avatar**: Upload component with preview and replace action.

#### Column 3: Preview Canvas (flex-1)
- `bg-zinc-100 flex items-center justify-center p-8 overflow-auto`
- **A4 Paper**: `bg-white aspect-[1/1.414]` with `shadow-2xl ring-1 ring-zinc-900/5`.
- **Floating Toolbar**: Right-aligned vertical capsule (`absolute right-6 top-1/2`). Contains icons for Template, Text, Layout, Download, Code, Help.

## Interactions
- Framer Motion for transitions and interactions.
- Lucide Icons for all symbology.
- All cards/inputs use high-quality ronded corners.
