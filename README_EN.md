# QingJiao Resume

A resume editor without accounts, built with Next.js 16, React 19, and Tailwind CSS 4.

## Usage

Create, rename, duplicate, and delete resumes. The editor supports three templates, section order and visibility, custom sections, and avatar cropping. Changes are saved in the current browser. If saving fails, keep the page open and download a backup.

On mobile, choosing a section opens its editor; hidden panels leave keyboard navigation. Preview fitting uses the container's actual width. Manual zoom survives resizing; “Fit width” restores automatic fitting. Select document text or drag the blank background with a mouse; touch uses native scrolling. Zoom controls remain visible on mobile and appear on desktop hover or keyboard focus. Skill tag corners support a radius of zero.

The list shows actual resume thumbnails ordered by the most recent update. When another page changes or deletes the same resume, current edits are retained. Save a separate copy, download a backup, or explicitly confirm loading the latest version.

Undo and redo retain the latest 30 session steps, grouping consecutive edits in the same input within 500 milliseconds. Refreshing or loading the latest version clears these steps. Text inputs retain their native undo shortcuts. Removing a section clears its content and individual style; undo restores them. Missing standard sections can be added again. Projects have a link input.

Avatars can be cropped and removed. Changing files, cancelling, or leaving prevents previous operations from applying late results. Cropped images use PNG to retain transparency.

JSON and text imports show a preview before replacing content. Snapshots are saved before importing, applying AI suggestions, or restoring a version; the latest ten are retained. Settings can export all resumes with their histories. Restoring a backup creates new resumes and leaves existing content intact. Keys are excluded from backups.

Before restoring, review the filename, resume titles, and snapshot counts, then confirm adding the resumes. Cancelling, changing files, or clearing data stops the previous read. Empty backups do not write data. Appearance controls track changes and clearing in other tabs; invalid preferences disable editing and provide retry and recovery downloads.

Text imports rebuild standard sections while preserving the template and typography. Existing custom content is not mixed into the imported resume.

The parser distinguishes section headings from entry headings, preserves years in descriptions, recognizes project links, and keeps skill names containing slashes. Unsupported sections are shown as unrecognized content. Changing files, editing text, or closing the import dialog cancels the previous file read.

## Print PDF

Choose “Print resume”, then “Save as PDF” in the system print dialog. Use portrait A4. Disable browser headers and footers, and enable background graphics to retain template colors.

The document is printed as text. Page counts in the editor are estimates; the print dialog determines final pagination and filename. Cancelling does not report a successful save.

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
