import { App, Plugin, PluginSettingTab, Setting, TFile, Modal, Notice } from 'obsidian';

interface ArxivSettings {
    defaultFolder: string;
}

const DEFAULT_SETTINGS: ArxivSettings = {
    defaultFolder: ''
}

export default class ArxivPlugin extends Plugin {
    settings: ArxivSettings;
    app: App;

    async onload() {
        await this.loadSettings();

        // Add the icon to the left ribbon.
        const ribbonIconEl = this.addRibbonIcon('file-plus', 'Import ArXiv Paper', (evt: MouseEvent) => {
            new ArxivModal(this.app, this).open();
        });

        // Add the command to the command palette
        this.addCommand({
            id: 'open-arxiv-import-modal',
            name: 'Import ArXiv Paper',
            callback: () => {
                new ArxivModal(this.app, this).open();
            }
        });

        // Add settings tab
        this.addSettingTab(new ArxivSettingTab(this.app, this));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class ArxivModal extends Modal {
    plugin: ArxivPlugin;
    inputEl: HTMLInputElement;
    contentEl: HTMLElement;

    constructor(app: App, plugin: ArxivPlugin) {
        super(app);
        this.plugin = plugin;
    }

    onOpen() {
        this.contentEl.empty();

        this.contentEl.createEl('h2', { text: 'Import ArXiv Paper' });

        // Create input field
        this.inputEl = this.contentEl.createEl('input', {
            type: 'text',
            placeholder: 'Paste ArXiv URL or ID (e.g., 2303.08774)'
        });
        this.inputEl.style.width = '100%';
        this.inputEl.style.marginBottom = '1em';

        // Create button
        const buttonContainer = this.contentEl.createEl('div', {
            cls: 'button-container'
        });

        const button = buttonContainer.createEl('button', {
            text: 'Import'
        });
        
        button.addEventListener('click', async () => {
            const input = this.inputEl.value.trim();
            if (!input) {
                new Notice('Please enter an ArXiv URL or ID');
                return;
            }
            await this.importPaper(input);
        });
    }

    async importPaper(input: string) {
        try {
            new Notice('Fetching paper...');

            // Extract ID from input
            let id = input;
            if (input.includes('arxiv.org')) {
                if (input.includes('/pdf/')) {
                    id = input.split('/pdf/').pop()?.replace('.pdf', '') || '';
                } else {
                    id = input.split('/').pop()?.replace('abs/', '') || '';
                }
            }
            if (!id) {
                new Notice('Invalid ArXiv URL or ID');
                return;
            }

            // Fetch paper data
            const response = await fetch(`http://export.arxiv.org/api/query?id_list=${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch from ArXiv API');
            }

            const text = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');

            const entry = xmlDoc.querySelector('entry');
            if (!entry) {
                throw new Error('Paper not found');
            }

            // Extract paper details
            const title = entry.querySelector('title')?.textContent?.trim() || 'Untitled';
            const abstract = entry.querySelector('summary')?.textContent?.trim() || '';
            const authors = Array.from(entry.querySelectorAll('author name'))
                .map(author => author.textContent?.trim())
                .filter(Boolean)
                .join(', ');
            
            const arxivUrl = input.includes('arxiv.org') ? input : `https://arxiv.org/abs/${id}`;

            // Create file content
            const fileContent = [
                '---',
                `arxiv: ${arxivUrl}`,
                `date: ${new Date().toISOString().split('T')[0]}`,
                'tags: paper',
                '---',
                '',
                `# ${title}`,
                '',
                `**Authors**: ${authors}`,
                `**Link**: ${arxivUrl}`,
                '',
                '## Abstract',
                abstract,
                '',
                '## Notes',
                '- ',
            ].join('\n');

            // Create file
            const fileName = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
                .substring(0, 200);

            const folderPath = this.plugin.settings.defaultFolder;
            const filePath = folderPath ? 
                `${folderPath}/${fileName}.md` : 
                `${fileName}.md`;

            try {
                // Create folder if it doesn't exist
                if (folderPath && !await this.app.vault.adapter.exists(folderPath)) {
                    await this.app.vault.createFolder(folderPath);
                }
                
                // Create file
                const file = await this.app.vault.create(filePath, fileContent);
                
                // Open the new file
                await this.app.workspace.getLeaf().openFile(file);
                
                new Notice('Paper imported successfully!');
                this.close();
            } catch (error: any) {
                new Notice('Error creating file: ' + error.message);
            }
        } catch (error: any) {
            new Notice('Error importing paper: ' + error.message);
            console.error('Error:', error);
        }
    }

    onClose() {
        this.contentEl.empty();
    }
}

class ArxivSettingTab extends PluginSettingTab {
    plugin: ArxivPlugin;
    containerEl: HTMLElement;

    constructor(app: App, plugin: ArxivPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        this.containerEl.empty();

        this.containerEl.createEl('h2', { text: 'ArXiv Plugin Settings' });

        new Setting(this.containerEl)
            .setName('Default folder')
            .setDesc('Folder where new papers will be saved (leave empty for vault root)')
            .addText((text: any) => text
                .setPlaceholder('Example: Papers/ArXiv')
                .setValue(this.plugin.settings.defaultFolder)
                .onChange(async (value: string) => {
                    this.plugin.settings.defaultFolder = value;
                    await this.plugin.saveSettings();
                }));
    }
}