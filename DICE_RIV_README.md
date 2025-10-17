# Rive Dice Setup

## Required File

You need to add a `dice.riv` file to your `public/` folder.

### How to get a dice.riv file:

1. **Option 1: Create your own**
   - Go to https://rive.app/
   - Create a new project
   - Design an animated dice with 6 faces (1-6)
   - Add a State Machine called "State Machine 1"
   - Add a "roll" input (number type)
   - Export as `dice.riv`

2. **Option 2: Use a community file**
   - Browse https://rive.app/community/
   - Search for "dice" animations
   - Download a dice animation file
   - Rename it to `dice.riv`

3. **Place the file:**
   ```
   public/dice.riv
   ```

## State Machine Requirements

The dice.riv file should have:
- State Machine name: "State Machine 1"
- Input name: "roll" (Number type)
- Should show faces 1-6 based on the roll input value

## Current Implementation

The game now uses Rive dice with:
- Animated rolling effect
- Color-coded glows for different dice types:
  - Red glow for Attack dice
  - Green glow for Heal dice
  - Purple glow for Chaos dice
  - Gold glow for Random Event dice
- Smooth entrance animations
- Mobile responsive scaling
