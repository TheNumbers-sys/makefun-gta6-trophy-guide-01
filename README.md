# Leonida Ledger

An offline, spoiler-aware checklist and four-stage route for the supplied 55-entry GTA VI trophy list. Mark trophies earned, search and filter the list, expand a guide with its source and confidence label, and export or restore progress as JSON. The checklist and roadmap share the same saved progress; data stays in this browser's local storage.

GTA VI has not released yet. This guide follows the official 55-trophy list as provided for this guide (Nov 2026). **Confirmed** describes details named by the supplied list or official material; **Inferred** identifies a route based on series precedent. Treat inferred steps as suggestions and verify every requirement at launch.

## Open the app

From the repository root, start the included local server with Node 22:

```sh
~/tools/node22/bin/node serve.ts
```

Visit `http://localhost:8080`. The static app uses only its bundled files and makes no remote requests. Useful presentation states include `/?view=roadmap`, `/?grade=silver`, `/?demo=progress`, and `/?trophy=2&spoilers=off`.

## Build the entry

Choose an output folder, then run:

```sh
mkdir -p /tmp/ledger-build
MAKEFUN_OUTPUT_DIR=/tmp/ledger-build ~/tools/node22/bin/node main.ts
```

The builder copies `app/` and `screenshots/` and writes `dossier.json` using the make.fun frontend helper. Rebuild into a second empty folder to compare dossier hashes. `shots.json` records the four screenshot views and dimensions.
