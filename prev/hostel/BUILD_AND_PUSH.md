# Build and Push All React Projects on Production Server

Run these commands on your production server to build all React projects and push them:

## Commands to Run on Production Server

```bash
# 1. Build and push hostel_react
cd /home/admin/hostel_react
git pull origin master
npm install  # Only if dependencies changed
npm run build
git add -f dist/
git commit -m "Build production bundle"
git push origin master

# 2. Build and push hostel_manager
cd /home/admin/hostel_manager
git pull origin main
npm install  # Only if dependencies changed
npm run build
git add -f dist/
git commit -m "Build production bundle"
git push origin main

# 3. Build and push hostel_admin
cd /home/admin/hostel_admin
git pull origin master
npm install  # Only if dependencies changed
npm run build
git add -f dist/
git commit -m "Build production bundle"
git push origin master

# 4. Build and push hostel_market
cd /home/admin/hostel_market
git pull origin master
npm install  # Only if dependencies changed
npm run build
git add -f dist/
git commit -m "Build production bundle"
git push origin master
```

## One-Liner Script (All Projects)

```bash
# Build and push all projects
for project in hostel_react hostel_manager hostel_admin hostel_market; do
  cd /home/admin/$project
  echo "Building $project..."
  git pull origin $(git branch --show-current)
  npm install
  npm run build
  git add -f dist/
  git commit -m "Build production bundle" || echo "No changes to commit"
  git push origin $(git branch --show-current)
  echo "$project done!"
done
```

## If Build Fails Due to Memory

If you get memory errors during build, try:

```bash
# Set Node memory limit
export NODE_OPTIONS="--max-old-space-size=2048"

# Then run builds
npm run build
```

## Quick Check After Building

```bash
# Verify dist folders exist
ls -la /home/admin/hostel_react/dist/
ls -la /home/admin/hostel_manager/dist/
ls -la /home/admin/hostel_admin/dist/
ls -la /home/admin/hostel_market/dist/
```

