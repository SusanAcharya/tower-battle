# 🏰 Tower Ascend

A cyberpunk-themed arcade platformer game built with React where you battle your way through 10 floors of enemies and bosses!

## 🎮 Game Overview

Tower Ascend is an action-packed platformer that combines classic climbing mechanics with strategic turn-based dice battles. Navigate through a futuristic tower, encounter various NPCs, and defeat powerful bosses to reach the top!

## ✨ Features

### 🏃 Platforming Mechanics
- **Classic Platformer Gameplay** - Inspired by Donkey Kong & Icy Tower
- **10 Floors to Climb** - Each floor brings new challenges
- **Smooth Controls** - WASD/Arrow Keys for movement, Space for jumping
- **Dynamic Camera** - Follows player through the tower
- **Animated Character Sprites** - Walking and idle animations

### ⚔️ Battle System
- **Dice-Based Combat** - Roll dice to attack and heal
- **Strategic Gameplay** - Choose between Attack, Heal, Items, Chaos, and Random Event dice
- **Turn-Based Battles** - Player and enemy alternate turns
- **Visual Dice Animations** - Rive-powered 3D dice rolling animations
- **Battle Transitions** - Cinematic zoom and fade effects when entering battles
- **Limited Healing** - Only 5 heals per battle shared between player and opponent

### 👾 NPCs & Enemies
- **Regular NPCs** - Scattered throughout floors
- **Boss Battles** - Challenging boss every 2 floors (Floors 2, 4, 6, 8, 10)
- **Reveal Mechanic** - NPCs appear as silhouettes until you get close
- **Boss Auras** - Distinctive visual effects for bosses
- **Boss Dialogues** - Story sequences before boss fights

### 🎲 Dice Types
1. **Attack Dice** ⚔️ - Roll 2 dice, sum determines damage (infinite uses)
2. **Heal Dice** 💚 - Roll 2 dice, sum determines healing (5 uses total per battle)
3. **Chaos Dice** 🌀 - Roll 1 dice for random buffs/debuffs (1 use per battle)
   - Triple dice next turn
   - Skip enemy turn
   - Bonus damage
   - And more...
4. **Random Event Dice** 🎯 - Roll 1 dice for game-changing events (1 use per battle)
   - HP swap
   - Meteor damage
   - Full heal for both
   - And more...

### 🎒 Items & Inventory System
- **Attack Items** - Fire Oil, Poison Vial, Acid Flask, Lightning Shard, Ice Bomb, Shadow Essence
- **Utility Items** - Smoke Bomb, Shield Potion, Steel Plating, Frost Barrier, Mirror Crystal
- **Healing Items** - Medkit, Bandages, Antibiotics
- **One-Time Use** - Items are consumed when used
- **Strategic Application** - Apply items to enhance dice rolls
- **Elemental Effects** - Items add burning, poison, freeze, and other effects

### 🏪 Shop & Economy
- **In-Game Currency** - Start with 50 coins
- **Shop System** - Purchase dice and items with coins
- **Item Pricing** - Dice (10 coins), Items (5-20 coins depending on type)
- **Shop Access** - Press 'S' anytime or 'E' near the shop on ground floor
- **Inventory Management** - Press 'Tab' to view your items

### 🎨 Visual Design
- **Cyberpunk Aesthetic** - Dark blues, teals, and warm orange lighting
- **Modern UI** - Fighting game-style battle screen
- **Audiowide Font** - Futuristic typography throughout
- **HP Bars** - Street Fighter-style health displays
- **Battle Log** - Real-time combat information
- **Item Icons** - Beautiful visual representations of all items
- **Boss Indicators** - Special effects and badges for bosses

### 🔊 Audio System
- **Battle Music** - Intense background music during fights
- **Sound Effects** - Attack, heal, dice roll, and special move sounds
- **NPC Dialogues** - Voice-acted character interactions
- **Forfeit Sound** - Special audio when abandoning battles
- **Environmental Audio** - Floor transitions and victory/defeat themes

### 🎯 Boss System
- **5 Unique Bosses** - Each with distinct abilities
  1. **Flame Titan** (Floor 2) - Fire-based attacks
  2. **Toxic Queen** (Floor 4) - Poison specialist
  3. **Ironclad Golem** (Floor 6) - Heavy armor
  4. **Frost Warden** (Floor 8) - Ice powers
  5. **Shadow Reaper** (Floor 10) - Final boss with soul drain
- **Boss Phases** - Behavior changes at 50% and 20% HP
- **Signature Moves** - Unique special attacks for each boss
- **Elemental Weaknesses** - Strategic item usage matters
- **Boss Dialogues** - Pre-battle story sequences

### 🎮 Controls

#### Exploration Mode
- **Move Left**: A or Left Arrow
- **Move Right**: D or Right Arrow
- **Jump**: Space Bar
- **Interact**: E (near NPCs or shop)
- **Open Shop**: S
- **Open Inventory**: Tab

#### Battle Mode
- **Attack**: A key or click Attack button
- **Heal**: H key or click Heal button
- **Items**: I key or click Items button
- **Chaos Dice**: C key or click Chaos button
- **Random Event**: R key or click Event button
- **Forfeit**: F key or click Forfeit button

### 📱 Mobile Support
- Touch-friendly mobile controls
- Responsive UI scaling
- Optimized button layouts

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tower-ascend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` folder.

## 🎯 Game Objective

**Primary Goal**: Climb from Floor 0 to Floor 10

**How to Win**:
1. Navigate through platforming sections
2. Encounter and defeat NPCs in turn-based battles
3. Defeat bosses on Floors 2, 4, 6, 8, and 10
4. Manage your items and coins strategically
5. Reach Floor 10 and defeat the final boss!

## 🛠️ Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Rive** - Animated dice graphics
- **Web Audio API** - Sound effects and music
- **CSS3** - Animations and styling
- **JavaScript ES6+** - Game logic

## 🎲 Battle Mechanics Deep Dive

### HP System
- Player starts with 100 HP
- Regular NPCs have 100 HP
- Bosses have 120-200 HP depending on difficulty
- HP does not regenerate between battles

### Damage Calculation
- Base damage = Sum of dice rolls
- Items can add bonus damage (5-15 points)
- Boss weaknesses multiply damage (1.2x-1.5x)
- Boss phases can increase their damage output

### Healing System
- Only 5 heals available per battle (shared with opponent)
- Heal amount = Sum of dice rolls
- Strategic healing is crucial for boss battles

### Status Effects
- **Burn** 🔥 - 5 damage per turn for 3 turns
- **Poison** ☠️ - 3 damage per turn for 4 turns
- **Freeze** ❄️ - Skip next turn
- **Stun** ⚡ - Skip next turn
- **Shield** 🛡️ - Reduce next damage by 50%
- **Reflect** 💎 - Return damage to attacker

## 🏆 Tips & Strategy

1. **Save Chaos & Event Dice** - Use them strategically in tough battles
2. **Manage Heals Wisely** - Only 5 per battle!
3. **Learn Boss Weaknesses** - Use the right items for massive damage
4. **Shop Smart** - Buy items before boss floors
5. **Watch HP Carefully** - Boss phases can catch you off guard
6. **Use Items Early** - Don't hoard them for "the right moment"

## 📝 Credits

Game developed with ❤️ using React and modern web technologies.

---

**Enjoy climbing the tower!** 🏰✨
