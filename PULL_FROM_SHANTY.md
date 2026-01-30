# Pull from shanty and keep your current changes

You're on **main** with uncommitted changes. To bring in **shanty** while keeping what you have:

---

## Option 1: Commit your work, then merge shanty (keep yours on conflicts)

Run these in the **CIPHER** folder.

### 1. Save your current changes (commit on main)
```bash
cd CIPHER
git add .
git commit -m "Dashboard and auth fixes - keep when merging shanty"
```

### 2. Fetch and merge shanty (on conflict, keep your version)
```bash
git fetch origin shanty
git merge origin/shanty -X ours
```
- **-X ours** = when a file conflicts, keep **your** (main's) version.
- If there are no conflicts, the merge just adds shanty's commits.
- If Git says "Already up to date", main already has everything from shanty.

### 3. If Git says "merge not possible" or asks for a message
- If it opens an editor for the merge message: save and close (e.g. in VS Code save and close the file).
- If it says "merge with strategy -X ours failed" or there are conflicts anyway, do a normal merge and resolve manually (see Option 2).

### 4. Push (optional)
```bash
git push origin main
```

---

## Option 2: Merge shanty and resolve conflicts manually (keep yours per file)

Use this if you want to pick exactly what to keep in each conflicted file.

### 1. Commit your work
```bash
cd CIPHER
git add .
git commit -m "Dashboard and auth fixes"
```

### 2. Merge shanty (no strategy)
```bash
git fetch origin shanty
git merge origin/shanty
```

### 3. If there are conflicts
- Git will list files: e.g. `frontend/src/App.tsx`.
- Open each file. You'll see:
  ```
  <<<<<<< HEAD
  (your current code)
  =======
  (shanty's code)
  >>>>>>> origin/shanty
  ```
- Edit the file to keep the version you want (or combine both). Delete the `<<<<<<<`, `=======`, `>>>>>>>` lines.
- Save, then:
  ```bash
  git add .
  git commit -m "Merge shanty into main, keep current changes"
  ```

### 4. Push (optional)
```bash
git push origin main
```

---

## Option 3: You have uncommitted changes and don't want to commit yet

### 1. Stash your changes
```bash
cd CIPHER
git stash push -m "My work before pulling shanty"
```

### 2. Fetch and merge shanty
```bash
git fetch origin shanty
git merge origin/shanty -X ours
```

### 3. Re-apply your stashed changes
```bash
git stash pop
```
- If conflicts when popping: fix them in the listed files (keep your code), then `git add .` and `git stash drop`.

---

## Summary

| Goal | Use |
|------|-----|
| Keep your version on every conflict | Option 1: commit, then `git merge origin/shanty -X ours` |
| Choose per file what to keep | Option 2: commit, merge, then fix conflicts manually |
| Don't commit yet | Option 3: stash → merge shanty → stash pop |

Run all commands from the **CIPHER** folder.
