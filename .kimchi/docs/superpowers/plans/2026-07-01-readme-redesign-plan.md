# README Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `README.md` to a polished, industry-standard README suitable for portfolios and hiring.

**Architecture:** Replace the current dense README with a concise, visually hierarchical document. Keep all essential onboarding info but strip verbosity, add a hero placeholder, and restructure into scannable sections.

**Tech Stack:** Markdown only. No code dependencies.

---

### Task 1: Create hero image placeholder asset directory

**Files:**
- Create: `public/images/` (if missing)
- Create: `public/images/screenshot.png` placeholder note in README

- [ ] **Step 1: Ensure directory exists**

Run:
```bash
mkdir -p /Users/himanshu/Git/DSA-guide/public/images
```

Expected: directory exists, no output.

- [ ] **Step 2: Note placeholder path**

The README will reference `public/images/screenshot.png`. The actual screenshot can be added later.

---

### Task 2: Rewrite README.md

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace README content with polished version**

Rewrite `README.md` to include:
1. Centered hero screenshot placeholder + caption
2. Tech badge row
3. One-line pitch
4. Feature highlights (4–6 bullets)
5. Tech stack list
6. Copy-paste Quick Start
7. Project structure tree
8. Contributing paragraph + Code of Conduct link
9. Security reporting line
10. License line

- [ ] **Step 2: Verify no TODOs or placeholder text remain**

Run:
```bash
cd /Users/himanshu/Git/DSA-guide && grep -n -i "TODO\|TBD\|placeholder text\|fixme" README.md
```

Expected: no matches.

- [ ] **Step 3: Render check**

Run:
```bash
cd /Users/himanshu/Git/DSA-guide && wc -l README.md
```

Expected: README is under ~150 lines.

- [ ] **Step 4: Commit**

```bash
cd /Users/himanshu/Git/DSA-guide && git add README.md && GIT_EDITOR=true git commit -m "docs: rewrite README to industry-standard polished format"
```

---

### Task 3: Final verification

**Files:**
- Read: `README.md`

- [ ] **Step 1: Read final README**

Open `/Users/himanshu/Git/DSA-guide/README.md` and confirm all sections render correctly and links work.

- [ ] **Step 2: Confirm git status is clean**

Run:
```bash
cd /Users/himanshu/Git/DSA-guide && git status --short
```

Expected: empty output or only committed files.
