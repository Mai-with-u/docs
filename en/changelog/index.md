---
title: Changelog
---

# Changelog

This page records the major version updates of MaiBot. For the complete changelog, please refer to [GitHub Releases](https://github.com/Mai-with-u/MaiBot/releases).

## v1.0.0

### 🌟 Major Updates

- **Maisaka Reasoning Engine Refactor**: Comprehensive upgrade of the planning and reply generation collaboration mechanism, with Planner and Replyer now deeply integrated
- **Thinking Effort Mechanism**: Dynamically controls reply timing and length for more natural conversation rhythm
- **A-Memorix Memory Engine v1.0**: Brand new long-term memory system with knowledge graphs, person profiles, and chat summaries
- **Feedback Correction System**: Automatically corrects outdated memories based on user feedback, keeping memories up-to-date
- **MCP Built-in Plugin**: Model Context Protocol added as a built-in plugin, disabled by default
- **Global Memory**: New global memory configuration option for cross-session memory retrieval

### 🖥️ WebUI Major Updates

- **Model Preset Marketplace**: Share complete model configurations, share button located in the top right of the model configuration interface
- **Comprehensive Security Hardening**: Authentication protection added to all WebUI API and WebSocket endpoints, Cookie with Secure and SameSite attributes
- **Frontend Auth Refactor**: Migrated from localStorage to HttpOnly Cookie, added WebSocket temporary token authentication
- **Enhanced Plugin Config Management**: Supports raw TOML config loading and saving, frontend supports viewing and editing plugin config source files

### Detail Updates

- Removed automatic frequency adjustment
- Removed emotion feature
- Optimized memory retrieval timeout settings
- Plugin installation now supports selecting clone branch
- Homepage feedback survey feature for submitting feedback and suggestions
- Jargon and expression extraction no longer captures content containing names
- Model interface supports editing extra params fields
- Model task assignment supports editing slow request detection threshold
- Model interface supports specifying temperature and max_tokens per model

## v0.12.2

- Optimized private chat wait logic
- Forced reply quoting on timeout
- Fixed some adapter disconnection issues
- Fixed expression reflection config not taking effect
- Optimized memory retrieval logic

## v0.12.1

### 🌟 Major Updates

- Added annual summary feature, viewable in WebUI
- Optional LLM-judged reply quoting
- Expression optimization: automatic and manual evaluation for more precise results
- Reply and planning records: WebUI can view details of each reply and plan

### Detail Updates

- Optimized display of messages with long intervals
- Enabled jargon detection (enable_jargon_detection)
- Global memory blacklist (global_memory_blacklist), specifying group chats excluded from global memory
- Removed utils_small model, removed deprecated LPMM model

## v0.12.0

### 🌟 Major Updates

- Added thinking effort mechanism for dynamic reply timing and length control
- Planner and Replyer integration for better reply logic
- New private chat system
- Added Mai dreaming feature
- MCP plugin added as built-in
- Added global memory configuration

## Earlier Versions

For changelogs of earlier versions, please refer to [GitHub Releases](https://github.com/Mai-with-u/MaiBot/releases) or the `changelogs/` directory in the project repository.
