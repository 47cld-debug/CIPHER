# Move Your Changes to Branch `maria`

You have uncommitted changes on `main` and want them on branch `maria`. Follow these steps in the **CIPHER** folder.

---

## Option A: Put changes on `maria` without committing to main (recommended)

### 1. Stash your changes
```bash
cd CIPHER
git stash push -m "Dashboard and auth fixes for maria"
```

### 2. Switch to branch maria (create it from remote if needed)
```bash
git fetch origin maria
git checkout maria
```
If you get "branch maria already exists" locally, just: `git checkout maria`

### 3. Apply your stashed changes
```bash
git stash pop
```
- If there are **no conflicts**: you'll see "Dropped refs/stash@{0}". Go to step 4.
- If there are **conflicts**: Git will list the files. Open each file, look for `<<<<<<<`, `=======`, `>>>>>>>`, edit to keep the correct code, save, then:
  ```bash
  git add <each conflicted file>
  git stash drop
  ```

### 4. Commit on maria
```bash
git add .
git status
git commit -m "Dashboard load fix, auth/dashboard improvements, migration fix"
```

### 5. Push maria (optional)
```bash
git push origin maria
```

---

## Option B: Commit on main, then merge into maria

### 1. Commit on main
```bash
cd CIPHER
git add .
git commit -m "Dashboard load fix, auth/dashboard improvements, migration fix"
```

### 2. Switch to maria and merge main
```bash
git fetch origin maria
git checkout maria
git merge main
```
- If Git says "Already up to date", maria already has main's commits.
- If there are **merge conflicts**, fix them in the listed files (remove `<<<<<<<`, `=======`, `>>>>>>>` and keep the right code), then:
  ```bash
  git add .
  git commit -m "Merge main into maria"
  ```

### 3. Push maria (optional)
```bash
git push origin maria
```

---

## If you see "index.lock" or "unable to unlink"

Close any other Git tools (VS Code Git, GitHub Desktop, etc.), then:
```bash
cd CIPHER
del .git\index.lock
```
(or remove the file manually), then run your git commands again.

---

## Summary

- **Option A**: Stash → checkout maria → stash pop → fix conflicts if any → commit on maria.
- **Option B**: Commit on main → checkout maria → merge main → fix conflicts if any → push maria.

After this, your changes will be on the `maria` branch.
