#!/usr/bin/env bash
# deploy-with-alias.sh - Full Vercel deploy + custom domain alias + verify-live.
# Usage: ./deploy-with-alias.sh <slug> <team> [domain]
#   slug  = project name (e.g. tripforge)
#   team  = Vercel team ID (team_rk4brhGUN6CKDnAc96ywwFFV)
#   domain = full domain (default: ${slug}.zwart.my.id)
#
# Why this script: Vercel new projects default to SSO protection (breaks preview
# URL test) AND custom domains don't auto-alias to new deployments. This wraps
# all 3 mandatory steps in one command.
#
# Requires: VERCEL_TOKEN, GITHUB_TOKEN in env (source ~/.hermes/secrets/daily_env)

set -e
SLUG="${1:?usage: $0 <slug> <team> [domain]}"
TEAM="${2:?usage: $0 <slug> <team> [domain]}"
DOMAIN="${3:-${SLUG}.zwart.my.id}"

: "${VERCEL_TOKEN:?VERCEL_TOKEN required (source ~/.hermes/secrets/daily_env)}"
: "${GITHUB_TOKEN:?GITHUB_TOKEN required}"

PROJ_DIR="$HOME/daily-projects/zwart-$(date +%Y-%m-%d)-${SLUG}"

echo "==> Step 1: Build Next.js"
cd "$PROJ_DIR"
npm run build || { echo "BUILD FAILED"; exit 1; }

echo "==> Step 2: Create Vercel project"
PROJ_ID=$(curl -s -X POST "https://api.vercel.com/v9/projects?teamId=${TEAM}" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}" -H "Content-Type: application/json" \
  -d "{\"name\":\"${SLUG}\",\"framework\":\"nextjs\",\"gitRepository\":{\"type\":\"github\",\"repo\":\"Zwart04/${SLUG}\",\"productionBranch\":\"main\"}}" \
  | python3 -c "import json,sys; print(json.load(sys.stdin).get('id',''))")
echo "    project_id: $PROJ_ID"

echo "==> Step 3: Disable SSO protection (default aktif, blocks *.vercel.app)"
curl -s -X PATCH "https://api.vercel.com/v9/projects/${PROJ_ID}?teamId=${TEAM}" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}" -H "Content-Type: application/json" \
  -d '{"ssoProtection": null}' > /dev/null

echo "==> Step 4: Add custom domain"
curl -s -X POST "https://api.vercel.com/v10/projects/${PROJ_ID}/domains?teamId=${TEAM}" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}" -H "Content-Type: application/json" \
  -d "{\"name\":\"${DOMAIN}\"}" > /dev/null

echo "==> Step 5: Deploy to production"
DEPLOY_OUTPUT=$(npx --yes vercel deploy --prod --yes --token "${VERCEL_TOKEN}" --scope "${TEAM}" 2>&1)
DEPLOY_ID=$(echo "$DEPLOY_OUTPUT" | grep -oE 'dpl_[A-Za-z0-9]+' | head -1)
echo "    deployment_id: $DEPLOY_ID"

if [ -z "$DEPLOY_ID" ]; then
  echo "DEPLOY FAILED — no deployment id in output"
  echo "$DEPLOY_OUTPUT" | tail -20
  exit 1
fi

echo "==> Step 6: Attach custom domain to new deployment (CRITICAL — without this *.zwart.my.id 404)"
npx --yes vercel alias set "${DEPLOY_ID}" "${DOMAIN}" --token "${VERCEL_TOKEN}" --scope "${TEAM}" | tail -3

echo "==> Step 7: Wait for DNS + warm up"
sleep 5
for i in 1 2 3 4 5; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://${DOMAIN}/")
  echo "    [try $i] $CODE"
  [ "$CODE" = "200" ] && break
  sleep 3
done

echo "==> Step 8: Live verify (puppeteer)"
VERIFY_ROUTES="$(node -e "const f=require('fs'); try { const pkg=JSON.parse(f.readFileSync('${PROJ_DIR}/package.json','utf8')); const app=require('fs').readdirSync('${PROJ_DIR}/src/app').filter(x=>!x.startsWith('.')&&!x.startsWith('_')); console.log(app.join(',')); } catch(e) { console.log('/,login,register,dashboard,settings'); }")"
VERIFY_ROUTES="${VERIFY_ROUTES}" node "$HOME/.hermes/skills/daily-project-orchestration/scripts/verify-live.js" "https://${DOMAIN}"
RC=$?
if [ $RC -eq 0 ]; then
  echo "==> DEPLOY+VERIFY PASS — ${DOMAIN} live"
  echo "    live_url: https://${DOMAIN}"
  echo "    deployment_id: ${DEPLOY_ID}"
  echo "    project_id: ${PROJ_ID}"
else
  echo "==> DEPLOY OK BUT VERIFY FAILED (exit $RC) — check console output above"
  exit $RC
fi
