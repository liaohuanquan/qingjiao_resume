# QingJiao Resume

A resume editor without accounts, built with Next.js 16, React 19, and Tailwind CSS 4.

## Usage

Create, rename, duplicate, and delete resumes. The editor supports three templates, section order and visibility, custom sections, and avatar cropping. Changes are saved in the current browser. If saving fails, keep the page open and download a backup.

JSON and text imports show a preview before replacing content. Snapshots are saved before importing, applying AI suggestions, or restoring a version; the latest ten are retained. Settings can export all resumes with their histories. Restoring a backup creates new resumes and leaves existing content intact. Keys are excluded from backups.

## Print PDF

Choose “Print resume”, then “Save as PDF” in the system print dialog. Use portrait A4. Disable browser headers and footers, and enable background graphics to retain template colors.

The document is printed as text. Page counts in the editor are estimates; the print dialog determines final pagination and filename. Cancelling does not report a successful save.

## AI Settings

Enter your own service address, model, and key. Only OpenAI-compatible Chat Completions endpoints are supported. For an address such as `https://example.com/v1`, requests go directly from the browser to `/chat/completions` at the provider.

The provider must allow CORS requests from the site's origin, including the `Authorization` and `Content-Type` headers. There is no server proxy. Editing, saving, and printing work independently of AI availability.

The address and model may be saved locally. The key stays only in memory for the current page session and must be entered again after refresh. Persisted keys from older provider drafts are removed. Keys are excluded from backups and server configuration.

“Check connection” sends a real minimal request. Requests can be cancelled and time out after 60 seconds. Suggestions are reviewed before applying, and changes to the original prevent replacement. Resume analysis uses visible sections and excludes contact details and avatars by default. Describe actual responsibilities or outcomes before generating text.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000/qingjiao_resume/`. Follow local installation policies before installing dependencies.

Existing production scripts and Docker configuration are retained. This coding update did not run dependency installation, tests, builds, browser acceptance, or live AI calls, and did not change CI, Docker, or hosting configuration.

## Storage

Data belongs to the current browser and site origin. Use backups when changing devices or origins, or before clearing browser data. Recovery downloads preserve raw damaged data rather than overwriting it with an empty resume.

The project still uses Node standalone output, while the existing GitHub Pages workflow expects `out`. That deployment mismatch is outside this coding update.

## License

MIT.
