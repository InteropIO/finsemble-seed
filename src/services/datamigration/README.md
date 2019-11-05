[![Finsemble Logo](https://documentation.chartiq.com/finsemble/styles/img/Finsemble_Logo_Dark.svg)](https://documentation.chartiq.com/finsemble/)

# Finsemble Recipe: Data Migration

In some cases, users have been deployed using Chromium's IndexedDB as the default storage adapter, as this is the default for Finsemble's seed project. For more sustainable usage across multiple machines and centralized handling of data, migration to a remote database is often times needed.

In other cases, migration from one remote datastore to another is needed. This recipe, with appropriate modifications, can handle both cases.

For the purposes of this example, the **current** datasource will be **IndexedDB**. _N.b._: this recipe does not utilize a remote data adapter. It utilizes LocalStorage as a mimic for data migration. It is up to you to create the storage adapter you'd like to use and register it by comparing the recipe to your extant code.

## Setup

**Preconditions**:

1. Check out the `master` branch or whichever branch is your current use-case.
1. Clear all caches (AppData and LocalStorage + IndexedDB in Chromium). Start Finsemble to clear the latter two items by bringing up the developer tools with **Ctrl + Shift + `i`**, selecting the "Application" tab, and clearing each of the two storage items.
1. Begin Finsemble with `npm run dev`.
1. Create a new workspace. Ensure it has at least one or two recognizable components in a recognizable layout.
1. Save and quit (using the toolbar menu item).


## Testing

1. Check out the `recipes/DataMigration` granch.
1. Do **not** clear any caches.
1. Begin Finsemble with `npm run dev`.
1. Expected: A "Migration" component appears. For demonstration, it:
    1. Displays a countdown.
    1. Can be cancelled.
    1. Can be fast-forwarded by clicking the "Begin" button.
1. Expected: upon countdown completion or clicking "Begin" to fast-foward, the instance will pause and restart.

## Success Conditions

1. The migration component will not display.
1. The active workspace from the Preconditions setup will be displayed with the recognizable components and layout.

