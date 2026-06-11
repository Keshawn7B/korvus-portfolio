# Case Study Draft: Korvus / Hermes Personal AI System

## One-liner

A Linux-hosted personal AI assistant that connects Telegram, Discord, Notion, Gmail, local automation, and separated profiles into one practical command system.

## Problem

Most AI assistants are trapped in chat. They can answer questions, but they cannot reliably organize work, run local tools, schedule safe automations, or keep different people's contexts separated.

## Solution

Build a Hermes-based AI setup that can:

- talk through Telegram and Discord
- manage local Linux files and scripts
- use Notion for structured knowledge/workspaces
- send Gmail reminders through OAuth-based access
- run script-only cron tasks without wasting LLM tokens
- isolate Keytana as a separate profile for Solaf
- keep sensitive credentials out of chat

## Interesting technical points

- Separate Hermes profiles for privacy boundaries
- Gmail send access through stored OAuth token, not raw password sharing
- Script-only cron jobs to avoid LLM token consumption
- Linux workspace convention: `~/korvus-workspace`
- Practical tool stack: GitHub CLI, Docker, Node, Python, ffmpeg, tmux

## Portfolio angle

This is not just a chatbot setup. It is a personal automation platform with real integrations, recurring tasks, safe credential handling, and multi-user boundaries.

## Assets needed

- architecture diagram
- screenshot of Telegram/Discord interaction, with private info blurred
- screenshot or mockup of Notion workspace
- short terminal/tooling screenshot

## Next action

Turn this into a polished portfolio project page with a diagram and a simple public-safe explanation.
