#!/bin/bash

# Script to update all files that use manual localStorage token access
# to use the shared getAuthHeaders function from auth-headers.ts

FILES=(
  "client/src/hooks/useAbilityScores.ts"
  "client/src/hooks/useDailyGoals.ts"
  "client/src/hooks/useUserStats.ts"
  "client/src/hooks/useSkillsV3.ts"
  "client/src/pages/tasks.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Add import at the top (after existing imports)
    if ! grep -q "from '@/lib/auth-headers'" "$file"; then
      # Find the last import line and add our import after it
      sed -i '' '/^import/!b;:a;n;/^import/ba;i\
import { getAuthHeaders } from '\''@/lib/auth-headers'\'';
' "$file"
    fi
    
    # Remove the local getAuthHeaders function definition
    # This removes from "function getAuthHeaders" to the closing brace and empty line
    perl -i -0pe 's/\/\*\*[\s\S]*?\*\/\s*function getAuthHeaders\(\):.*?\{[^}]*localStorage\.getItem\([^}]*\}[^\n]*\n+//g' "$file"
    
    # Replace inline localStorage.getItem calls with await getAuthHeaders()
    # sed -i '' 's/localStorage\.getItem('\''supabase_access_token'\'')/await getAuthHeaders()/g' "$file"
    
    echo "✓ Updated $file"
  else
    echo "✗ File not found: $file"
  fi
done

echo ""
echo "All files updated! Please review the changes before committing."
