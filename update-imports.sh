#!/bin/bash

# Update all vendor designcombo imports to use npm packages
echo "Updating designcombo imports..."

# Find all TypeScript/JavaScript files and update imports
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/@\/vendor\/designcombo\//@designcombo\//g'

echo "Import updates completed!"
echo "Updated paths:"
echo "  @/vendor/designcombo/types -> @designcombo/types"
echo "  @/vendor/designcombo/state -> @designcombo/state"
echo "  @/vendor/designcombo/timeline -> @designcombo/timeline"
echo "  @/vendor/designcombo/events -> @designcombo/events"
echo "  @/vendor/designcombo/frames -> @designcombo/frames"