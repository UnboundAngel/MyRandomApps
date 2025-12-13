# ProjectOS Architecture

This document outlines the architecture of the ProjectOS application.

## Core Technologies

- **Electron:** The application is a desktop application built with Electron. `main.js` serves as the main process entry point.
- **React:** The user interface is constructed using React, with `src/index.tsx` as the renderer process entry point.
- **TypeScript:** The React codebase is written in TypeScript, providing static typing.
- **Webpack & Babel:** Webpack is used for bundling the React application, and Babel transpiles TypeScript and JSX into JavaScript.
- **Lucide-React:** Provides the icon set used throughout the application.

## Architectural Overview

The application follows a standard Electron architecture, separating the main process from the renderer process.

### Main Process

- **File:** `main.js`
- **Responsibilities:**
    - Creates and manages the main `BrowserWindow`.
    - Handles all native desktop interactions and backend logic, including:
        - File system operations (`fs` module).
        - Opening native system dialogs (`dialog` module).
        - Custom window controls (minimize, maximize, close).
    - Listens for and responds to events from the renderer process via `ipcMain`.

### Preload Script

- **File:** `src/preload.js`
- **Responsibilities:**
    - Acts as a secure bridge between the renderer process and the main process.
    - Uses `contextBridge.exposeInMainWorld` to expose a specific set of functions (`window.electron`) to the renderer.
    - This approach avoids exposing the full `ipcRenderer` and other Node.js APIs to the renderer, which is a crucial security practice (Context Isolation).

### Renderer Process

- **Entry Point:** `src/index.tsx`
- **Root Component:** `src/App.tsx`
- **Responsibilities:**
    - Renders the entire user interface using React components.
    - Manages the application's UI state.
    - Communicates with the main process exclusively through the functions exposed by the preload script (`window.electron`).
    - The UI is divided into several "tabs" or views, such as a dashboard, code editor, analytics, and settings, all managed within the main `App.tsx` component.

## Key Components and Features

- **`App.tsx`:** The central and largest component, which acts as a container for the entire application UI. It manages state for navigation, projects, files, and various feature-specific data.
- **`TitleBar.tsx`:** A custom React component that replaces the native OS title bar, providing a consistent look and feel. It communicates with the main process for window control actions.
- **`RecursiveFileTree.tsx`:** A component responsible for displaying a hierarchical view of a directory structure. It interacts with the main process to read directory contents.
- **Code Editor (`CodeEditor.tsx`):** A custom-built code editor component featuring syntax highlighting. It uses a `textarea` for input and a `pre` tag with styled spans to display the highlighted code.
- **Terminal Panel (`TerminalPanel.tsx`):** A component that simulates a terminal interface, displaying logs and execution output.
- **`VaultApp.tsx`:** This appears to be a significant feature area, likely related to managing code snippets or other user-generated content. The `CodeEditor` and `TerminalPanel` are heavily used within this context.

## Data Flow Example: Opening a Directory

1.  **User Interaction:** The user clicks the "Open Directory" button in the React UI.
2.  **Renderer Process:** An `onClick` handler in a React component calls `window.electron.openDirectory()`.
3.  **Preload Script:** The call is forwarded via `ipcRenderer.invoke('open-directory')` to the main process.
4.  **Main Process:** The `ipcMain.handle('open-directory', ...)` listener is triggered.
    - It uses the `dialog.showOpenDialog` method to open a native directory selection dialog.
    - If a directory is selected, it recursively reads the directory structure using the `fs` module.
    - It returns the resulting file/folder tree structure as a JSON object.
5.  **Renderer Process:** The `await` in `window.electron.openDirectory()` completes, and the React component receives the file tree data.
6.  **UI Update:** The component updates its state with the new data, and the `RecursiveFileTree` component re-renders to display the directory.
