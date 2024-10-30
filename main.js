var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ArxivPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  defaultFolder: ""
};
var ArxivPlugin = class extends import_obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    const ribbonIconEl = this.addRibbonIcon("file-plus", "Import ArXiv Paper", (evt) => {
      new ArxivModal(this.app, this).open();
    });
    this.addCommand({
      id: "open-arxiv-import-modal",
      name: "Import ArXiv Paper",
      callback: () => {
        new ArxivModal(this.app, this).open();
      }
    });
    this.addSettingTab(new ArxivSettingTab(this.app, this));
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var ArxivModal = class extends import_obsidian.Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }
  onOpen() {
    this.contentEl.empty();
    this.contentEl.createEl("h2", { text: "Import ArXiv Paper" });
    this.inputEl = this.contentEl.createEl("input", {
      type: "text",
      placeholder: "Paste ArXiv URL or ID (e.g., 2303.08774)"
    });
    this.inputEl.style.width = "100%";
    this.inputEl.style.marginBottom = "1em";
    const buttonContainer = this.contentEl.createEl("div", {
      cls: "button-container"
    });
    const button = buttonContainer.createEl("button", {
      text: "Import"
    });
    button.addEventListener("click", async () => {
      const input = this.inputEl.value.trim();
      if (!input) {
        new import_obsidian.Notice("Please enter an ArXiv URL or ID");
        return;
      }
      await this.importPaper(input);
    });
  }
  async importPaper(input) {
    var _a, _b, _c, _d, _e, _f;
    try {
      new import_obsidian.Notice("Fetching paper...");
      let id = input;
      if (input.includes("arxiv.org")) {
        if (input.includes("/pdf/")) {
          id = ((_a = input.split("/pdf/").pop()) == null ? void 0 : _a.replace(".pdf", "")) || "";
        } else {
          id = ((_b = input.split("/").pop()) == null ? void 0 : _b.replace("abs/", "")) || "";
        }
      }
      if (!id) {
        new import_obsidian.Notice("Invalid ArXiv URL or ID");
        return;
      }
      const response = await fetch(`http://export.arxiv.org/api/query?id_list=${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch from ArXiv API");
      }
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");
      const entry = xmlDoc.querySelector("entry");
      if (!entry) {
        throw new Error("Paper not found");
      }
      const title = ((_d = (_c = entry.querySelector("title")) == null ? void 0 : _c.textContent) == null ? void 0 : _d.trim()) || "Untitled";
      const abstract = ((_f = (_e = entry.querySelector("summary")) == null ? void 0 : _e.textContent) == null ? void 0 : _f.trim()) || "";
      const authors = Array.from(entry.querySelectorAll("author name")).map((author) => {
        var _a2;
        return (_a2 = author.textContent) == null ? void 0 : _a2.trim();
      }).filter(Boolean).join(", ");
      const arxivUrl = input.includes("arxiv.org") ? input : `https://arxiv.org/abs/${id}`;
      const fileContent = [
        "---",
        `arxiv: ${arxivUrl}`,
        `date: ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}`,
        "tags: paper",
        "---",
        "",
        `# ${title}`,
        "",
        `**Authors**: ${authors}`,
        `**Link**: ${arxivUrl}`,
        "",
        "## Abstract",
        abstract,
        "",
        "## Notes",
        "- "
      ].join("\n");
      const fileName = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").substring(0, 200);
      const folderPath = this.plugin.settings.defaultFolder;
      const filePath = folderPath ? `${folderPath}/${fileName}.md` : `${fileName}.md`;
      try {
        if (folderPath && !await this.app.vault.adapter.exists(folderPath)) {
          await this.app.vault.createFolder(folderPath);
        }
        const file = await this.app.vault.create(filePath, fileContent);
        await this.app.workspace.getLeaf().openFile(file);
        new import_obsidian.Notice("Paper imported successfully!");
        this.close();
      } catch (error) {
        new import_obsidian.Notice("Error creating file: " + error.message);
      }
    } catch (error) {
      new import_obsidian.Notice("Error importing paper: " + error.message);
      console.error("Error:", error);
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};
var ArxivSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    this.containerEl.empty();
    this.containerEl.createEl("h2", { text: "ArXiv Plugin Settings" });
    new import_obsidian.Setting(this.containerEl).setName("Default folder").setDesc("Folder where new papers will be saved (leave empty for vault root)").addText((text) => text.setPlaceholder("Example: Papers/ArXiv").setValue(this.plugin.settings.defaultFolder).onChange(async (value) => {
      this.plugin.settings.defaultFolder = value;
      await this.plugin.saveSettings();
    }));
  }
};
