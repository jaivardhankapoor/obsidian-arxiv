# ArXiv Template for Obsidian
A simple Obsidian plugin to import arXiv papers as notes in your vault.

[![Obsidian Community Plugin](https://img.shields.io/badge/Obsidian-Community%20Plugin-blue)](https://obsidian.md/plugins?id=arxiv-template)

## Features
- 📥 Import papers directly from arXiv URLs or IDs
- 📝 Automatically extracts:
    - 📌 Title
    - 👥 Authors
    - 📄 Abstract
    - 🔗 Link
- 🗂️ Creates formatted notes with metadata and sections for your annotations
- 📁 Configurable default folder for paper notes
- 🚀 Accessible via ribbon icon or command palette

## Installation

### Manual Installation

1. Create `obsidian-arxiv` folder in your vault's `.obsidian/plugins` directory
2. Download `main.js` and `manifest.json` from the latest release
3. Place both files in the `obsidian-arxiv` folder
4. Enable the plugin in Obsidian's Community Plugins settings

### From Source

1. Clone the repository
```bash
git clone https://github.com/jaivardhankapoor/obsidian-arxiv.git obsidian-arxiv
cd obsidian-arxiv
```

2. Install dependencies `npm install`

3. Build the plugin `npm run build`

4. Copy to your vault
```bash
cp main.js manifest.json /path/to/vault/.obsidian/plugins/obsidian-arxiv/
```

## Usage

1. Click the ribbon icon (file-plus) or use the command palette to open the import modal
2. Paste an arXiv URL (e.g., `https://arxiv.org/abs/2303.08774`) or ID (e.g., `2303.08774`)
3. Click Import
4. The plugin will create a new note with the paper's details

## Settings

- **Default folder**: Set a default location for new paper notes
  - Leave empty to save in vault root
  - Example: "Papers/ArXiv"

## Note Template

The plugin creates notes with this structure:
```markdown
---
arxiv: [url]
date: [date_added]
tags: paper
---

# [Paper Title]

**Authors**: [authors]
**Link**: [arxiv_url]

## Abstract
[paper_abstract]

## Notes
- 

```

## Development

This plugin is built using:
- TypeScript
- Obsidian API
- arXiv API

Key files:
- `main.ts`: Main plugin code
- `manifest.json`: Plugin metadata
- `esbuild.config.mjs`: Build configuration

To develop:
1. Clone the repository
2. Install dependencies: `npm install`
3. Make changes to `main.ts`
4. Build: `npm run build`
5. Copy files to your test vault
6. Reload Obsidian to see changes (Ctrl/Cmd + R)

## Contributing

Feel free to: Submit issues for bugs or feature requests, create pull requests with improvements, and share feedback!

## License

MIT