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
  status: "idea"
  one_liner: "A public site to showcase coding, AI automation, and creative projects."
  tech: ["Astro or Next.js", "Tailwind CSS", "Markdown/MDX"]
  repo: ""
  demo: ""
  screenshots: []
  why_it_matters: "Gives all future projects a professional home."
  next_action: "Choose stack and create the first local site scaffold."
```
