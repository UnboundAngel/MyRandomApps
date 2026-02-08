# Midnight Writer - Changelog

This document summarizes the major features, bug fixes, and improvements implemented for the Midnight Writer application.

## Core Application & UI

-   **Persistent Storage:** The application now saves all books, pages, notes, and settings to a local `data.json` file. All work is automatically loaded on startup and saved after changes are made.
-   **Window Management:** A minimum window size has been set to prevent the UI from becoming unusable when resized too small.
-   **Layout Engine:** Implemented a robust, responsive layout that keeps the book centered in the window, regardless of the window's aspect ratio, preventing it from being cut off.
-   **Themed Scrollbars:** All scrollbars within the application have been custom-styled to match the application's dark, immersive theme.
-   **Undo/Redo:** Full undo (Ctrl+Z) and redo (Ctrl+Y) functionality has been implemented for the text editor.

## Phase 1: Appearance & Immersion

-   **Themes:** Added a settings option to switch between multiple visual themes (`Midnight`, `Mahogany`, `Minimalist`), affecting the desk, book leather, and paper color.
-   **Fonts:** Added a settings option to choose from a variety of writing fonts.
-   **Sound Effects:** Implemented an optional sound system for UI interactions like opening books and turning pages (requires user to add `.mp3` files to `/public` directory).
-   **Immersive Background:** The book view features a dark, atmospheric wood-grain desk background to enhance the writing environment.

## Phase 2: Annotation & Rich Content

-   **Rich Text Editor:** Upgraded the basic text area to a full rich-text editor using Slate.js.
-   **Multi-Color Highlighting:** A hovering toolbar appears when text is selected, allowing for highlighting in several preset colors. The toolbar's positioning is intelligent, appearing below the text if there isn't enough space above.
-   **Page Tabs/Bookmarks:** Implemented a "Tab" button that allows the user to create named and colored bookmarks that attach to the side of the book for quick navigation.
-   **Sticky Notes (Coming Soon):** The groundwork has been laid for a sticky note feature, which is the next planned implementation.

## Phase 3: Productivity & Portability

-   **Writing Goals:** Users can set a word count goal for each book. A progress bar in the top UI tracks progress toward this goal.
-   **Auto-Save Indicator:** A "Saving..." icon appears in the corner of the screen during the automatic save process to provide clear feedback.
-   **Multiple Export Options:** The application supports exporting books in several formats:
    -   **Markdown (.md):** Preserves rich text information like colored highlights using a custom syntax.
    -   **Plain Text (.txt):** Exports the raw text content of the book.
    -   **DOCX (.docx):** Exports a formatted Microsoft Word document, preserving highlights.
-   **Book Importing:** Users can import books from `.md` files that follow the application's format.

## Major Bug Fixes

-   Addressed numerous critical crashes related to component rendering order and invalid data.
-   Fixed multiple persistent layout and positioning bugs that caused UI elements (like the highlighter toolbar and sticky notes) to appear in the wrong location.
-   Corrected a visual bug where the inside cover of the book would appear transparent or as a plain color instead of the correct leather texture.
-   Resolved an issue where text content from one page would incorrectly appear on another.
-   Fixed various smaller UI and styling inconsistencies.
