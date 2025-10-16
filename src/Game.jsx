import { useState, useEffect, useRef } from 'react'
import './Game.css'

const GAME_WIDTH = 1000
const GAME_HEIGHT = 600
const PLAYER_WIDTH = 40
const PLAYER_HEIGHT = 60
const GRAVITY = 0.6
const JUMP_FORCE = -15
const MOVE_SPEED = 5
const FLOOR_HEIGHT = 80
const PLATFORM_HEIGHT = 20

const Game = () => {
  const [player, setPlayer] = useState({
    x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
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
  const [battleState, setBattleState] = useState(null) // { npc, playerHp, npcHp, turn, diceAvailable }
  const [battleLog, setBattleLog] = useState([])
  const [diceAnimation, setDiceAnimation] = useState(null)
  const [damageAnimation, setDamageAnimation] = useState(null)
  const [battleMenu, setBattleMenu] = useState('main') // 'main' or 'fight'
  const keysPressed = useRef({})
  const gameLoopRef = useRef(null)
  const audioContextRef = useRef(null)
  
  // Initialize audio context
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioContextRef.current
  }
  
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
  
  const playAttackSound = () => {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(150, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2)
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.2)
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

  // Create NPCs for each floor
  const npcsRef = useRef(null)
  
  if (!npcsRef.current) {
    const npcs = []
    const npcImages = [
      'npc1.png', 'npc2.png', 'npc3.png', 'npc4.png', 'npc5.png',
      'npc6.png', 'npc7.png', 'npc8.png', 'npc9.png', 'npc10.png',
      'npc11.png', 'npc12.png'
    ]
    let imageIndex = 0
    
    const NPC_SIZE = 70
    const FLOOR_SPACING = 160
    
    for (let floor = 1; floor <= 10; floor++) {
      const floorY = GAME_HEIGHT - FLOOR_HEIGHT - (floor * FLOOR_SPACING)
      const npcsPerFloor = 2 + Math.floor(Math.random() * 2) // 2-3 NPCs per floor
      
      for (let j = 0; j < npcsPerFloor; j++) {
        const x = 150 + (j * 350) + Math.random() * 100
        npcs.push({
          id: `npc-${floor}-${j}`,
          floor: floor,
          x: x,
          y: floorY - NPC_SIZE,
          size: NPC_SIZE,
          image: `/npc/${npcImages[imageIndex % npcImages.length]}`
        })
        imageIndex++
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
    setBattleState({
      npc,
      playerHp: 100,
      npcHp: 100,
      turn: 'player',
      diceAvailable: {
        chaos: 1,
        randomEvent: 1
      },
      effects: {
        playerPoison: false,
        npcPoison: false,
        playerSkipNext: false,
        npcSkipNext: false,
        playerTripleDice: false,
        npcTripleDice: false
      }
    })
    setBattleLog(['Battle started!'])
    setBattleMenu('main')
  }
  
  const forfeitBattle = () => {
    setBattleState(null)
    setBattleLog([])
    setDiceAnimation(null)
    setDamageAnimation(null)
    setBattleMenu('main')
  }
  
  const rollDice = () => Math.floor(Math.random() * 6) + 1
  
  const handleDiceAction = (type) => {
    if (!battleState || battleState.turn !== 'player') return
    
    // Play dice roll sound and animation
    playDiceRollSound()
    setDiceAnimation({ type, rolls: [] })
    
    setTimeout(() => {
      let newState = { ...battleState }
      let log = [...battleLog]
      
      if (type === 'attack') {
        const diceCount = newState.effects.playerTripleDice ? 3 : 2
        const rolls = Array.from({ length: diceCount }, rollDice)
        const damage = rolls.reduce((a, b) => a + b, 0)
        
        setDiceAnimation({ type: 'attack', rolls })
        playAttackSound()
        setDamageAnimation({ target: 'npc', value: damage })
        
        setTimeout(() => {
          newState.npcHp = Math.max(0, newState.npcHp - damage)
          log.push(`You rolled ${rolls.join(', ')} = ${damage} damage!`)
          newState.effects.playerTripleDice = false
          continueBattleAfterAction(newState, log)
        }, 800)
        return
      } else if (type === 'heal') {
        const diceCount = newState.effects.playerTripleDice ? 3 : 2
        const rolls = Array.from({ length: diceCount }, rollDice)
        const heal = rolls.reduce((a, b) => a + b, 0)
        
        setDiceAnimation({ type: 'heal', rolls })
        playHealSound()
        setDamageAnimation({ target: 'player', value: `+${heal}`, isHeal: true })
        
        setTimeout(() => {
          newState.playerHp = Math.min(100, newState.playerHp + heal)
          log.push(`You rolled ${rolls.join(', ')} = ${heal} HP healed!`)
          newState.effects.playerTripleDice = false
          continueBattleAfterAction(newState, log)
        }, 800)
        return
      } else if (type === 'chaos' && newState.diceAvailable.chaos > 0) {
        const roll = rollDice()
        setDiceAnimation({ type: 'chaos', rolls: [roll] })
        playChaosSound()
        
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
        }, 800)
        return
      } else if (type === 'random' && newState.diceAvailable.randomEvent > 0) {
        const roll = rollDice()
        setDiceAnimation({ type: 'random', rolls: [roll] })
        playChaosSound()
        
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
        }, 800)
        return
      }
      
      continueBattleAfterAction(newState, log)
    }, 600)
  }
  
  const continueBattleAfterAction = (newState, log) => {
    setDiceAnimation(null)
    setTimeout(() => setDamageAnimation(null), 1000)
    
    // Apply poison
    if (newState.effects.playerPoison) {
      newState.playerHp = Math.max(0, newState.playerHp - 5)
      log.push('You take 5 poison damage')
    }
    
    // Check win
    if (newState.npcHp <= 0) {
      log.push('Victory!')
      setDefeatedNPCs(prev => new Set([...prev, battleState.npc.id]))
      setBattleLog(log)
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
    
    if (newState.effects.npcSkipNext) {
      log.push('NPC turn skipped!')
      newState.effects.npcSkipNext = false
    } else {
      // Simple AI: attack if HP > 30, otherwise 50% heal
      const shouldHeal = newState.npcHp < 30 || Math.random() < 0.3
      
      if (shouldHeal && newState.npcHp < 90) {
        const diceCount = newState.effects.npcTripleDice ? 3 : 2
        const rolls = Array.from({ length: diceCount }, rollDice)
        const heal = rolls.reduce((a, b) => a + b, 0)
        newState.npcHp = Math.min(100, newState.npcHp + heal)
        log.push(`NPC healed for ${heal} HP`)
        newState.effects.npcTripleDice = false
      } else {
        const diceCount = newState.effects.npcTripleDice ? 3 : 2
        const rolls = Array.from({ length: diceCount }, rollDice)
        const damage = rolls.reduce((a, b) => a + b, 0)
        newState.playerHp = Math.max(0, newState.playerHp - damage)
        log.push(`NPC attacks for ${damage} damage!`)
        newState.effects.npcTripleDice = false
      }
    }
    
    // Apply poison
    if (newState.effects.npcPoison) {
      newState.npcHp = Math.max(0, newState.npcHp - 5)
      log.push('NPC takes 5 poison damage')
    }
    
    // Check loss
    if (newState.playerHp <= 0) {
      log.push('Defeat... Try again!')
      setBattleLog(log)
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
      
      // E key for interaction
      if (e.key === 'e' || e.key === 'E') {
        const nearbyNPC = npcs.find(npc => canInteractWithNPC(npc))
        if (nearbyNPC) {
          startBattle(nearbyNPC)
        }
      }
      
      // Space bar for jump
      if ((e.key === ' ' || e.key === 'Spacebar') && player.isGrounded && !battleState) {
        playJumpSound()
        setPlayer(prev => ({
          ...prev,
          velocityY: JUMP_FORCE,
          isGrounded: false
        }))
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
  }, [player, battleState, npcs, currentFloor, defeatedNPCs])
  
  // Check NPC proximity
  useEffect(() => {
    if (!battleState) {
      checkNPCProximity()
    }
  }, [player.x, player.y, currentFloor, battleState])

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

  // Battle Screen
  if (battleState) {
    return (
      <div className="pokemon-battle-screen">
        {/* Battle Log and Forfeit Button */}
        <div className="battle-log-container">
          <button className="forfeit-button" onClick={forfeitBattle}>
            ✕ FORFEIT
          </button>
          <div className="battle-log">
            <div className="battle-log-title">Battle Log</div>
            <div className="battle-log-messages">
              {battleLog.slice(-4).reverse().map((message, index) => (
                <div key={index} className="battle-log-message">
                  {message}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Dice rolling animation overlay */}
        {diceAnimation && (
          <div className="dice-overlay">
            <div className="dice-container">
              {diceAnimation.rolls.map((roll, i) => (
                <div key={i} className="dice-roll">
                  {roll}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Damage/Heal animation */}
        {damageAnimation && (
          <div className={`damage-popup ${damageAnimation.target} ${damageAnimation.isHeal ? 'heal' : 'damage'}`}>
            {damageAnimation.value}
          </div>
        )}
        
        {/* Battle Arena */}
        <div className="pokemon-battle-field">
          {/* Enemy Pokemon */}
          <div className="pokemon-enemy-area">
            <div className="pokemon-info-box enemy">
              <div className="pokemon-name-level">
                <span className="pokemon-name">Enemy</span>
                <span className="pokemon-level">Lv{Math.ceil(currentFloor * 1.5)}</span>
              </div>
              <div className="pokemon-hp-bar">
                <div className="hp-label">HP:</div>
                <div className="hp-bar-container">
                  <div 
                    className={`hp-bar-fill ${battleState.npcHp > 50 ? 'green' : battleState.npcHp > 20 ? 'yellow' : 'red'}`}
                    style={{ width: `${battleState.npcHp}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="pokemon-sprite enemy">
              <img src={battleState.npc.image} alt="Enemy" style={{ width: '120px', height: '120px', imageRendering: 'pixelated' }} />
            </div>
          </div>
          
          {/* Player Pokemon */}
          <div className="pokemon-player-area">
            <div className="pokemon-sprite player">
              <img src="/walker-still.png" alt="Player" style={{ width: '140px', height: '210px', imageRendering: 'pixelated' }} />
            </div>
            <div className="pokemon-info-box player">
              <div className="pokemon-name-level">
                <span className="pokemon-name">Player</span>
                <span className="pokemon-level">Lv{currentFloor + 5}</span>
              </div>
              <div className="pokemon-hp-bar">
                <div className="hp-label">HP:</div>
                <div className="hp-bar-container">
                  <div 
                    className={`hp-bar-fill ${battleState.playerHp > 50 ? 'green' : battleState.playerHp > 20 ? 'yellow' : 'red'}`}
                    style={{ width: `${battleState.playerHp}%` }}
                  ></div>
                </div>
              </div>
              <div className="hp-number">{battleState.playerHp} / 100</div>
            </div>
          </div>
        </div>
        
        {/* Battle Menu */}
        <div className="pokemon-battle-menu">
          {battleState.turn === 'player' ? (
            <>
              {/* Text Box */}
              <div className="pokemon-text-box">
                <div className={`turn-indicator ${battleState.turn === 'player' ? 'active' : ''}`}>
                  {battleMenu === 'main' ? 'What will you do?' : 'Choose your action!'}
                </div>
                {battleLog.length > 0 && (
                  <div className="battle-message">{battleLog[battleLog.length - 1]}</div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="pokemon-action-buttons">
                {battleMenu === 'main' ? (
                  <>
                    <button className="pokemon-btn fight" onClick={() => setBattleMenu('fight')}>
                      FIGHT
                    </button>
                    <button className="pokemon-btn bag" onClick={() => handleDiceAction('heal')}>
                      HEAL
                    </button>
                    <button 
                      className="pokemon-btn pokemon" 
                      onClick={() => handleDiceAction('chaos')}
                      disabled={battleState.diceAvailable.chaos === 0}
                    >
                      CHAOS {battleState.diceAvailable.chaos > 0 ? `(${battleState.diceAvailable.chaos})` : '(0)'}
                    </button>
                    <button 
                      className="pokemon-btn run" 
                      onClick={() => handleDiceAction('random')}
                      disabled={battleState.diceAvailable.randomEvent === 0}
                    >
                      EVENT {battleState.diceAvailable.randomEvent > 0 ? `(${battleState.diceAvailable.randomEvent})` : '(0)'}
                    </button>
                  </>
                ) : (
                  <>
                    <button className="pokemon-btn fight" onClick={() => { handleDiceAction('attack'); setBattleMenu('main'); }}>
                      ATTACK
                    </button>
                    <button className="pokemon-btn bag" onClick={() => setBattleMenu('main')}>
                      BACK
                    </button>
                    <button className="pokemon-btn pokemon disabled" disabled>
                      -
                    </button>
                    <button className="pokemon-btn run disabled" disabled>
                      -
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="pokemon-text-box">
                <div className="turn-indicator">
                  Enemy's turn...
                </div>
                {battleLog.length > 0 && (
                  <div className="battle-message">{battleLog[battleLog.length - 1]}</div>
                )}
              </div>
              <div className="pokemon-action-buttons">
                <div className="waiting-message">Waiting...</div>
              </div>
            </>
          )}
        </div>
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
    </div>
  )
}

export default Game

