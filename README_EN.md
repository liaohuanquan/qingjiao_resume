# QingJiao Resume

A resume editor without accounts, built with Next.js 16, React 19, and Tailwind CSS 4.

## Usage

Create, rename, duplicate, and delete resumes. The editor supports three templates, section order and visibility, custom sections, and avatar cropping. Changes are saved in the current browser. Undoing back to saved content rechecks storage and updates the status; external conflicts still report a failure. If saving fails, keep the page open and download a backup.

On mobile, choosing a section opens its editor; hidden panels leave keyboard navigation. Preview fitting uses the container's actual width. Manual zoom survives resizing; “Fit width” restores automatic fitting. Select document text or drag the blank background with a mouse; touch uses native scrolling. Zoom controls remain visible on mobile and appear on desktop hover or keyboard focus. Skill tag corners support a radius of zero.

The list shows actual resume thumbnails ordered by the most recent update. When another page changes or deletes the same resume, current edits are retained. Save a separate copy, download a backup, or explicitly confirm loading the latest version.

Undo and redo retain the latest 30 session steps, grouping consecutive edits in the same input within 500 milliseconds. Refreshing or loading the latest version clears these steps. Text inputs retain their native undo shortcuts. Removing a section clears its content and individual style; undo restores them. Missing standard sections can be added again. Projects have a link input.

Avatars can be cropped and removed. Changing files, cancelling, or leaving prevents previous operations from applying late results. Cropped images use PNG to retain transparency.

JSON and text imports show a preview before replacing content. Snapshots are saved before importing, applying AI suggestions, or restoring a version; the latest ten are retained. Settings can export all resumes with their histories. Restoring a backup creates new resumes and leaves existing content intact. Keys are excluded from backups.

An unregistered older default resume is validated before being added to the list, even when other resumes already exist. Full backups include its content and history without writing to storage or requiring migration first. Invalid data stops the operation and retains the recovery download option.

Before restoring, review the filename, resume titles, and snapshot counts, then confirm adding the resumes. Cancelling, changing files, or clearing data stops the previous read. Empty backups do not write data. Appearance controls track changes and clearing in other tabs; invalid preferences disable editing and provide retry and recovery downloads.

Text imports rebuild standard sections while preserving the template and typography. Existing custom content is not mixed into the imported resume.

The parser distinguishes section headings from entry headings, preserves years in descriptions, recognizes project links, and keeps skill names containing slashes. Unsupported sections are shown as unrecognized content. Changing files, editing text, or closing the import dialog cancels the previous file read.

## Typography and text

Adjust body, name, and heading sizes separately, along with line height and paragraph, entry, and section spacing. Sizes display points while storage remains in CSS pixels. Resetting restores typography defaults and clears individual section styles, preserving skill tags and column positions. Missing new fields receive defaults; existing font, body size, line height, and section overrides remain. New defaults use 1.5 line height, 20px section gaps, and 12px entry gaps.

Classic uses one column. Split defaults basic information, education, and skills to a sidebar; each section can move between sidebar and main. Each column preserves relative section order. A single populated column uses the full width. Other templates still use the original section order, without altering content. Technical uses project accent lines and grouped skills instead of bordered cards. Single-column headers place the avatar on the right while retaining its crop ratio.

Use “New page” on a section to start it on another printed page; use “Remove break” to undo it. Hidden or empty sections do not create blank pages. This setting is kept in resumes, history, and backups.

Compact, Standard, and Roomy density presets change line height and paragraph, entry, and section spacing. Applying a preset clears individual section spacing while retaining section font sizes, global fonts, sizes, and skill appearance. The selected density is derived from actual values; unmatched settings show Custom. These values use the existing typography storage and backup format.

Education, work, and project entries have visible Move up, Move down, Copy, and Delete controls. Copies appear directly after the source with a new ID, preserving dates, description formatting, and links. Changes participate in session undo and automatic saving. Boundary moves are disabled; keyboard focus returns to an enabled control after moving, or an adjacent entry or Add button after deletion. Density, entry operations, focus, and printing have not been run or visually verified.

Education, work, and project cards can be collapsed in the editor. A collapsed card keeps its title and actions; the collapse state is local to the editing session and does not change resume content or printing. Desktop users can hide the management panel to widen editing and preview. Visible sections in the editor preview have an Edit button that selects the matching section and focuses the editing panel; mobile management still uses the bottom navigation. The preview button is absent from thumbnails and print output. Collapse, panel visibility, preview navigation, and focus have not been run or visually verified.

Work, project, and custom descriptions support bold, lists, and named links. Formatting commands participate in session undo while descriptions remain plain text. Use `**bold**`, unordered prefixes (`- `, `* `, `+ `, `• `), numbered lists, or `[text](https://example.com)`. Ordinary text remains visible; HTML is not executed. This is a small text syntax, without full Markdown or nested lists. Links support HTTP/HTTPS; the toolbar encodes URL parentheses. Ctrl/Cmd+B applies bold, Ctrl/Cmd+K inserts a link. Multiline bold preserves list markers. Link insertion checks for changed source text; cancelling retains the original.

Text imports retain description formatting. Preview, thumbnails, and printing share the same renderer; thumbnails contain no interactive links. New templates, selection restoration, formatting, typography migration, and column pagination have not been run or visually verified.

## Print PDF

Choose “Print resume”, then “Save as PDF” in the system print dialog. Use portrait A4. Disable browser headers and footers, and enable background graphics to retain template colors.

The document is printed as text. The editor marks manual breaks and estimates page counts; it hides continuous page guides when breaks are set. The print dialog determines final pagination and filename. Cancelling does not report a successful save.

## AI Settings

Enter your own service address, model, and key. Only OpenAI-compatible Chat Completions endpoints are supported. For an address such as `https://example.com/v1`, requests go directly from the browser to `/chat/completions` at the provider.

The provider must allow CORS requests from the site's origin, including the `Authorization` and `Content-Type` headers. There is no server proxy. Editing, saving, and printing work independently of AI availability.

The address and model may be saved locally. The key stays only in memory for the current page session and must be entered again after refresh. Persisted keys from older provider drafts are removed. Keys are excluded from backups and server configuration.

“Check connection” sends a real minimal request. Requests can be cancelled and time out after 60 seconds. Suggestions are reviewed before applying, and changes to the original prevent replacement. Resume analysis uses visible sections and excludes contact details and avatars by default. Describe actual responsibilities or outcomes before generating text.

Edit suggestions before applying, or copy them separately. A changed original allows copying only. Closing the analysis dialog cancels its request. If copying fails, the text is selected for manual copying without reporting success.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000/qingjiao_resume/`. Follow local installation policies before installing dependencies.

Existing production scripts and Docker configuration are retained. This coding update did not run dependency installation, tests, builds, browser acceptance, or live resume AI calls, and did not change CI, Docker, or hosting configuration.

## Storage

Data belongs to the current browser and site origin. Use backups when changing devices or origins, or before clearing browser data. Recovery downloads preserve raw damaged data rather than overwriting it with an empty resume.

The project still uses Node standalone output, while the existing GitHub Pages workflow expects `out`. That deployment mismatch is outside this coding update.

## License

MIT.
