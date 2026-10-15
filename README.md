# RabbitHole

**Follow your curiosity. Visualize the journey.**

RabbitHole is a Firefox browser extension that transforms browsing sessions into interactive visual maps. Instead of losing track of the websites you discover while researching, RabbitHole records your navigation and shows how your discoveries connect.

Whether you're researching a historical event, exploring a technical subject, or following an unexpected internet rabbit hole, RabbitHole helps you revisit the path you took.

## Features

### Interactive Research Graphs
- Automatically create nodes representing visited webpages.
- Visualize connections between pages based on browsing navigation.
- Explore graphs with zooming, panning, and node inspection.
- Reopen previously visited webpages directly from the graph.

### Three Visualization Modes
- **Tree:** Organizes webpages into levels based on navigation connections.
- **Constellation:** Displays webpages in a circular network.
- **Hybrid:** Arranges webpages into a balanced, staggered layout.

### Session Management
- Start and stop named research sessions.
- Save multiple RabbitHole sessions.
- Browse previous sessions through the Library.
- Reopen saved graphs.
- Delete sessions and their recorded navigation events.

### Import and Export
- Export individual sessions as JSON files.
- Import previously exported RabbitHole sessions.
- Preserve navigation data when transferring sessions.
- Review privacy warnings before exporting.

### Appearance Customization
- Customize graph appearance.
- Adjust visual settings through Appearance Studio.
- Enable or disable the graph background grid.

## Privacy First

RabbitHole is designed around intentional recording.

**Browsing activity is recorded only while a RabbitHole session is active.**

- Users explicitly start and stop recording.
- Recording stops when a session is ended.
- Research sessions are stored locally using browser extension storage.
- Different sessions maintain separate navigation histories.
- Users can delete saved sessions and their recorded events.
- No account is required for the current version.

Exported JSON files may contain webpage URLs, titles, and timestamps. Users should review these files before sharing them.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, TypeScript |
| Build Tool | Vite |
| Graph Visualization | React Flow |
| Extension | Firefox WebExtensions |
| Storage | Browser Storage API |
| Styling | CSS, Lucide Icons |
| Experimental Backend | Python, FastAPI |

The current Firefox extension uses local browser storage and does not require the Python backend to run.

## Project Structure

```text
RabbitHole/
├── backend/          # Experimental FastAPI backend
├── extension/        # Firefox browser extension
│   ├── explorer/     # Built React application
│   ├── background.js # Navigation recording
│   ├── popup.html    # Session controls
│   └── popup.js
├── frontend/         # React + TypeScript source
│   └── src/
│       ├── hooks/
│       ├── utils/
│       └── App.tsx
├── docs/             # Project documentation
└── README.md
```

## Running RabbitHole Locally

### Requirements

- Firefox
- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Taeganirving/RabbitHole.git
cd RabbitHole
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Build the Explorer

```bash
npm run build
```

The frontend is built into the `extension/explorer/` directory.

### 4. Load the Firefox extension

1. Open Firefox.
2. Navigate to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on**.
4. Select the extension's `manifest.json` file inside the `extension/` directory.
5. Open the RabbitHole extension popup.

Temporary add-ons are intended for development and must be loaded again after Firefox restarts.

## How to Use

1. Open the RabbitHole extension popup.
2. Enter a name for your research session.
3. Click **Start RabbitHole**.
4. Browse websites as you normally would.
5. Stop recording when you've finished.
6. Open the RabbitHole Explorer to visualize your navigation.
7. Use the Library to revisit, export, import, or delete sessions.

## Development Status

**RabbitHole is an active portfolio project.**

The core MVP includes browsing-session recording, graph visualization, session management, appearance customization, and JSON import/export.

Future improvements may include more advanced graph layouts, additional research analytics, and expanded cross-browser support.

## Built With

Python, TypeScript, React, React