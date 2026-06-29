# Project Registry

Use this file as the source of truth for projects that may become portfolio entries.

## Template

```yaml
- name: "Project Name"
  type: "coding | creative | automation | AI | other"
  status: "idea | in-progress | shipped | archived"
  one_liner: "Short description"
  tech: ["Python", "Node", "Docker"]
  repo: ""
  demo: ""
  screenshots: []
  why_it_matters: ""
  next_action: ""
```

## Seed entries

```yaml
- name: "Korvus / Hermes Personal AI System"
  type: "AI automation"
  status: "in-progress"
  one_liner: "A multi-platform personal AI assistant running through Hermes on Linux, Telegram, Discord, Notion, Gmail, cron scripts, and isolated profiles."
  tech: ["Hermes Agent", "Linux", "Python", "Telegram", "Discord", "Gmail API", "Notion API", "Cron", "Docker"]
  repo: ""
  demo: ""
  screenshots: []
  why_it_matters: "Shows practical AI automation, local system integration, privacy-aware profile separation, and useful real-world workflows."
  next_action: "Write a polished case study with architecture diagram and screenshots."

- name: "Personal Portfolio Site"
  type: "coding"
  status: "in-progress"
  one_liner: "A public site to showcase coding, AI automation, creative projects, and an optional interactive bio world."
  tech: ["HTML", "CSS", "Canvas JavaScript", "Astro or Next.js later", "Markdown/MDX"]
  repo: ""
  demo: "demos/minecraft-bio-section/"
  screenshots: []
  why_it_matters: "Gives all future projects a professional home and lets visitors discover personal/project info through an interactive experience."
  next_action: "Keep the interactive bio as an optional experience alongside the standard portfolio pages."
```
