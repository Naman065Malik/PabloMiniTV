# PabloMiniTV Design Pack

This pack contains visual references for the PabloMiniTV take-home challenge.

## Viewer
- home.png — viewer home / Netflix-style landing page
- shows.png — all shows / catalogue browse page
- learn.png — learning catalogue
- show-detail.png — show detail with seasons and episodes
- search.png — viewer search results

## CMS
- dashboard.png — CMS dashboard
- login.png — CMS login
- shows.png — CMS show list
- add-edit-show.png — create/edit show form
- publish.png — validation + catalogue publishing page

## Assets
- asset-library-sheet.png — complete generated asset reference sheet
- brand-logos.png — PabloMiniTV logo variations
- characters.png — Pablo, dog, and mascot references
- icons.png — UI icon references
- backgrounds-illustrations.png — illustration/background references
- ui-elements.png — buttons, badges, status chips

## Important implementation note
These are design references. The cartoon artwork is generated placeholder artwork for the take-home UI. For production, replace it with properly licensed/owned assets and export individual assets as optimized WebP/AVIF/PNG files.

## Suggested frontend mapping
Viewer:
Home -> / 
Shows -> /shows
Learn -> /learn
Show detail -> /shows/:showId
Search -> /search

CMS:
Login -> /admin/login
Dashboard -> /admin/dashboard
Shows -> /admin/shows
Create/Edit Show -> /admin/shows/new and /admin/shows/:showId/edit
Publish -> /admin/publish
