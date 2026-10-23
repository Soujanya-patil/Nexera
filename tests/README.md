# Local test suites

Browser and server checks for the **built** site (`dist/`). They run on your machine only: CI doesn't
run them (`.github/workflows/deploy.yml` only builds and uploads `dist/`), and nothing in `tests/` is
deployed. They never touch the live site.

## What's here

| Folder / file | What it is |
|---|---|
| `suites/` | Pass/fail suites. Each prints `PASS` / `FAIL` lines and an `N/M passed` total, and exits non-zero on a failure. |
| `checks/` | Measuring tools you run when a change calls for them: contrast, touch targets, layout shift, paint, and Lighthouse. |
| `server/` | `httpd.conf` (Apache, which applies the site's own `.htaccess`), `router.php` (PHP's built-in server, for the enquiry API) and `smtpsink.py` (catches every mail PHP sends). |
| `prepare.sh` | Copies `dist/` into `.work/`. The PHP copy's enquiry address becomes `leads-test@example.com`, so no suite can mail a real inbox. |
| `start-servers.sh` / `stop-servers.sh` | Starts or stops the local servers on ports 8800, 8810 and 8811, plus the SMTP sink on 2525. |
| `make-reference.sh [commit]` | Builds an earlier commit into `.work/before`, served on 8811. The hub suite compares against it, and `checks/lhab.sh` uses it as "before". |
| `run-all.sh` | Every suite, once. |
| `run-related.sh` | The shorter set for visual changes. |

Everything the scripts write (site copies, mail log, rate-limit files, Lighthouse reports and
screenshots) goes into `tests/.work/`, which git ignores.

## Setup (once)

- Node 20 or later, plus `npm install` **inside `tests/`**. This installs `playwright-core` here; the site's own dependencies are unchanged.
- Google Chrome. The suites find the installed Chrome; set `CHROME_PATH` to use another browser binary.
- Apache 2.4 with `mod_rewrite`. Set `APACHE_ROOT` to its install folder.
- PHP 8 on `PATH` (or `PHP=…`) and Python 3 (or `PYTHON=…`).
  - The SMTP settings in `start-servers.sh` apply on Windows.
  - On macOS or Linux, point PHP's `sendmail_path` at a mail catcher instead.
- For `checks/lhab.sh` and `checks/lhrun.sh`: Lighthouse (`npm i -g lighthouse`).
- On Windows, run the scripts from Git Bash.

## Running

From the project root:

```sh
npm run build
tests/prepare.sh
APACHE_ROOT=/path/to/Apache24 tests/start-servers.sh
tests/make-reference.sh          # once; the hub suite is skipped without it
tests/run-all.sh                 # or tests/run-related.sh
tests/stop-servers.sh
```

A single suite takes the server's address as its first argument, for example:

```sh
node tests/suites/cbdrag.mjs http://127.0.0.1:8810
```

The mail suites (`cb`, `e2e`, `docsend`, `forms-server`, `forms-e2e`) need:
- `MAILS`: the path to `.work/mails.log`;
- for `forms-e2e`, also `RATE_DIR`: `.work/nexera-private`.

`tests/lib.sh` sets `MAILS`, and the runners clear the rate-limit folder between suites.

## Notes

- Some suites hard-code page h1s or card counts (for example `startfail.mjs`, `filterprobe.mjs`). Update them when an approved h1 or the catalogue changes.
- `cbdrag.mjs` reads the dragged pill's shadow once the 300 ms lift transition has settled, and checks for the lift shadow itself (`0 24px 44px -14px`), not just any shadow.
- `checks/a11yscan.mjs` samples pixels. Its "ring 1.00" readings and some low contrast readings over photos are sampling artifacts; confirm with `checks/domcontrast.mjs` and `checks/controlcontrast.mjs`.
- Lighthouse on a busy machine is noisy. Compare before and after interleaved with `checks/lhab.sh`, on a quiet machine.
