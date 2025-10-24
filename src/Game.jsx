import React, { useState, useEffect, useRef } from 'react'
import './Game.css'
import RiveDice from './RiveDice'

const GAME_WIDTH = 1000
const GAME_HEIGHT = 600
const PLAYER_WIDTH = 75
const PLAYER_HEIGHT = 95
const GRAVITY = 0.6
const JUMP_FORCE = -15
const MOVE_SPEED = 5
const FLOOR_HEIGHT = 80
const PLATFORM_HEIGHT = 20

// Boss Definitions
const BOSSES = [
  {
    id: 'flame_titan',
    name: 'Flame Titan',
    image: '/boss/boss1.png',
    hp: 150,
    floor: 2,
    strongAgainst: ['fire'],
    weakAgainst: ['ice'],
    signatureMove: {
      name: 'Firewave',
      description: 'AOE fire damage',
      damage: 25,
      effect: 'burn'
    },
    phase50: { damageMultiplier: 1.2, message: 'Flame Titan burns brighter!' },
    phase20: { damageMultiplier: 1.5, message: 'Flame Titan enters rage mode!' },
    dialogues: [
      "So... another fool seeks to climb the tower.",
      "My flames have consumed countless before you. You will be no different.",
      "Prepare to burn!"
    ]
  },
  {
    id: 'toxic_queen',
    name: 'Toxic Queen',
    image: '/boss/boss2.png',
    hp: 140,
    floor: 4,
    strongAgainst: ['poison'],
    weakAgainst: ['lightning', 'fire'],
    signatureMove: {
      name: 'Toxin Spray',
      description: 'Applies stacking poison',
      damage: 15,
      effect: 'poison'
    },
    phase50: { damageMultiplier: 1.15, message: 'Toxic Queen releases poison gas!' },
    phase20: { damageMultiplier: 1.4, message: 'Toxic Queen becomes desperate!' },
    dialogues: [
      "Impressive... You made it past the Flame Titan.",
      "But poison is patient. It seeps, it spreads... it kills slowly.",
      "Let's see how long you can hold your breath."
    ]
  },
  {
    id: 'ironclad_golem',
    name: 'Ironclad Golem',
    image: '/boss/boss3.png',
    hp: 180,
    floor: 6,
    strongAgainst: ['physical'],
    weakAgainst: ['acid', 'fire'],
    signatureMove: {
      name: 'Shield Slam',
      description: 'Stuns and reduces attack',
      damage: 20,
      effect: 'stun'
    },
    phase50: { damageMultiplier: 1.1, message: 'Ironclad Golem reinforces armor!' },
    phase20: { damageMultiplier: 1.3, message: 'Ironclad Golem\'s armor cracks!' },
    dialogues: [
      "YOU. SHALL. NOT. PASS.",
      "My iron body has guarded this floor for centuries.",
      "Your journey ends here, little climber."
    ]
  },
  {
    id: 'frost_warden',
    name: 'Frost Warden',
    image: '/boss/boss4.png',
    hp: 160,
    floor: 8,
    strongAgainst: ['ice'],
    weakAgainst: ['fire'],
    signatureMove: {
      name: 'Ice Barrage',
      description: 'Slows player',
      damage: 18,
      effect: 'slow'
    },
    phase50: { damageMultiplier: 1.2, message: 'Frost Warden summons blizzard!' },
    phase20: { damageMultiplier: 1.5, message: 'Frost Warden freezes the arena!' },
    dialogues: [
      "Ah... a warm body. How delightful.",
      "I haven't felt warmth in so long... Let me freeze it out of you.",
      "Your heart will make a fine ice sculpture."
    ]
  },
  {
    id: 'shadow_reaper',
    name: 'Shadow Reaper',
    image: '/boss/boss5.png',
    hp: 200,
    floor: 10,
    strongAgainst: ['shadow'],
    weakAgainst: ['fire'],
    signatureMove: {
      name: 'Soul Drain',
      description: 'Steals HP',
      damage: 20,
      effect: 'drain'
    },
    phase50: { damageMultiplier: 1.3, message: 'Shadow Reaper draws power from darkness!' },
    phase20: { damageMultiplier: 1.6, message: 'Shadow Reaper becomes incorporeal!' },
    dialogues: [
      "Finally... a soul strong enough to reach the summit.",
      "I am the final guardian. The last nightmare before freedom.",
      "Let us see if your determination can withstand the void itself!"
    ]
  }
]

// Item Definitions
const ITEMS = {
  // Attack Items
  fireOil: {
    id: 'fireOil',
    name: 'Fire Oil',
    type: 'attack',
    element: 'fire',
    effect: 'Adds burn damage over 3 turns',
    damageBonus: 8,
    duration: 3,
    color: '#ff4500'
  },
  poisonVial: {
    id: 'poisonVial',
    name: 'Poison Vial',
    type: 'attack',
    element: 'poison',
    effect: 'Stacks poison, small damage per turn',
    damageBonus: 5,
    duration: 4,
    color: '#32cd32'
  },
  acidFlask: {
    id: 'acidFlask',
    name: 'Acid Flask',
    type: 'attack',
    element: 'acid',
    effect: 'Reduces enemy armor for 2 turns',
    damageBonus: 12,
    duration: 2,
    color: '#adff2f'
  },
  lightningShard: {
    id: 'lightningShard',
    name: 'Lightning Shard',
    type: 'attack',
    element: 'lightning',
    effect: 'High damage, chance to stun',
    damageBonus: 15,
    duration: 1,
    color: '#ffff00'
  },
  iceCharm: {
    id: 'iceCharm',
    name: 'Ice Charm',
    type: 'attack',
    element: 'ice',
    effect: 'Freezes or slows enemy for 1 turn',
    damageBonus: 10,
    duration: 1,
    color: '#00bfff'
  },
  // Utility Items
  smokeBomb: {
    id: 'smokeBomb',
    name: 'Smoke Bomb',
    type: 'utility',
    effect: 'Dodge next enemy attack',
    duration: 1,
    color: '#808080'
  },
  shieldPotion: {
    id: 'shieldPotion',
    name: 'Shield Potion',
    type: 'utility',
    effect: 'Reduce next damage by 50%',
    duration: 1,
    color: '#4169e1'
  },
  frostBarrier: {
    id: 'frostBarrier',
    name: 'Frost Barrier',
    type: 'utility',
    effect: 'Block and reflect damage',
    duration: 1,
    color: '#87ceeb'
  },
  mirrorCrystal: {
    id: 'mirrorCrystal',
    name: 'Mirror Crystal',
    type: 'utility',
    effect: 'Reflect 30% damage back',
    duration: 2,
    color: '#e0e0e0'
  },
  // Healing Items
  medkit: {
    id: 'medkit',
    name: 'Medkit',
    type: 'healing',
    effect: 'Restore 30 HP instantly',
    healAmount: 30,
    color: '#ff0000'
  },
  bandages: {
    id: 'bandages',
    name: 'Bandages',
    type: 'healing',
    effect: 'Restore 20 HP instantly',
    healAmount: 20,
    color: '#f5deb3'
  },
  antibiotics: {
    id: 'antibiotics',
    name: 'Antibiotics',
    type: 'healing',
    effect: 'Cure poison and debuffs',
    healAmount: 10,
    curesDebuffs: true,
    color: '#00ff00'
  }
}

// Dice Pair Container - rolls both dice simultaneously like dice implementation.txt
const DicePairContainer = ({ rolls, type, rolling, animationId }) => {
  return (
    <div className={`dice-pair-container ${type}`}>
      <div className={`dice-pair ${rolling ? 'rolling' : ''}`}>
        {rolls.map((roll, i) => (
          <div key={`die-wrapper-${animationId}-${i}`} className={`dice-glow-wrapper ${type} ${rolling ? 'rolling' : ''}`}>
            <RiveDice
              key={`die-${animationId}-${i}-${roll}`}
              rolling={rolling}
              onEnd={() => {}}
              outcome={roll}
              size={150}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

const Game = () => {
  // Start player at 200px instead of center for mobile visibility
  const [player, setPlayer] = useState({
    x: 200,
    y: GAME_HEIGHT - FLOOR_HEIGHT - PLAYER_HEIGHT,
    velocityY: 0,
    velocityX: 0,
    isGrounded: false,
    isMoving: false,
    direction: 'right' // 'left' or 'right'
  })

  const [currentFloor, setCurrentFloor] = useState(0)
  const [cameraY, setCameraY] = useState(0)
  const [revealedNPCs, setRevealedNPCs] = useState(new Set())
  const [defeatedNPCs, setDefeatedNPCs] = useState(new Set())
  const [battleState, setBattleState] = useState(null) // { npc, playerHp, npcHp, turn, diceAvailable, isBoss, bossData, activeEffects, selectedItem }
  const [battleLog, setBattleLog] = useState([])
  const [diceAnimation, setDiceAnimation] = useState(null) // { type, rolls, rolling, id }
  const [damageAnimation, setDamageAnimation] = useState(null)
  const [battleMenu, setBattleMenu] = useState('main') // 'main', 'fight', or 'items'
  const [selectedItemForInfo, setSelectedItemForInfo] = useState(null) // For Pokemon-style item menu
  const [bossDialogue, setBossDialogue] = useState(null) // { boss, dialogues, currentIndex }
  const [showForfeitConfirm, setShowForfeitConfirm] = useState(false)
  
  // Inventory system - 50 units total, 5 per item = 10 slots
  const [inventory, setInventory] = useState({
    fireOil: 1,
    poisonVial: 1,
    acidFlask: 1,
    lightningShard: 1,
    iceCharm: 1,
    smokeBomb: 1,
    shieldPotion: 1,
    frostBarrier: 1,
    mirrorCrystal: 1,
    medkit: 1,
    bandages: 1,
    antibiotics: 1
  })
  const diceAnimationIdRef = useRef(0)
  const keysPressed = useRef({})
  const gameLoopRef = useRef(null)
  const audioContextRef = useRef(null)
  const battleStartAudioRef = useRef(null)
  const battleMusicAudioRef = useRef(null)
  const newFloorAudioRef = useRef(null)
  const npcDialogueAudioRef = useRef(null)
  const currentDialogueNPCRef = useRef(null)
  
  // Initialize audio context
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioContextRef.current
  }
  
  // Initialize audio elements with new sounds
  useEffect(() => {
    battleMusicAudioRef.current = new Audio('/sound/battlemusic.mp3')
    battleMusicAudioRef.current.loop = true
    battleMusicAudioRef.current.volume = 0.2
    newFloorAudioRef.current = new Audio('/sound/cardflip.mp3')
    
    return () => {
      // Cleanup audio on unmount
      if (battleStartAudioRef.current) {
        battleStartAudioRef.current.pause()
        battleStartAudioRef.current = null
      }
      if (battleMusicAudioRef.current) {
        battleMusicAudioRef.current.pause()
        battleMusicAudioRef.current = null
      }
      if (newFloorAudioRef.current) {
        newFloorAudioRef.current.pause()
        newFloorAudioRef.current = null
      }
      if (npcDialogueAudioRef.current) {
        npcDialogueAudioRef.current.pause()
        npcDialogueAudioRef.current = null
      }
    }
  }, [])
  
  // Jump sound - upward swoosh
  const playJumpSound = () => {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(300, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.15)
  }
  
  // Battle sounds
  const playDiceRollSound = () => {
    const ctx = getAudioContext()
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        
        oscillator.type = 'square'
        oscillator.frequency.setValueAtTime(200 + Math.random() * 300, ctx.currentTime)
        
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
        
        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)
        
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.05)
      }, i * 30)
    }
  }
  
  const playAttackHitSound = () => {
    const ctx = getAudioContext()
    // Sharp impact sound
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(200, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15)
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.15)
  }
  
  const playHurtSound = () => {
    const ctx = getAudioContext()
    // Pain/hurt sound
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(400, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.25)
    
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.25)
  }
  
  const playHealSound = () => {
    const ctx = getAudioContext()
    const notes = [523, 659, 784]
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime)
        
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
        
        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)
        
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.15)
      }, i * 50)
    })
  }
  
  const playDiceResultSound = () => {
    const ctx = getAudioContext()
    // Play a satisfying "ding" sound when dice land
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(800, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  }
  
  const playChaosSound = () => {
    const ctx = getAudioContext()
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        
        oscillator.type = 'triangle'
        oscillator.frequency.setValueAtTime(Math.random() * 800 + 200, ctx.currentTime)
        
        gainNode.gain.setValueAtTime(0.06, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
        
        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)
        
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.1)
      }, i * 40)
    }
  }
  
  // New sound effects from /sound/ folder
  const playAttackFinishSound = () => {
    const audio = new Audio('/sound/dmg.mp3')
    audio.volume = 0.6
    audio.play().catch(e => console.log('Attack finish audio error:', e))
  }
  
  const playHealFinishSound = () => {
    const audio = new Audio('/sound/healed.mp3')
    audio.volume = 0.5
    audio.play().catch(e => console.log('Heal finish audio error:', e))
  }
  
  const playChaosFinishSound = () => {
    const audio = new Audio('/sound/cardflip.mp3')
    audio.volume = 0.5
    audio.play().catch(e => console.log('Chaos finish audio error:', e))
  }
  
  const playEventFinishSound = () => {
    const audio = new Audio('/sound/cardflip.mp3')
    audio.volume = 0.5
    audio.play().catch(e => console.log('Event finish audio error:', e))
  }
  
  const playVictorySound = () => {
    const audio = new Audio('/sound/victorysound.mp3')
    audio.volume = 0.6
    audio.play().catch(e => console.log('Victory audio error:', e))
  }
  
  const playDefeatSound = () => {
    const audio = new Audio('/sound/defeatsound.mp3')
    audio.volume = 0.6
    audio.play().catch(e => console.log('Defeat audio error:', e))
  }
  
  const playAudienceCheer = () => {
    const audio = new Audio('/sound/audience_cheer.mp3')
    audio.volume = 0.4
    audio.play().catch(e => console.log('Audience cheer audio error:', e))
  }
  
  const playAudienceBoo = () => {
    const audio = new Audio('/sound/audience_booing.mp3')
    audio.volume = 0.4
    audio.play().catch(e => console.log('Audience boo audio error:', e))
  }
  
  
  // Create building floors once using useRef to keep them fixed
  const platformsRef = useRef(null)
  
  if (!platformsRef.current) {
    const platforms = []
    const FLOOR_SPACING = 160 // Distance between each floor
    const GAP_WIDTH = 80 // Width of the gap to go up/down
    
    for (let i = 0; i <= 10; i++) {
      const floorY = GAME_HEIGHT - FLOOR_HEIGHT - (i * FLOOR_SPACING)
      
      // Alternate gap position: even floors have gap on right, odd floors on left
      const gapOnRight = i % 2 === 0
      
      if (i === 0) {
        // Ground floor - full width, no gap (you start here)
        platforms.push({
          x: 0,
          y: floorY,
          width: GAME_WIDTH,
          height: PLATFORM_HEIGHT,
          floor: i
        })
      } else {
        // Other floors - full width with gap at alternating ends
        if (gapOnRight) {
          // Gap on the right side
          platforms.push({
            x: 0,
            y: floorY,
            width: GAME_WIDTH - GAP_WIDTH,
            height: PLATFORM_HEIGHT,
            floor: i
          })
        } else {
          // Gap on the left side
          platforms.push({
            x: GAP_WIDTH,
            y: floorY,
            width: GAME_WIDTH - GAP_WIDTH,
            height: PLATFORM_HEIGHT,
            floor: i
          })
        }
      }
    }
    platformsRef.current = platforms
  }
  
  const platforms = platformsRef.current

  // Create NPCs and Bosses for each floor
  const npcsRef = useRef(null)
  
  if (!npcsRef.current) {
    const npcs = []
    const npcImages = [
      'npc1.png', 'npc2.png', 'npc3.png', 'npc4.png', 'npc5.png',
      'npc6.png', 'npc7.png', 'npc8.png', 'npc9.png', 'npc10.png',
      'npc11.png', 'npc12.png'
    ]
    const dialogues = [
      'diag1.mp3', 'diag2.mp3', 'diag3.mp3', 'diag4.mp3', 'diag5.mp3', 'diag6.mp3', 'diag7.mp3', 'diag8.mp3', 'diag9.mp3', 'diag10.mp3', 'diag11.mp3'
    ]
    let imageIndex = 0
    
    const NPC_SIZE = 70
    const BOSS_SIZE = 100
    const FLOOR_SPACING = 160
    
    for (let floor = 1; floor <= 10; floor++) {
      const floorY = GAME_HEIGHT - FLOOR_HEIGHT - (floor * FLOOR_SPACING)
      
      // Check if this floor has a boss (every 2 floors: 2, 4, 6, 8, 10)
      const isBossFloor = floor % 2 === 0
      
      if (isBossFloor) {
        // Add boss instead of regular NPCs
        const bossData = BOSSES.find(b => b.floor === floor)
        if (bossData) {
          npcs.push({
            id: `boss-${floor}`,
            floor: floor,
            x: GAME_WIDTH / 2 - BOSS_SIZE / 2,
            y: floorY - BOSS_SIZE,
            size: BOSS_SIZE,
            image: bossData.image,
            dialogue: `/npc-dialogues/${dialogues[0]}`, // Boss dialogue
            isBoss: true,
            bossData: bossData
          })
        }
      } else {
        // Regular NPCs for non-boss floors
        const npcsPerFloor = 2 + Math.floor(Math.random() * 2) // 2-3 NPCs per floor
        
        for (let j = 0; j < npcsPerFloor; j++) {
          const x = 150 + (j * 350) + Math.random() * 100
          npcs.push({
            id: `npc-${floor}-${j}`,
            floor: floor,
            x: x,
            y: floorY - NPC_SIZE,
            size: NPC_SIZE,
            image: `/npc/${npcImages[imageIndex % npcImages.length]}`,
            dialogue: `/npc-dialogues/${dialogues[Math.floor(Math.random() * dialogues.length)]}`,
            isBoss: false
          })
          imageIndex++
        }
      }
    }
    
    npcsRef.current = npcs
  }
  
  const npcs = npcsRef.current
  
  // Check distance to NPCs for silhouette effect
  const getIsNPCRevealed = (npc) => {
    // If defeated, always show (not silhouette)
    if (defeatedNPCs.has(npc.id)) {
      return true
    }
    
    // If already revealed, keep it revealed
    if (revealedNPCs.has(npc.id)) {
      return true
    }
    
    // Only reveal if on the same floor
    if (currentFloor !== npc.floor) {
      return false
    }
    
    // Check distance
    const distance = Math.sqrt(
      Math.pow(player.x + PLAYER_WIDTH / 2 - (npc.x + npc.size / 2), 2) +
      Math.pow(player.y + PLAYER_HEIGHT / 2 - (npc.y + npc.size / 2), 2)
    )
    
    const shouldReveal = distance < 150 // Reveal when player is within 150 pixels
    
    // If revealing for the first time, add to revealed set
    if (shouldReveal && !revealedNPCs.has(npc.id)) {
      setRevealedNPCs(prev => new Set([...prev, npc.id]))
    }
    
    return shouldReveal
  }
  
  // Check if player can interact with NPC (show E prompt)
  const canInteractWithNPC = (npc) => {
    if (defeatedNPCs.has(npc.id)) return false
    if (currentFloor !== npc.floor) return false
    
    const distance = Math.sqrt(
      Math.pow(player.x + PLAYER_WIDTH / 2 - (npc.x + npc.size / 2), 2) +
      Math.pow(player.y + PLAYER_HEIGHT / 2 - (npc.y + npc.size / 2), 2)
    )
    
    return distance < 100
  }
  
  // Check if player moved away from revealed NPC (revert to silhouette)
  const checkNPCProximity = () => {
    const newRevealed = new Set(defeatedNPCs)
    
    npcs.forEach(npc => {
      if (defeatedNPCs.has(npc.id)) return
      
      if (currentFloor === npc.floor) {
        const distance = Math.sqrt(
          Math.pow(player.x + PLAYER_WIDTH / 2 - (npc.x + npc.size / 2), 2) +
          Math.pow(player.y + PLAYER_HEIGHT / 2 - (npc.y + npc.size / 2), 2)
        )
        
        if (distance < 200) { // Keep revealed within 200px
          newRevealed.add(npc.id)
        }
      }
    })
    
    setRevealedNPCs(newRevealed)
  }
  
  // Battle system functions
  const startBattle = (npc) => {
    const isBoss = npc.isBoss
    const maxHp = isBoss ? npc.bossData.hp : 100
    
    setBattleState({
      npc,
      playerHp: 100,
      playerMaxHp: 100,
      npcHp: maxHp,
      npcMaxHp: maxHp,
      turn: 'player',
      isBoss: isBoss,
      bossData: isBoss ? npc.bossData : null,
      bossPhase: 'normal', // 'normal', 'phase50', 'phase20'
      selectedItem: null,
      diceAvailable: {
        chaos: 1,
        randomEvent: 1
      },
      activeEffects: {
        // Player effects
        playerBurn: 0,
        playerPoison: 0,
        playerStun: false,
        playerSlow: false,
        playerShield: 0,
        playerDodge: false,
        playerReflect: 0,
        playerArmor: 0,
        // Enemy effects
        enemyBurn: 0,
        enemyPoison: 0,
        enemyStun: false,
        enemySlow: false,
        enemyArmorReduction: 0,
        enemyFreeze: false
      },
      effects: {
        playerSkipNext: false,
        npcSkipNext: false,
        playerTripleDice: false,
        npcTripleDice: false
      }
    })
    setBattleLog([isBoss ? `Boss Battle: ${npc.bossData.name}!` : 'Battle started!'])
    setBattleMenu('main')
    
    // Play battle start sound, then battle music
    if (battleStartAudioRef.current) {
      battleStartAudioRef.current.currentTime = 0
      battleStartAudioRef.current.play().catch(e => console.log('Battle start audio error:', e))
      
      // Start battle music after battle start sound finishes
      battleStartAudioRef.current.onended = () => {
        if (battleMusicAudioRef.current) {
          battleMusicAudioRef.current.currentTime = 0
          battleMusicAudioRef.current.play().catch(e => console.log('Battle music error:', e))
        }
      }
    }
  }
  
  const forfeitBattle = () => {
    setBattleState(null)
    setBattleLog([])
    setDiceAnimation(null)
    setDamageAnimation(null)
    setBattleMenu('main')
    setSelectedItemForInfo(null)
    setBossDialogue(null)
    setShowForfeitConfirm(false)
    
    // Stop battle music
    if (battleMusicAudioRef.current) {
      battleMusicAudioRef.current.pause()
      battleMusicAudioRef.current.currentTime = 0
    }
    if (battleStartAudioRef.current) {
      battleStartAudioRef.current.pause()
      battleStartAudioRef.current.currentTime = 0
    }
  }
  
  const rollDice = () => Math.floor(Math.random() * 6) + 1
  
  // Item usage functions
  const selectItem = (itemId) => {
    if (inventory[itemId] > 0) {
      setBattleState(prev => ({ ...prev, selectedItem: itemId }))
      setBattleMenu('main')
    }
  }
  
  const useItem = (itemId) => {
    if (inventory[itemId] <= 0) return
    
    const item = ITEMS[itemId]
    let newState = { ...battleState }
    let log = [...battleLog]
    
    // Deduct item from inventory
    setInventory(prev => ({ ...prev, [itemId]: prev[itemId] - 1 }))
    
    // Apply item effects
    if (item.type === 'healing') {
      if (item.curesDebuffs) {
        // Antibiotics - cure debuffs
        newState.activeEffects.playerBurn = 0
        newState.activeEffects.playerPoison = 0
        newState.activeEffects.playerStun = false
        newState.activeEffects.playerSlow = false
        newState.playerHp = Math.min(newState.playerMaxHp, newState.playerHp + item.healAmount)
        log.push(`Used ${item.name}! Cured all debuffs and healed ${item.healAmount} HP`)
      } else {
        // Regular healing items
        newState.playerHp = Math.min(newState.playerMaxHp, newState.playerHp + item.healAmount)
        log.push(`Used ${item.name}! Healed ${item.healAmount} HP`)
      }
      playHealSound()
      setBattleState(newState)
      setBattleLog(log)
    } else if (item.type === 'utility') {
      // Apply utility item effects
      if (itemId === 'smokeBomb') {
        newState.activeEffects.playerDodge = true
        log.push(`Used ${item.name}! Next attack will be dodged`)
      } else if (itemId === 'shieldPotion') {
        newState.activeEffects.playerShield = 50 // 50% damage reduction
        log.push(`Used ${item.name}! Next damage reduced by 50%`)
      } else if (itemId === 'frostBarrier') {
        newState.activeEffects.playerShield = 100 // Block all damage
        newState.activeEffects.playerReflect = 50 // Reflect 50%
        log.push(`Used ${item.name}! Damage blocked and reflected`)
      } else if (itemId === 'mirrorCrystal') {
        newState.activeEffects.playerReflect = 30 // Reflect 30% for 2 turns
        log.push(`Used ${item.name}! Reflecting 30% damage`)
      }
      setBattleState(newState)
      setBattleLog(log)
    }
    // Attack items are used with dice rolls
  }
  
  // Calculate damage with boss weaknesses/strengths
  const calculateDamage = (baseDamage, itemId) => {
    if (!battleState.isBoss || !itemId) return baseDamage
    
    const item = ITEMS[itemId]
    const boss = battleState.bossData
    
    let multiplier = 1.0
    
    // Check weakness (2x damage)
    if (item.element && boss.weakAgainst.includes(item.element)) {
      multiplier = 2.0
      setBattleLog(prev => [...prev, `${boss.name} is weak to ${item.element}! Critical hit!`])
    }
    // Check strength (0.5x damage)
    else if (item.element && boss.strongAgainst.includes(item.element)) {
      multiplier = 0.5
      setBattleLog(prev => [...prev, `${boss.name} resists ${item.element}! Reduced damage!`])
    }
    
    return Math.floor(baseDamage * multiplier)
  }
  
  // Check and trigger boss phase changes
  const checkBossPhase = (newState, log) => {
    if (!newState.isBoss) return
    
    const hpPercent = (newState.npcHp / newState.npcMaxHp) * 100
    const boss = newState.bossData
    
    if (hpPercent <= 20 && newState.bossPhase !== 'phase20') {
      newState.bossPhase = 'phase20'
      log.push(`⚠️ ${boss.phase20.message}`)
      playChaosSound()
    } else if (hpPercent <= 50 && newState.bossPhase === 'normal') {
      newState.bossPhase = 'phase50'
      log.push(`⚠️ ${boss.phase50.message}`)
      playChaosSound()
    }
  }
  
  const handleDiceAction = (type) => {
    if (!battleState || battleState.turn !== 'player') return
    
    let newState = { ...battleState }
    let log = [...battleLog]
    const ROLL_ANIM_MS = 1000
    
    // Generate unique animation ID for this roll
    diceAnimationIdRef.current += 1
    const animId = diceAnimationIdRef.current
    
    if (type === 'attack') {
      const diceCount = newState.effects.playerTripleDice ? 3 : 2
      const rolls = Array.from({ length: diceCount }, rollDice)
      let baseDamage = rolls.reduce((a, b) => a + b, 0)
      
      // Apply selected item bonus if any
      let itemBonus = 0
      let selectedItemId = newState.selectedItem
      if (selectedItemId && ITEMS[selectedItemId] && ITEMS[selectedItemId].type === 'attack') {
        const item = ITEMS[selectedItemId]
        itemBonus = item.damageBonus
        
        // Apply item effects to enemy
        if (item.element === 'fire') {
          newState.activeEffects.enemyBurn = item.duration
        } else if (item.element === 'poison') {
          newState.activeEffects.enemyPoison = item.duration
        } else if (item.element === 'acid') {
          newState.activeEffects.enemyArmorReduction = item.duration
        } else if (item.element === 'ice') {
          newState.activeEffects.enemyFreeze = item.duration > 0
        } else if (item.element === 'lightning') {
          if (Math.random() < 0.3) {
            newState.effects.npcSkipNext = true
          }
        }
        
        // Deduct item from inventory
        setInventory(prev => ({ ...prev, [selectedItemId]: prev[selectedItemId] - 1 }))
        newState.selectedItem = null
      }
      
      let totalDamage = baseDamage + itemBonus
      
      // Calculate with boss weaknesses/strengths
      if (newState.isBoss && selectedItemId) {
        totalDamage = calculateDamage(totalDamage, selectedItemId)
      }
      
      // Apply armor reduction
      if (newState.activeEffects.enemyArmorReduction > 0) {
        totalDamage = Math.floor(totalDamage * 1.2)
      }
      
      // Start rolling animation - both dice roll simultaneously
      playDiceRollSound()
      setDiceAnimation({ type: selectedItemId && ITEMS[selectedItemId] ? selectedItemId : 'attack', rolls, rolling: true, id: animId })
      
      // After 1 second (ROLL_ANIM_MS), stop rolling and show results
      setTimeout(() => {
        setDiceAnimation({ type: selectedItemId && ITEMS[selectedItemId] ? selectedItemId : 'attack', rolls, rolling: false, id: animId })
        playDiceResultSound()
        playAttackFinishSound() // Play random attack finish sound
        playAttackHitSound()
        setTimeout(() => playHurtSound(), 100)
        setDamageAnimation({ target: 'npc', value: totalDamage })
      }, ROLL_ANIM_MS)
      
      // After showing results, apply damage and continue
      setTimeout(() => {
        newState.npcHp = Math.max(0, newState.npcHp - totalDamage)
        if (itemBonus > 0) {
          log.push(`You rolled ${rolls.join(', ')} + ${itemBonus} (item) = ${totalDamage} damage!`)
        } else {
          log.push(`You rolled ${rolls.join(', ')} = ${totalDamage} damage!`)
        }
        newState.effects.playerTripleDice = false
        checkBossPhase(newState, log)
        continueBattleAfterAction(newState, log)
      }, ROLL_ANIM_MS + 1500)
      return
    } else if (type === 'heal') {
      const diceCount = newState.effects.playerTripleDice ? 3 : 2
      const rolls = Array.from({ length: diceCount }, rollDice)
      const heal = rolls.reduce((a, b) => a + b, 0)
      
      // Start rolling animation - both dice roll simultaneously
      playDiceRollSound()
      setDiceAnimation({ type: 'heal', rolls, rolling: true, id: animId })
      
      // After 1 second, stop rolling and show results
      setTimeout(() => {
        setDiceAnimation({ type: 'heal', rolls, rolling: false, id: animId })
        playDiceResultSound()
        playHealFinishSound() // Play random heal finish sound
        playHealSound()
        setDamageAnimation({ target: 'player', value: `+${heal}`, isHeal: true })
      }, ROLL_ANIM_MS)
      
      // After showing results, apply heal and continue
      setTimeout(() => {
        newState.playerHp = Math.min(100, newState.playerHp + heal)
        log.push(`You rolled ${rolls.join(', ')} = ${heal} HP healed!`)
        newState.effects.playerTripleDice = false
        continueBattleAfterAction(newState, log)
      }, ROLL_ANIM_MS + 1500)
      return
    } else if (type === 'chaos' && newState.diceAvailable.chaos > 0) {
      const roll = rollDice()
      
      // Start rolling animation
      playDiceRollSound()
      setDiceAnimation({ type: 'chaos', rolls: [roll], rolling: true, id: animId })
      
      // After 1 second, stop rolling
      setTimeout(() => {
        setDiceAnimation({ type: 'chaos', rolls: [roll], rolling: false, id: animId })
        playDiceResultSound()
        playChaosFinishSound() // Play random chaos finish sound
        playChaosSound()
      }, ROLL_ANIM_MS)
      
      // After showing results, apply effect
      setTimeout(() => {
        const effects = [
          { name: 'Player Buff: +10 HP', action: () => { newState.playerHp = Math.min(100, newState.playerHp + 10) } },
          { name: 'Player Debuff: -5 HP', action: () => { newState.playerHp = Math.max(0, newState.playerHp - 5) } },
          { name: 'NPC Debuff: -10 HP', action: () => { newState.npcHp = Math.max(0, newState.npcHp - 10) } },
          { name: 'NPC Buff: +5 HP', action: () => { newState.npcHp = Math.min(100, newState.npcHp + 5) } },
          { name: 'Nothing happens', action: () => {} },
          { name: 'Skip next turn', action: () => { newState.effects.npcSkipNext = true } }
        ]
        const effect = effects[roll - 1]
        effect.action()
        log.push(`Chaos dice: ${effect.name}`)
        newState.diceAvailable.chaos = 0
        continueBattleAfterAction(newState, log)
      }, ROLL_ANIM_MS + 1500)
      return
    } else if (type === 'random' && newState.diceAvailable.randomEvent > 0) {
      const roll = rollDice()
      
      // Start rolling animation
      playDiceRollSound()
      setDiceAnimation({ type: 'random', rolls: [roll], rolling: true, id: animId })
      
      // After 1 second, stop rolling
      setTimeout(() => {
        setDiceAnimation({ type: 'random', rolls: [roll], rolling: false, id: animId })
        playDiceResultSound()
        playEventFinishSound() // Play random event finish sound
        playChaosSound()
      }, ROLL_ANIM_MS)
      
      // After showing results, apply event
      setTimeout(() => {
        const events = [
          { name: 'Meteor falls! Both -10 HP', action: () => { 
            newState.playerHp = Math.max(0, newState.playerHp - 10)
            newState.npcHp = Math.max(0, newState.npcHp - 10)
          }},
          { name: 'HP Swapped!', action: () => { 
            const temp = newState.playerHp
            newState.playerHp = newState.npcHp
            newState.npcHp = temp
          }},
          { name: 'Poison gas! -5 HP per turn', action: () => { 
            newState.effects.playerPoison = true
            newState.effects.npcPoison = true
          }},
          { name: 'Power surge! Next turn 3 dice', action: () => { 
            newState.effects.playerTripleDice = true
            newState.effects.npcTripleDice = true
          }},
          { name: 'Curse! Both -25% HP', action: () => { 
            newState.playerHp = Math.max(0, Math.floor(newState.playerHp * 0.75))
            newState.npcHp = Math.max(0, Math.floor(newState.npcHp * 0.75))
          }},
          { name: 'Divine blessing! Full heal', action: () => { 
            newState.playerHp = 100
            newState.npcHp = 100
          }}
        ]
        const event = events[roll - 1]
        event.action()
        log.push(`Random event: ${event.name}`)
        newState.diceAvailable.randomEvent = 0
        continueBattleAfterAction(newState, log)
      }, ROLL_ANIM_MS + 1500)
      return
    }
    
    continueBattleAfterAction(newState, log)
  }
  
  const continueBattleAfterAction = (newState, log) => {
    setDiceAnimation(null)
    setTimeout(() => setDamageAnimation(null), 1000)
    
    // Apply DoT effects
    if (newState.activeEffects.playerBurn > 0) {
      const burnDmg = 5
      newState.playerHp = Math.max(0, newState.playerHp - burnDmg)
      log.push(`You take ${burnDmg} burn damage`)
      newState.activeEffects.playerBurn--
    }
    if (newState.activeEffects.playerPoison > 0) {
      const poisonDmg = 3
      newState.playerHp = Math.max(0, newState.playerHp - poisonDmg)
      log.push(`You take ${poisonDmg} poison damage`)
      newState.activeEffects.playerPoison--
    }
    
    // Decay shield effects
    if (newState.activeEffects.playerShield > 0) {
      newState.activeEffects.playerShield = 0
    }
    if (newState.activeEffects.playerDodge) {
      newState.activeEffects.playerDodge = false
    }
    
    // Check win
    if (newState.npcHp <= 0) {
      log.push(newState.isBoss ? '🎉 BOSS DEFEATED! 🎉' : 'Victory!')
      setDefeatedNPCs(prev => new Set([...prev, battleState.npc.id]))
      setBattleLog(log)
      
      // Stop battle music and play victory sounds
      if (battleMusicAudioRef.current) {
        battleMusicAudioRef.current.pause()
        battleMusicAudioRef.current.currentTime = 0
      }
      playVictorySound()
      playAudienceCheer()
      
      setTimeout(() => {
        setBattleState(null)
        setBattleLog([])
      }, 2000)
      return
    }
    
    newState.turn = 'npc'
    setBattleState(newState)
    setBattleLog(log)
    
    // NPC turn
    setTimeout(() => npcTurn(newState, log), 1500)
  }
  
  const npcTurn = (state, log) => {
    let newState = { ...state }
    
    // Check freeze/stun
    if (newState.effects.npcSkipNext || newState.activeEffects.enemyFreeze) {
      log.push(newState.isBoss ? 'Boss is stunned!' : 'Enemy turn skipped!')
      newState.effects.npcSkipNext = false
      newState.activeEffects.enemyFreeze = false
    } else {
      // Boss signature move chance
      if (newState.isBoss && Math.random() < 0.3) {
        const boss = newState.bossData
        const move = boss.signatureMove
        
        let damageMultiplier = 1.0
        if (newState.bossPhase === 'phase50') {
          damageMultiplier = boss.phase50.damageMultiplier
        } else if (newState.bossPhase === 'phase20') {
          damageMultiplier = boss.phase20.damageMultiplier
        }
        
        let damage = Math.floor(move.damage * damageMultiplier)
        
        // Apply player defenses
        if (newState.activeEffects.playerDodge) {
          log.push(`${boss.name} uses ${move.name}! You dodged it!`)
          newState.activeEffects.playerDodge = false
          damage = 0
        } else if (newState.activeEffects.playerShield > 0) {
          const reduction = newState.activeEffects.playerShield / 100
          damage = Math.floor(damage * (1 - reduction))
          log.push(`${boss.name} uses ${move.name}! Shield reduces damage!`)
        } else {
          log.push(`${boss.name} uses ${move.name}!`)
        }
        
        newState.playerHp = Math.max(0, newState.playerHp - damage)
        if (damage > 0) {
          log.push(`You take ${damage} damage!`)
        }
        
        // Apply signature move effect
        if (move.effect === 'burn') {
          newState.activeEffects.playerBurn = 3
          log.push('You are burned!')
        } else if (move.effect === 'poison') {
          newState.activeEffects.playerPoison = 3
          log.push('You are poisoned!')
        } else if (move.effect === 'stun') {
          newState.effects.playerSkipNext = true
          log.push('You are stunned!')
        } else if (move.effect === 'slow') {
          newState.activeEffects.playerSlow = true
          log.push('You are slowed!')
        } else if (move.effect === 'drain') {
          newState.npcHp = Math.min(newState.npcMaxHp, newState.npcHp + Math.floor(damage / 2))
          log.push(`${boss.name} drains ${Math.floor(damage / 2)} HP!`)
        }
        
        playChaosSound()
      } else {
        // Regular attack/heal AI
        const hpThreshold = newState.isBoss ? 50 : 30
        const shouldHeal = newState.npcHp < hpThreshold || Math.random() < 0.3
        
        if (shouldHeal && newState.npcHp < newState.npcMaxHp - 10) {
          const diceCount = newState.effects.npcTripleDice ? 3 : 2
          const rolls = Array.from({ length: diceCount }, rollDice)
          const heal = rolls.reduce((a, b) => a + b, 0)
          newState.npcHp = Math.min(newState.npcMaxHp, newState.npcHp + heal)
          log.push(`${newState.isBoss ? newState.bossData.name : 'Enemy'} healed for ${heal} HP`)
          newState.effects.npcTripleDice = false
          playHealSound()
        } else {
          const diceCount = newState.effects.npcTripleDice ? 3 : 2
          const rolls = Array.from({ length: diceCount }, rollDice)
          let damage = rolls.reduce((a, b) => a + b, 0)
          
          // Boss phase multiplier
          if (newState.isBoss) {
            let multiplier = 1.0
            if (newState.bossPhase === 'phase50') {
              multiplier = newState.bossData.phase50.damageMultiplier
            } else if (newState.bossPhase === 'phase20') {
              multiplier = newState.bossData.phase20.damageMultiplier
            }
            damage = Math.floor(damage * multiplier)
          }
          
          // Apply player defenses
          if (newState.activeEffects.playerDodge) {
            log.push('Enemy attacks! You dodged it!')
            newState.activeEffects.playerDodge = false
            damage = 0
          } else if (newState.activeEffects.playerShield > 0) {
            const reduction = newState.activeEffects.playerShield / 100
            const originalDamage = damage
            damage = Math.floor(damage * (1 - reduction))
            log.push(`Enemy attacks! Shield reduces ${originalDamage} to ${damage} damage!`)
            
            // Reflect damage if active
            if (newState.activeEffects.playerReflect > 0) {
              const reflected = Math.floor(originalDamage * (newState.activeEffects.playerReflect / 100))
              newState.npcHp = Math.max(0, newState.npcHp - reflected)
              log.push(`Reflected ${reflected} damage back!`)
            }
          }
          
          newState.playerHp = Math.max(0, newState.playerHp - damage)
          if (damage > 0) {
            log.push(`${newState.isBoss ? newState.bossData.name : 'Enemy'} attacks for ${damage} damage!`)
          }
          newState.effects.npcTripleDice = false
          
          if (damage > 0) {
            playAttackHitSound()
            setTimeout(() => playHurtSound(), 100)
          }
        }
      }
    }
    
    // Apply DoT effects to enemy
    if (newState.activeEffects.enemyBurn > 0) {
      const burnDmg = 5
      newState.npcHp = Math.max(0, newState.npcHp - burnDmg)
      log.push(`${newState.isBoss ? newState.bossData.name : 'Enemy'} takes ${burnDmg} burn damage`)
      newState.activeEffects.enemyBurn--
    }
    if (newState.activeEffects.enemyPoison > 0) {
      const poisonDmg = 3
      newState.npcHp = Math.max(0, newState.npcHp - poisonDmg)
      log.push(`${newState.isBoss ? newState.bossData.name : 'Enemy'} takes ${poisonDmg} poison damage`)
      newState.activeEffects.enemyPoison--
    }
    if (newState.activeEffects.enemyArmorReduction > 0) {
      newState.activeEffects.enemyArmorReduction--
    }
    
    // Check loss
    if (newState.playerHp <= 0) {
      log.push('Defeat... Try again!')
      setBattleLog(log)
      
      // Stop battle music and play defeat sounds
      if (battleMusicAudioRef.current) {
        battleMusicAudioRef.current.pause()
        battleMusicAudioRef.current.currentTime = 0
      }
      playDefeatSound()
      playAudienceBoo()
      
      setTimeout(() => {
        setBattleState(null)
        setBattleLog([])
      }, 2000)
      return
    }
    
    newState.turn = 'player'
    setBattleState(newState)
    setBattleLog(log)
  }

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent default behavior for space bar and arrow keys
      if (e.key === ' ' || e.key === 'Spacebar' || 
          e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
          e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
      }
      
      keysPressed.current[e.key.toLowerCase()] = true
      
      // E key for interaction (only during exploration)
      if ((e.key === 'e' || e.key === 'E') && !battleState && !bossDialogue) {
        const nearbyNPC = npcs.find(npc => canInteractWithNPC(npc))
        if (nearbyNPC) {
          // If it's a boss, show dialogue first
          if (nearbyNPC.isBoss && nearbyNPC.bossData && nearbyNPC.bossData.dialogues) {
            setBossDialogue({
              boss: nearbyNPC,
              dialogues: nearbyNPC.bossData.dialogues,
              currentIndex: 0
            })
          } else {
            // Regular NPC, start battle immediately
            startBattle(nearbyNPC)
          }
        }
      }
      
      // Space bar for jump or advance dialogue
      if ((e.key === ' ' || e.key === 'Spacebar')) {
        // Handle boss dialogue advancement
        if (bossDialogue) {
          if (bossDialogue.currentIndex < bossDialogue.dialogues.length - 1) {
            // Advance to next dialogue
            setBossDialogue(prev => ({
              ...prev,
              currentIndex: prev.currentIndex + 1
            }))
          } else {
            // End dialogue and start battle
            const boss = bossDialogue.boss
            setBossDialogue(null)
            startBattle(boss)
          }
          return
        }
        
        // Normal jump
        if (player.isGrounded && !battleState) {
          playJumpSound()
          setPlayer(prev => ({
            ...prev,
            velocityY: JUMP_FORCE,
            isGrounded: false
          }))
        }
      }
      
      // Battle keyboard shortcuts
      if (battleState && battleState.turn === 'player' && !diceAnimation) {
        // A - Attack
        if (e.key === 'a' || e.key === 'A') {
          handleDiceAction('attack')
        }
        // H - Heal
        if (e.key === 'h' || e.key === 'H') {
          handleDiceAction('heal')
        }
        // I - Items
        if (e.key === 'i' || e.key === 'I') {
          setBattleMenu('items')
          setSelectedItemForInfo(null)
        }
        // R - Random Event
        if ((e.key === 'r' || e.key === 'R') && battleState.diceAvailable.randomEvent > 0) {
          handleDiceAction('random')
        }
        // C - Chaos
        if ((e.key === 'c' || e.key === 'C') && battleState.diceAvailable.chaos > 0) {
          handleDiceAction('chaos')
        }
        // F - Forfeit
        if (e.key === 'f' || e.key === 'F') {
          setShowForfeitConfirm(true)
        }
      }
    }

    const handleKeyUp = (e) => {
      // Prevent default behavior for space bar and arrow keys
      if (e.key === ' ' || e.key === 'Spacebar' || 
          e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
          e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
      }
      
      keysPressed.current[e.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [player, battleState, npcs, currentFloor, defeatedNPCs, bossDialogue])
  
  // Check NPC proximity
  useEffect(() => {
    if (!battleState) {
      checkNPCProximity()
    }
  }, [player.x, player.y, currentFloor, battleState])
  
  // Play NPC dialogue when near and can interact
  useEffect(() => {
    if (battleState) {
      // Stop dialogue when battle starts
      if (npcDialogueAudioRef.current) {
        npcDialogueAudioRef.current.pause()
        npcDialogueAudioRef.current = null
        currentDialogueNPCRef.current = null
      }
      return
    }
    
    // Find nearby NPC that player can interact with
    const nearbyNPC = npcs.find(npc => canInteractWithNPC(npc))
    
    if (nearbyNPC) {
      // If this is a different NPC, or no dialogue is playing
      if (currentDialogueNPCRef.current !== nearbyNPC.id) {
        // Stop previous dialogue
        if (npcDialogueAudioRef.current) {
          npcDialogueAudioRef.current.pause()
          npcDialogueAudioRef.current = null
        }
        
        // Play new dialogue
        currentDialogueNPCRef.current = nearbyNPC.id
        npcDialogueAudioRef.current = new Audio(nearbyNPC.dialogue)
        npcDialogueAudioRef.current.volume = 0.7
        npcDialogueAudioRef.current.play().catch(e => console.log('Dialogue audio error:', e))
      }
    } else {
      // No nearby NPC, stop dialogue
      if (npcDialogueAudioRef.current) {
        npcDialogueAudioRef.current.pause()
        npcDialogueAudioRef.current = null
        currentDialogueNPCRef.current = null
      }
    }
  }, [player.x, player.y, currentFloor, battleState, npcs, defeatedNPCs])
  
  // Play new floor sound when reaching a new floor
  useEffect(() => {
    if (currentFloor > 0 && newFloorAudioRef.current) {
      newFloorAudioRef.current.currentTime = 0
      newFloorAudioRef.current.play().catch(e => console.log('New floor audio error:', e))
    }
  }, [currentFloor])

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      setPlayer(prev => {
        let newX = prev.x
        let newY = prev.y
        let newVelocityY = prev.velocityY
        let newVelocityX = 0
        let isMoving = false
        let direction = prev.direction

        // Horizontal movement (WASD or Arrow keys)
        if (keysPressed.current['a'] || keysPressed.current['arrowleft']) {
          newVelocityX = -MOVE_SPEED
          isMoving = true
          direction = 'left'
        }
        if (keysPressed.current['d'] || keysPressed.current['arrowright']) {
          newVelocityX = MOVE_SPEED
          isMoving = true
          direction = 'right'
        }

        newX += newVelocityX

        // Keep player in bounds horizontally
        if (newX < 0) newX = 0
        if (newX > GAME_WIDTH - PLAYER_WIDTH) newX = GAME_WIDTH - PLAYER_WIDTH

        // Apply gravity
        newVelocityY += GRAVITY
        newY += newVelocityY

        // Check for ground collision
        let isGrounded = false

        // Check collision with all platforms
        for (let platform of platforms) {
          const playerBottom = newY + PLAYER_HEIGHT
          const playerTop = newY
          const playerLeft = newX
          const playerRight = newX + PLAYER_WIDTH

          const platformTop = platform.y
          const platformBottom = platform.y + platform.height
          const platformLeft = platform.x
          const platformRight = platform.x + platform.width

          // Check if player is overlapping with platform horizontally
          if (playerRight > platformLeft && playerLeft < platformRight) {
            // Check if player is falling onto platform from above
            if (prev.y + PLAYER_HEIGHT <= platformTop && playerBottom >= platformTop && newVelocityY > 0) {
              newY = platformTop - PLAYER_HEIGHT
              newVelocityY = 0
              isGrounded = true
              
              // Update current floor
              setCurrentFloor(platform.floor)
              break
            }
            
            // Check if player is jumping into platform from below (prevent jumping through)
            if (prev.y >= platformBottom && playerTop <= platformBottom && newVelocityY < 0) {
              newY = platformBottom
              newVelocityY = 0
            }
          }
        }

        // Prevent falling through bottom
        if (newY > GAME_HEIGHT - FLOOR_HEIGHT - PLAYER_HEIGHT) {
          newY = GAME_HEIGHT - FLOOR_HEIGHT - PLAYER_HEIGHT
          newVelocityY = 0
          isGrounded = true
        }

        return {
          x: newX,
          y: newY,
          velocityY: newVelocityY,
          velocityX: newVelocityX,
          isGrounded,
          isMoving,
          direction
        }
      })

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [])

  // Camera follows player position in real-time
  useEffect(() => {
    // Position camera to keep player centered, allowing view of floor below and above
    // Camera moves with player's Y position
    let targetCameraY = GAME_HEIGHT / 2 - player.y - PLAYER_HEIGHT / 2
    
    // Clamp camera so it doesn't move on lower floors
    // Keep camera at 0 when player is on bottom portion of the game
    const minPlayerY = GAME_HEIGHT - FLOOR_HEIGHT - 200 // If player is in bottom 200px area
    if (player.y >= minPlayerY) {
      targetCameraY = 0
    }
    
    // Smooth camera transition
    setCameraY(prev => {
      const diff = targetCameraY - prev
      if (Math.abs(diff) < 1) return targetCameraY
      return prev + diff * 0.12
    })
  }, [player.y])

  // Boss Dialogue Screen
  if (bossDialogue) {
    return (
      <div className="boss-dialogue-screen">
        <div className="boss-dialogue-container">
          <div className="boss-portrait-section">
            <div className="boss-portrait-frame-dialogue">
              <img src={bossDialogue.boss.image} alt={bossDialogue.boss.bossData.name} className="boss-portrait-img" />
            </div>
            <div className="boss-name-plate">
              <div className="boss-name-text">{bossDialogue.boss.bossData.name}</div>
              <div className="boss-title">FLOOR {bossDialogue.boss.floor} GUARDIAN</div>
            </div>
          </div>
          
          <div className="dialogue-text-box">
            <div className="dialogue-text">
              {bossDialogue.dialogues[bossDialogue.currentIndex]}
            </div>
            <div className="dialogue-progress">
              {bossDialogue.currentIndex + 1} / {bossDialogue.dialogues.length}
            </div>
            <div className="dialogue-skip-hint">
              Press [SPACE] to {bossDialogue.currentIndex < bossDialogue.dialogues.length - 1 ? 'continue' : 'begin battle'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Battle Screen
  if (battleState) {
    return (
      <div className="pokemon-battle-screen">
        {/* Forfeit Button - Bottom Left */}
        <div className="forfeit-button-bottom-left">
          <button className="forfeit-button" onClick={() => setShowForfeitConfirm(true)}>
            <span className="btn-keybind-forfeit">[ F ]</span>
             FORFEIT
          </button>
        </div>
        
        {/* Battle Log - Bottom Right */}
        <div className="battle-log-bottom-right">
          <div className="battle-log-title">Battle Log</div>
          <div className="battle-log-messages">
            {battleLog.slice(-3).reverse().map((message, index) => (
              <div key={index} className="battle-log-message">
                {message}
              </div>
            ))}
          </div>
        </div>
        
        {/* Dice rolling animation overlay */}
        {diceAnimation && (
          <div className="dice-overlay">
            <div className="dice-container">
              <DicePairContainer 
                rolls={diceAnimation.rolls}
                type={diceAnimation.type}
                rolling={diceAnimation.rolling}
                animationId={diceAnimation.id}
              />
            </div>
          </div>
        )}
        
        {/* Damage/Heal animation */}
        {damageAnimation && (
          <div className={`damage-popup ${damageAnimation.target} ${damageAnimation.isHeal ? 'heal' : 'damage'}`}>
            {damageAnimation.value}
          </div>
        )}
        
        {/* Fighting Game Style Battle Arena */}
        <div className="fighting-game-arena">
          {/* Street Fighter Style HP Bars */}
          <div className="sf-hp-container">
            {/* Player Side (Left) */}
            <div className="sf-player-side">
              <div className="sf-portrait-frame">
                <img src="/walker-still.png" alt="Player" className="sf-portrait" />
                {battleState.activeEffects.playerBurn > 0 && <span className="sf-effect-icon">🔥</span>}
                {battleState.activeEffects.playerPoison > 0 && <span className="sf-effect-icon">☠️</span>}
                {battleState.activeEffects.playerShield > 0 && <span className="sf-effect-icon">🛡️</span>}
              </div>
              <div className="sf-hp-info">
                <div className="sf-name-label">PLAYER</div>
                <div className="sf-hp-bar-container">
                  <div 
                    className={`sf-hp-bar ${(battleState.playerHp / battleState.playerMaxHp * 100) > 50 ? 'green' : (battleState.playerHp / battleState.playerMaxHp * 100) > 20 ? 'yellow' : 'red'}`}
                    style={{ width: `${(battleState.playerHp / battleState.playerMaxHp * 100)}%` }}
                  ></div>
                </div>
                <div className="sf-hp-text">{battleState.playerHp}/{battleState.playerMaxHp}</div>
              </div>
            </div>

            {/* Turn Indicator Center */}
            <div className="sf-center-display">
              <div className="sf-round-text">BATTLE</div>
              <div className={`sf-turn-indicator ${battleState.turn === 'player' ? 'player-turn' : 'enemy-turn'}`}>
                {battleState.turn === 'player' ? 'YOUR TURN' : 'ENEMY TURN'}
              </div>
            </div>

            {/* Enemy Side (Right) */}
            <div className="sf-enemy-side">
              <div className="sf-hp-info">
                <div className="sf-name-label">{battleState.isBoss ? battleState.bossData.name.toUpperCase() : 'ENEMY'} {battleState.isBoss && '⚔️'}</div>
                <div className="sf-hp-bar-container">
                  <div 
                    className={`sf-hp-bar ${(battleState.npcHp / battleState.npcMaxHp * 100) > 50 ? 'green' : (battleState.npcHp / battleState.npcMaxHp * 100) > 20 ? 'yellow' : 'red'}`}
                    style={{ width: `${(battleState.npcHp / battleState.npcMaxHp * 100)}%` }}
                  ></div>
                </div>
                <div className="sf-hp-text">{battleState.npcHp}/{battleState.npcMaxHp}</div>
              </div>
              <div className="sf-portrait-frame">
                <img src={battleState.npc.image} alt={battleState.isBoss ? battleState.bossData.name : 'Enemy'} className="sf-portrait" />
                {battleState.activeEffects.enemyBurn > 0 && <span className="sf-effect-icon">🔥</span>}
                {battleState.activeEffects.enemyPoison > 0 && <span className="sf-effect-icon">☠️</span>}
                {battleState.activeEffects.enemyFreeze && <span className="sf-effect-icon">❄️</span>}
              </div>
            </div>
          </div>

          {/* Fighters */}
          <div className="fighters-container">
            {/* Player Fighter (Left) */}
            <div className={`fighter left ${battleState.turn === 'player' ? 'active-turn' : ''}`}>
              <img 
                src={battleState.turn === 'player' ? '/fighting-stance.png' : '/defending-stance.png'} 
                alt="Player" 
                className="fighter-sprite" 
                style={{ height: '320px', width: 'auto' }} 
              />
            </div>

            {/* Enemy Fighter (Right) */}
            <div className={`fighter right ${battleState.turn === 'npc' ? 'active-turn' : ''}`}>
              <img 
                src={battleState.npc.image} 
                alt={battleState.isBoss ? battleState.bossData.name : 'Enemy'} 
                className="fighter-sprite"
                style={{ height: battleState.isBoss ? '340px' : '280px', width: 'auto' }}
              />
              {battleState.bossPhase === 'phase50' && <div className="boss-aura phase-50"></div>}
              {battleState.bossPhase === 'phase20' && <div className="boss-aura phase-20"></div>}
            </div>
          </div>
        </div>
        
        {/* Simplified Battle Menu */}
        <div className="fighting-game-menu">
          {battleState.turn === 'player' ? (
            <>
              {/* Action Buttons */}
              <div className="fighting-action-buttons">
                {battleMenu === 'items' ? (
                  <div className="pokemon-items-menu">
                    <div className="items-menu-left">
                      <button className="items-close-btn" onClick={() => setBattleMenu('main')}>← BACK</button>
                      <div className="items-category">ITEMS</div>
                    </div>
                    <div className="items-menu-right">
                      <div className="items-list-pokemon">
                        {Object.entries(ITEMS).map(([itemId, item]) => (
                          <div 
                            key={itemId}
                            className={`item-row-pokemon ${inventory[itemId] <= 0 ? 'disabled' : ''} ${selectedItemForInfo === itemId ? 'selected' : ''}`}
                            onClick={() => {
                              if (inventory[itemId] > 0) {
                                setSelectedItemForInfo(itemId)
                              }
                            }}
                          >
                            <span className="item-name-pokemon">{item.name}</span>
                            <span className="item-quantity">×{inventory[itemId]}</span>
                          </div>
                        ))}
                      </div>
                      <div className="items-scroll-indicator">▼</div>
                    </div>
                    
                    {/* Item Description Box */}
                    {selectedItemForInfo && (
                      <div className="item-description-box">
                        <div className="item-desc-text">{ITEMS[selectedItemForInfo].effect}</div>
                        <div className="item-actions">
                          <button 
                            className="item-action-btn use-btn"
                            onClick={() => {
                              if (ITEMS[selectedItemForInfo].type === 'healing' || ITEMS[selectedItemForInfo].type === 'utility') {
                                useItem(selectedItemForInfo)
                                setSelectedItemForInfo(null)
                                setBattleMenu('main')
                              } else {
                                selectItem(selectedItemForInfo)
                                setSelectedItemForInfo(null)
                                setBattleMenu('main')
                              }
                            }}
                          >
                            USE
                          </button>
                          <button 
                            className="item-action-btn cancel-btn"
                            onClick={() => setSelectedItemForInfo(null)}
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Main Battle Actions - Fighting Game Style - Smaller */}
                    <button className="fighting-btn-small attack-btn" onClick={() => { handleDiceAction('attack'); }}>
                      <span className="btn-keybind">[ A ]</span>
                      <img src="/buttons/attack-dice.png" alt="Attack" className="btn-icon-img" />
                      <span className="btn-label-text">ATTACK</span>
                    </button>
                    <button className="fighting-btn-small heal-btn" onClick={() => handleDiceAction('heal')}>
                      <span className="btn-keybind">[ H ]</span>
                      <img src="/buttons/heal-dice.png" alt="Heal" className="btn-icon-img" />
                      <span className="btn-label-text">HEAL</span>
                    </button>
                    <button className="fighting-btn-small items-btn" onClick={() => { setBattleMenu('items'); setSelectedItemForInfo(null); }}>
                      <span className="btn-keybind">[ I ]</span>
                      <img src="/buttons/items.png" alt="Items" className="btn-icon-img" />
                      <span className="btn-label-text">ITEMS</span>
                    </button>
                    {battleState.diceAvailable.randomEvent > 0 && (
                      <button className="fighting-btn-small event-btn" onClick={() => handleDiceAction('random')}>
                        <span className="btn-keybind">[ R ]</span>
                        <img src="/buttons/event-dice.png" alt="Event" className="btn-icon-img" />
                        <span className="btn-label-text">EVENT</span>
                      </button>
                    )}
                    {battleState.diceAvailable.chaos > 0 && (
                      <button className="fighting-btn-small chaos-btn" onClick={() => handleDiceAction('chaos')}>
                        <span className="btn-keybind">[ C ]</span>
                        <img src="/buttons/chaos-dice.png" alt="Chaos" className="btn-icon-img" />
                        <span className="btn-label-text">CHAOS</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="fighting-action-buttons">
              <div className="waiting-message">Enemy's turn...</div>
            </div>
          )}
        </div>
        
        {/* Forfeit Confirmation Modal */}
        {showForfeitConfirm && (
          <div className="forfeit-confirm-overlay">
            <div className="forfeit-confirm-box">
              <div className="forfeit-confirm-title">FORFEIT BATTLE?</div>
              <div className="forfeit-confirm-text">
                Are you sure you want to forfeit this battle?<br/>
                You will lose all progress in this fight.
              </div>
              <div className="forfeit-confirm-buttons">
                <button 
                  className="forfeit-confirm-btn confirm-yes" 
                  onClick={() => {
                    setShowForfeitConfirm(false)
                    forfeitBattle()
                  }}
                >
                  YES, FORFEIT
                </button>
                <button 
                  className="forfeit-confirm-btn confirm-no" 
                  onClick={() => setShowForfeitConfirm(false)}
                >
                  NO, CONTINUE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="game-container">
      <div className="game-info">
        <h1>Tower Ascend</h1>
        <p>Floor: {currentFloor} / 10</p>
        <p className="controls">Controls: WASD/Arrow Keys to move, Space to jump, E to interact</p>
      </div>
      
      <div className="game-screen">
        <div 
          className="game-world" 
          style={{ transform: `translateY(${cameraY}px)` }}
        >
          {/* Render building floors */}
          {platforms.map((platform, idx) => {
            const gapOnRight = platform.floor % 2 === 0 && platform.floor > 0
            const gapOnLeft = platform.floor % 2 === 1 && platform.floor > 0
            
            return (
              <div
                key={idx}
                className="platform"
                style={{
                  left: `${platform.x}px`,
                  top: `${platform.y}px`,
                  width: `${platform.width}px`,
                  height: `${platform.height}px`,
                  backgroundColor: platform.floor === 0 ? '#4a5568' : '#718096',
                  borderRight: gapOnRight ? '5px solid #ff3333' : 'none',
                  borderLeft: gapOnLeft ? '5px solid #ff3333' : 'none'
                }}
              >
                {/* Show floor number on each platform */}
                {platform.floor > 0 && (
                  <span className="floor-label">Floor {platform.floor}</span>
                )}
                {/* Gap indicator */}
                {gapOnRight && (
                  <span className="gap-indicator" style={{ right: '-60px' }}>↑</span>
                )}
                {gapOnLeft && (
                  <span className="gap-indicator" style={{ left: '-60px' }}>↑</span>
                )}
              </div>
            )
          })}
          
          {/* Building walls */}
          <div className="building-wall left-wall"></div>
          <div className="building-wall right-wall"></div>

          {/* NPCs */}
          {npcs.map((npc) => {
            const isRevealed = getIsNPCRevealed(npc)
            const canInteract = canInteractWithNPC(npc)
            const isDefeated = defeatedNPCs.has(npc.id)
            
            return (
              <div
                key={npc.id}
                className={`npc ${isRevealed ? 'revealed' : 'silhouette'} ${isDefeated ? 'defeated' : ''}`}
                style={{
                  left: `${npc.x}px`,
                  top: `${npc.y}px`,
                  width: `${npc.size}px`,
                  height: `${npc.size}px`
                }}
              >
                {npc.isBoss && !isDefeated && (
                  <div className={`boss-aura-exploration ${canInteract ? 'can-interact' : ''}`}></div>
                )}
                <img 
                  src={npc.image} 
                  alt="NPC"
                  style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }}
                />
                {canInteract && !isDefeated && (
                  <div className="interact-prompt">E</div>
                )}
              </div>
            )
          })}

          {/* Player character */}
          <div
            className="player"
            style={{
              left: `${player.x}px`,
              top: `${player.y}px`,
              width: `${PLAYER_WIDTH}px`,
              height: `${PLAYER_HEIGHT}px`,
              transform: player.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)'
            }}
          >
            <img 
              src={player.isMoving ? '/walker.gif' : '/walker-still.png'} 
              alt="Player"
              style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }}
            />
          </div>

          {/* Goal indicator at top floor */}
          {currentFloor === 10 && (
            <div className="victory-message">
              VICTORY!
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Controls */}
      <div className="mobile-controls">
        <div className="mobile-controls-left">
          <button 
            className="mobile-btn mobile-left"
            onTouchStart={() => keysPressed.current['a'] = true}
            onTouchEnd={() => keysPressed.current['a'] = false}
            onMouseDown={() => keysPressed.current['a'] = true}
            onMouseUp={() => keysPressed.current['a'] = false}
          >
            ←
          </button>
          <button 
            className="mobile-btn mobile-right"
            onTouchStart={() => keysPressed.current['d'] = true}
            onTouchEnd={() => keysPressed.current['d'] = false}
            onMouseDown={() => keysPressed.current['d'] = true}
            onMouseUp={() => keysPressed.current['d'] = false}
          >
            →
          </button>
        </div>
        <div className="mobile-controls-right">
          <button 
            className="mobile-btn mobile-jump"
            onTouchStart={(e) => {
              e.preventDefault()
              if (player.isGrounded && !battleState) {
                playJumpSound()
                setPlayer(prev => ({
                  ...prev,
                  velocityY: JUMP_FORCE,
                  isGrounded: false
                }))
              }
            }}
            onClick={(e) => {
              e.preventDefault()
              if (player.isGrounded && !battleState) {
                playJumpSound()
                setPlayer(prev => ({
                  ...prev,
                  velocityY: JUMP_FORCE,
                  isGrounded: false
                }))
              }
            }}
          >
            JUMP
          </button>
          <button 
            className="mobile-btn mobile-interact"
            onTouchStart={(e) => {
              e.preventDefault()
              const nearbyNPC = npcs.find(npc => canInteractWithNPC(npc))
              if (nearbyNPC) {
                startBattle(nearbyNPC)
              }
            }}
            onClick={(e) => {
              e.preventDefault()
              const nearbyNPC = npcs.find(npc => canInteractWithNPC(npc))
              if (nearbyNPC) {
                startBattle(nearbyNPC)
              }
            }}
          >
            E
          </button>
        </div>
      </div>
    </div>
  )
}

export default Game

