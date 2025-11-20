#!/bin/bash

# Secret Santa Draw Generator
# This script creates Secret Santa assignments for both families

YEAR=$(date +%Y)
FAMILIES_DIR="families/$YEAR"

echo "🎅 Secret Santa Draw Generator för $YEAR 🎄"
echo "=============================================="

# Create directory if it doesn't exist
mkdir -p "$FAMILIES_DIR"

# Function to create a circular assignment from a list of names
create_circular_assignment() {
    local family_name="$1"
    local names_file="$2"
    local output_file="$3"
    
    echo "Skapar dragning för $family_name..."
    
    # Read names into array (portable approach)
    names=()
    while IFS= read -r line; do
        if [[ -n "$line" ]]; then
            names+=("$line")
        fi
    done < <(grep -v '^#' "$names_file" | grep -v '^$' | sed 's/[[:space:]]*$//')
    
    if [ ${#names[@]} -lt 2 ]; then
        echo "❌ Fel: Behöver minst 2 namn i $names_file"
        return 1
    fi
    
    # Shuffle the names randomly
    shuffled=($(printf '%s\n' "${names[@]}" | shuf))
    
    # Create CSV header
    echo "# $family_name - Budget: $([ "$family_name" = "Familjen Magnusson" ] && echo "600" || echo "700") kr per present" > "$output_file"
    echo "# Giver,Receiver" >> "$output_file"
    
    # Create circular assignments (each person gives to the next, last gives to first)
    for i in "${!shuffled[@]}"; do
        giver="${shuffled[i]}"
        next_index=$(( (i + 1) % ${#shuffled[@]} ))
        receiver="${shuffled[next_index]}"
        echo "$giver,$receiver" >> "$output_file"
    done
    
    echo "✅ $family_name dragning klar: $output_file"
    echo "   Deltagare: ${#names[@]}"
    echo ""
}

# Check if participant files exist
MAGNUSSON_PARTICIPANTS="participants/magnusson_participants.txt"
SODERWALL_PARTICIPANTS="participants/soderwall_participants.txt"

if [ ! -f "$MAGNUSSON_PARTICIPANTS" ]; then
    echo "❌ Fel: Hittar inte $MAGNUSSON_PARTICIPANTS"
    echo "Skapa filen med namn (ett per rad)"
    exit 1
fi

if [ ! -f "$SODERWALL_PARTICIPANTS" ]; then
    echo "❌ Fel: Hittar inte $SODERWALL_PARTICIPANTS"
    echo "Skapa filen med namn (ett per rad)"
    exit 1
fi

# Generate assignments for both families
create_circular_assignment "Familjen Magnusson" "$MAGNUSSON_PARTICIPANTS" "$FAMILIES_DIR/magnusson.csv"
create_circular_assignment "Familjen Söderwall" "$SODERWALL_PARTICIPANTS" "$FAMILIES_DIR/soderwall.csv"

echo "🎄 Alla dragningar klara för $YEAR! 🎄"
echo ""
echo "Filer skapade:"
echo "  - $FAMILIES_DIR/magnusson.csv"
echo "  - $FAMILIES_DIR/soderwall.csv"
echo ""
echo "Webbsidan kommer nu automatiskt att ladda $YEAR års dragningar."