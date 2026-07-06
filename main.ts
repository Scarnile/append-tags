import {
    App,
    Plugin,
    PluginSettingTab,
    Setting,
    Editor,
} from "obsidian";

interface AppendTagsSettings {
    tags: string[];
}

const DEFAULT_SETTINGS: AppendTagsSettings = {
    tags: [],
};

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeTag(tag: string): string {
    return tag.trim().replace(/^#+/, "");
}

export default class AppendTagsPlugin extends Plugin {
    settings: AppendTagsSettings;
    private registeredCommands: string[] = [];

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new AppendTagsSettingTab(this.app, this));
        this.registerTagCommands();
    }

    registerTagCommands() {
        this.registeredCommands = [];

        for (const tag of this.settings.tags) {
            const normalized = normalizeTag(tag);
            if (!normalized) continue;

            const tagId = `append-tags:${normalized}`;

            this.addCommand({
                id: tagId,
                name: `Append tag #${normalized}`,
                editorCallback: (editor) => {
                    this.toggleTag(editor, normalized);
                },
            });

            this.registeredCommands.push(tagId);
        }
    }

    async reRegisterCommands() {
        const commands = (this.app as any).commands;
        if (commands) {
            for (const id of this.registeredCommands) {
                commands.removeCommand(id);
            }
        }
        this.registeredCommands = [];
        this.registerTagCommands();
    }

    toggleTag(editor: Editor, tagName: string) {
        const cursor = editor.getCursor();
        const lineNum = cursor.line;
        const line = editor.getLine(lineNum);
        const tag = `#${tagName}`;

        const tagRegex = new RegExp(
            `${escapeRegex(tag)}(?=\\s|$)`,
            "g",
        );

        if (tagRegex.test(line)) {
            const newLine = line
                .replace(tagRegex, "")
                .replace(/\s{2,}/g, " ")
                .trim();
            editor.setLine(lineNum, newLine);
        } else {
            const trimmed = line.replace(/\s+$/, "");
            const separator = trimmed.length === 0 ? "" : " ";
            editor.setLine(lineNum, `${trimmed}${separator}${tag}`);
        }
    }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData(),
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class AppendTagsSettingTab extends PluginSettingTab {
    plugin: AppendTagsPlugin;

    constructor(app: App, plugin: AppendTagsPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl("h2", { text: "Append Tags Settings" });

        const desc = containerEl.createEl("p", {
            text: "Enter one tag per line (without the # prefix). Each tag becomes its own command in the command palette.",
        });
        desc.style.marginBottom = "12px";

        new Setting(containerEl)
            .setName("Tags")
            .setDesc("One tag per line. Example:\nwork\npersonal\ntodo")
            .addTextArea((textarea) => {
                textarea
                    .setPlaceholder("work\npersonal\ntodo")
                    .setValue(this.plugin.settings.tags.join("\n"))
                    .onChange(async (value) => {
                        const tags = value
                            .split("\n")
                            .map((t) => t.trim())
                            .filter((t) => t.length > 0)
                            .map((t) => t.replace(/^#+/, ""));

                        this.plugin.settings.tags = tags;
                        await this.plugin.saveSettings();
                        await this.plugin.reRegisterCommands();
                    });

                textarea.inputEl.style.width = "100%";
                textarea.inputEl.style.minHeight = "150px";
                textarea.inputEl.style.fontFamily = "monospace";
            });

        containerEl.createEl("hr");

        const info = containerEl.createEl("div");
        info.style.marginTop = "12px";
        info.createEl("p", {
            text: "After adding tags, go to Settings → Hotkeys to assign keyboard shortcuts to each command.",
        });

        if (this.plugin.settings.tags.length > 0) {
            const cmdList = info.createEl("ul");
            for (const tag of this.plugin.settings.tags) {
                cmdList.createEl("li", {
                    text: `Append tag #${tag}`,
                });
            }
        }
    }
}
