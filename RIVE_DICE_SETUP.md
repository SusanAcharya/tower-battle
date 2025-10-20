# Rive Dice Integration - Troubleshooting Guide

## ✅ Successfully Integrated!

The Rive dice animation has been added to Tower Ascend. Here's what to check if something isn't working:

## 🎯 Required Rive File Configuration

Your `public/bgremoveddice.riv` file MUST have these exact settings:

### State Machine Setup:
- **Name**: `"State Machine 1"`

### Required Inputs:
1. **Number Input**
   - Name: `"roll"`
   - Type: Number
   - Range: 1-6
   - Purpose: Tells the dice which face to land on

2. **Trigger Input**
   - Name: `"roll"` (can be same name as number input)
   - Type: Trigger
   - Purpose: Starts the rolling animation

## 🔍 Debugging Steps

### 1. Check Console for Errors
Open browser DevTools (F12) and look for:
- "Rive file not found" → File path is wrong
- "State machine not found" → Wrong state machine name
- "Input not found" → Missing roll input

### 2. Verify File Path
The dice looks for: `/public/bgremoveddice.riv`
- File should be in the `public` folder
- No `/public/` prefix needed in code (Vite handles it)

### 3. Test Rive File in Editor
1. Go to https://rive.app/
2. Upload your `bgremoveddice.riv`
3. Click on State Machine tab
4. Verify inputs exist:
   - Set "roll" number to 6
   - Fire "roll" trigger
   - Does it animate to face 6?

### 4. Change File Path (if needed)
Edit `src/RiveDice.jsx` line 12:
```jsx
src = '/bgremoveddice.riv',  // ← Change this path
```

Or edit `src/Game.jsx` line 39:
```jsx
<RiveDice
  rolling={shouldRoll && !hasRolled}
  outcome={finalValue}
  onEnd={handleRollEnd}
  size={150}
  src="/your-dice-file.riv"  // ← Add custom path here
/>
```

## 🎨 Customize Dice Size

Edit `src/Game.jsx` line 39:
```jsx
size={150}  // ← Change dice size (in pixels)
```

## ⚙️ Customize Animation Speed

Edit `src/RiveDice.jsx` line 8:
```jsx
const ROLL_ANIM_MS = 1000;  // ← Change duration (in milliseconds)
```

## 📝 Files Modified

1. **src/RiveDice.jsx** - New Rive dice component
2. **src/Game.jsx** - Integrated dice into battle system

## 🔄 How It Works

```
Battle starts
  ↓
Player clicks ATTACK
  ↓
Game.jsx generates random numbers [3, 6]
  ↓
DelayedRiveDice renders:
  - Dice 1: rolling=true, outcome=3 (starts immediately)
  - Dice 2: rolling=true, outcome=6 (starts after 200ms)
  ↓
RiveDice component:
  1. Sets outcome value in Rive (3 for first die)
  2. Fires roll trigger
  3. Plays 1 second animation
  4. Pauses on face 3
  5. Calls onEnd() callback
  ↓
Battle continues with results
```

## 🆘 Still Not Working?

### Option 1: Use a Different Rive File
Find a pre-made dice on [Rive Community](https://rive.app/community/)

### Option 2: Check DICE_RIV_README.md
You have a file called `DICE_RIV_README.md` - it might contain important info about your Rive file.

### Option 3: Fallback to Old Dice
To revert to the slot machine dice, copy the old component from git history:
```bash
git diff HEAD~1 src/Game.jsx
```

## ✨ Expected Result

When working correctly, you should see:
- Smooth 3D dice rolling animation
- Dice tumbling realistically for 1 second
- Dice landing on the exact number rolled
- Multiple dice with staggered timing
- Professional game feel!

## 📖 Learn More

- [Rive Documentation](https://rive.app/docs)
- [Rive React Canvas](https://github.com/rive-app/rive-react)
- [State Machine Inputs](https://help.rive.app/editor/state-machine)

