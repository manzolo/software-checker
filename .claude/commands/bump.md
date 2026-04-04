---
description: Bump version, publish release to GitHub and deploy to home-server
argument-hint: patch | minor | major | <semver>
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

Perform a version bump and release of software-checker. Argument: $ARGUMENTS (patch | minor | major | explicit semver like 1.2.3)

If no argument is provided, default to `patch`.

## Steps — execute in order, stop and report if any step fails

### 0. Check for pending changes

Run: `git status --short`

If there are any uncommitted changes (staged or unstaged):
- Show the list of modified files to the user
- Use `AskUserQuestion` to ask:
  - Question: "Ci sono modifiche non committate. Vuoi committarle prima del bump?"
  - Header: "Modifiche pendenti"
  - Options: "Sì, committo ora" / "No, includi nel commit di release" / "Annulla"
- If "Sì, committo ora":
  - Ask for a commit message (use `AskUserQuestion` with free text via "Other")
  - Run: `git add -A && git commit -m "<message>"`
- If "No, includi nel commit di release": continue (they will be picked up in step 3)
- If "Annulla": stop immediately

### 1. Determine the new version

Run: `git tag --sort=-v:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | head -1`

If no tag exists, start from `v0.0.0`.

Strip the leading `v` to get CURRENT (e.g. `0.1.0`).

Compute NEW version based on the argument:
- `patch` → increment third number (0.1.0 → 0.1.1)
- `minor` → increment second, reset third (0.1.0 → 0.2.0)
- `major` → increment first, reset others (0.1.0 → 1.0.0)
- explicit semver (e.g. `1.2.3`) → use as-is

NEW_TAG = `v<new version>` (e.g. `v0.1.1`)

Use `AskUserQuestion` to ask the user for confirmation before proceeding:
- Question: "Bumping vCURRENT → NEW_TAG. Procedo?"
- Header: "Conferma"
- Options: "Sì" (proceed) / "No" (abort)

If the user answers "No", stop immediately.

### 2. Update VERSION file

Write the new version (without `v` prefix) to `backend/VERSION`:

```bash
echo "<new version>" > backend/VERSION
```

### 3. Stage and commit pending changes

Run: `git status --short`

If there are unstaged/staged changes (including the VERSION file update):
```bash
git add -A
git commit -m "chore: release $NEW_TAG"
```

If the working tree is already clean after updating VERSION, commit only VERSION:
```bash
git add backend/VERSION
git commit -m "chore: release $NEW_TAG"
```

### 4. Create git tag

```bash
git tag -a $NEW_TAG -m "Release $NEW_TAG"
```

### 5. Push commit and tag to GitHub

```bash
git push origin HEAD
git push origin $NEW_TAG
```

This triggers the GitHub Actions workflow which builds and pushes Docker images to Docker Hub automatically.

### 6. Create GitHub Release

```bash
gh release create $NEW_TAG \
  --title "Release $NEW_TAG" \
  --generate-notes
```

### 7. Rebuild local containers

Rebuild and restart the local stack so the running containers reflect the new version:

```bash
./manager.sh build
docker compose up -d
```

Wait for containers to become healthy, then verify:

```bash
curl -s http://localhost/api/health
```

### 8. Deploy to home-server

Ask the user: "Vuoi fare il deploy su home-server adesso?"

If yes:

Wait for the GitHub Actions workflow to finish pushing the images to Docker Hub before proceeding. Poll every 15 seconds:

```bash
gh run list --repo manzolo/software-checker --limit 1 --json status,conclusion,headBranch \
  --jq '.[0] | "status: \(.status) conclusion: \(.conclusion)"'
```

Once the workflow completes successfully, update `IMAGE_TAG` in the remote `.env`, pull the new images and restart:

```bash
ssh root@home-server "cd ~/software-checker && \
  sed -i 's|^IMAGE_TAG=.*|IMAGE_TAG=<new version>|' .env && \
  grep -q '^IMAGE_TAG=' .env || echo 'IMAGE_TAG=<new version>' >> .env && \
  docker compose pull && docker compose up -d"
```

Replace `<new version>` with the actual semver string (without `v` prefix), e.g. `0.1.1`.

Then verify the remote health endpoint:

```bash
ssh root@home-server "curl -s http://software-checker.lan/api/health"
```

If the user says no, skip this step and mention they can deploy later with:
```bash
ssh root@home-server "cd ~/software-checker && \
  sed -i 's|^IMAGE_TAG=.*|IMAGE_TAG=<new version>|' .env && \
  grep -q '^IMAGE_TAG=' .env || echo 'IMAGE_TAG=<new version>' >> .env && \
  docker compose pull && docker compose up -d"
```

### 9. Cleanup old Docker images

Remove old local Docker images, keeping only the 2 most recent for each service (`software-checker-backend` and `software-checker-frontend`):

```bash
for image in software-checker-backend software-checker-frontend; do
  docker images "$image" --format "{{.ID}} {{.CreatedAt}}" \
    | sort -k2 -r \
    | awk 'NR>2 {print $1}' \
    | xargs -r docker rmi -f
done
```

Also prune dangling images:

```bash
docker image prune -f
```

If the deploy to home-server was done, run the same cleanup remotely:

```bash
ssh root@home-server "
  for image in manzolo/software-checker-backend manzolo/software-checker-frontend; do
    docker images \"\$image\" --format '{{.ID}} {{.CreatedAt}}' \
      | sort -k2 -r \
      | awk 'NR>2 {print \$1}' \
      | xargs -r docker rmi -f
  done
  docker image prune -f
"
```

### 10. Report

Print a summary:
- Tag pushed: `$NEW_TAG`
- GitHub Release: URL returned by `gh release create`
- Local stack: rebuilt and running `$NEW_TAG`
- Remote deploy (home-server): deployed / skipped
- CI workflow: "Images will be published to Docker Hub by the GitHub Actions workflow — check the Actions tab on github.com/manzolo/software-checker"

## Prerequisites (remind user if missing)
- `gh` CLI authenticated (`gh auth status`)
- Remote `origin` set to GitHub (`git remote -v`)
- Secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` configured in repository settings
