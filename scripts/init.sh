#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: ./scripts/init.sh <project-name> <org-name>"
  echo "Example: ./scripts/init.sh my-project myorg"
  echo ""
  echo "This will:"
  echo "  - Replace @acme/ with @<org-name>/ in all source files"
  echo "  - Update the root package.json name to <project-name>"
  exit 1
fi

PROJECT_NAME="$1"
ORG_NAME="$2"

echo "Renaming project to '$PROJECT_NAME' with scope '@$ORG_NAME/'..."

# Replace @acme/ with @<org>/ in all relevant files
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.js" -o -name "*.md" -o -name "*.yaml" -o -name "*.yml" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/dist/*" \
  -exec sed -i '' "s/@acme\//@${ORG_NAME}\//g" {} +

# Update root package.json name
sed -i '' "s/\"name\": \"acme-app\"/\"name\": \"${PROJECT_NAME}\"/" package.json

# Update HTML title
find . -name "index.html" -not -path "*/node_modules/*" -exec sed -i '' "s/Acme App/${PROJECT_NAME}/g" {} +

# Update nav branding
find . -type f -name "*.tsx" -not -path "*/node_modules/*" -exec sed -i '' "s/>Acme</>$(echo "$PROJECT_NAME" | sed 's/[-_]/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1))tolower(substr($i,2))}1')</g" {} +

echo "Done! Project renamed to '$PROJECT_NAME' with scope '@$ORG_NAME/'."
echo ""
echo "Next steps:"
echo "  1. pnpm install"
echo "  2. pnpm build"
echo "  3. pnpm dev"
