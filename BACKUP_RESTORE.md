# AmpMatter Backup & Restore Guide

## Current Baseline: v1.0 (2026-01-15)

This is a known-good production-ready state with:
- MQTT reconnection with exponential backoff
- Code splitting (814KB → 215KB)
- Settings UI for relay configuration
- 5 swipeable views fully functional

---

## Available Backups

### 1. Git Tag: `v1.0-baseline`
The project is now under version control with git.

**View baseline:**
```bash
git show v1.0-baseline
git log v1.0-baseline
```

**Restore to baseline:**
```bash
# Discard all changes and return to baseline
git reset --hard v1.0-baseline

# Or create a new branch from baseline
git checkout -b new-feature v1.0-baseline
```

**View all tags:**
```bash
git tag -l
```

### 2. Archive Backup: `/home/mario/AmpMatter-baseline-v1.0-20260115.tar.gz`
A compressed archive (96KB) excluding node_modules and dist.

**Restore from archive:**
```bash
cd /home/mario
# Backup current state first if needed
mv AmpMatter AmpMatter.backup

# Extract baseline
tar -xzf AmpMatter-baseline-v1.0-20260115.tar.gz

# Reinstall dependencies
cd AmpMatter
npm install

# Rebuild
npm run build
```

---

## Creating Future Backups

### Git Method (Recommended)
```bash
# Stage changes
git add -A

# Commit with descriptive message
git commit -m "Your changes description"

# Tag important milestones
git tag -a v1.1-feature-name -m "Description of this version"
```

### Archive Method (Quick backup)
```bash
cd /home/mario
tar -czf "AmpMatter-backup-$(date +%Y%m%d-%H%M).tar.gz" \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='*.log' \
  AmpMatter
```

---

## Git Workflow Tips

### Check current status
```bash
git status
git log --oneline -5  # Last 5 commits
```

### View changes
```bash
git diff                    # Unstaged changes
git diff --staged           # Staged changes
git diff v1.0-baseline     # Compare to baseline
```

### Create feature branches
```bash
# Start new feature from baseline
git checkout -b feature-name v1.0-baseline

# Work on feature...
git add -A
git commit -m "Implement feature"

# Merge back to master when ready
git checkout master
git merge feature-name
```

### Undo changes
```bash
# Undo uncommitted changes to specific file
git checkout -- filename

# Undo all uncommitted changes
git reset --hard HEAD

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Return to baseline (nuclear option)
git reset --hard v1.0-baseline
```

---

## Recommended Backup Strategy

1. **Git commits**: After each logical unit of work
2. **Git tags**: When reaching stable milestones (v1.1, v1.2, etc.)
3. **Archive backups**: Before major refactoring or risky changes
4. **External backup**: Copy archives to USB drive or cloud storage

---

## Emergency Recovery

If everything breaks:
```bash
# Option 1: Restore from git
git reset --hard v1.0-baseline
npm install
npm run build

# Option 2: Restore from archive
cd /home/mario
rm -rf AmpMatter
tar -xzf AmpMatter-baseline-v1.0-20260115.tar.gz
cd AmpMatter
npm install
npm run build
```

Both will return you to the current known-good baseline.
