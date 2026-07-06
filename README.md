# Append Tags

Obsidian plugin that creates a **command per tag** so you can append or toggle tags on the current line with a hotkey.

Designed to pair with the [Tasks plugin](https://obsidian-tasks-group.github.io/obsidian-tasks/) — tag task lines and filter them with queries.

## How it works

1. **Add your tags** in Settings → Append Tags (one per line, no `#` prefix)
2. Each tag becomes a **command** in the command palette: `Append tag #work`, `Append tag #personal`, etc.
3. **Bind hotkeys** in Settings → Hotkeys (search for "Append tag")
4. Press the hotkey while on a line — the tag toggles:

| Before | After (press hotkey for `#work`) |
|---|---|
| `- [ ] Review quarterly report` | `- [ ] Review quarterly report #work` |
| `- [ ] Review quarterly report #work` | `- [ ] Review quarterly report` |
| _(empty line)_ | `#work` |

## Use case: Tasks plugin

Add tags to your task lines and use them in Tasks queries:

```markdown
- [ ] Review quarterly report 📅 2024-03-15 #work
- [ ] Buy groceries 📅 2024-03-14 #personal
```

Then query by tag from any note:

```tasks
tags include #work
not done
```

## Settings
You can add tags that will appear in the command palette and after saving, new commands appear automatically. 