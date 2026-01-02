'use client';

export default function Landing() {
  return (
    <div style={{ margin: 0, padding: 0, overflow: 'hidden', width: '100vw', height: '100vh' }}>
      <div dangerouslySetInnerHTML={{ __html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Resolution Warrior: The 2026 Gauntlet</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { 
  overflow: hidden; 
  font-family: 'Courier New', monospace;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}
canvas { 
  display: block; 
  background: #0a0a1a;
}
#mobileControls {
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  display: none;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
  pointer-events: none;
}
.control-group {
  display: flex;
  gap: 10px;
  pointer-events: all;
}
.mobile-btn {
  width: 60px;
  height: 60px;
  border: 3px solid #00ffff;
  background: rgba(0, 255, 255, 0.2);
  color: #00ffff;
  font-size: 12px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.mobile-btn:active {
  background: rgba(0, 255, 255, 0.5);
  transform: scale(0.95);
}
@media (max-width: 768px) {
  #mobileControls { display: flex; }
}
</style>
</head>
<body>
<canvas id="gameCanvas"></canvas>
<div id="mobileControls">
  <div class="control-group">
    <button class="mobile-btn" id="btnLeft">←</button>
    <button class="mobile-btn" id="btnRight">→</button>
  </div>
  <div class="control-group">
    <button class="mobile-btn" id="btnBlock">BLOCK</button>
  </div>
  <div class="control-group">
    <button class="mobile-btn" id="btnPunch">PUNCH</button>
    <button class="mobile-btn" id="btnKick">KICK</button>
  </div>
</div>

<script>
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Responsive canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game Constants
const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;
const GROUND_Y = GAME_HEIGHT - 100;

// Game States
const STATE = {
  MENU: 'MENU',
  RUNNING: 'RUNNING',
  ENCOUNTER: 'ENCOUNTER',
  COMBAT: 'COMBAT',
  VICTORY: 'VICTORY',
  GAME_OVER: 'GAME_OVER',
  WIN: 'WIN'
};

// Enemy Definitions (12 Months)
const ENEMIES = [
  { name: 'THE SNOOZE BUTTON', month: 'JANUARY', hp: 100, speed: 1, aggression: 0.3, defense: 0.1, color: '#ff4444' },
  { name: 'CHEAP DOPAMINE', month: 'FEBRUARY', hp: 80, speed: 3, aggression: 0.5, defense: 0.05, color: '#ff6644' },
  { name: 'INCONSISTENCY', month: 'MARCH', hp: 120, speed: 2, aggression: 0.4, defense: 0.15, color: '#ff8844' },
  { name: 'COMPARISON THIEF', month: 'APRIL', hp: 140, speed: 2.5, aggression: 0.5, defense: 0.2, color: '#ffaa44' },
  { name: 'COMFORT ZONE', month: 'MAY', hp: 180, speed: 1.5, aggression: 0.3, defense: 0.4, color: '#ffcc44' },
  { name: 'HALF-WAY SLUMP', month: 'JUNE', hp: 220, speed: 1.8, aggression: 0.4, defense: 0.3, color: '#ffee44' },
  { name: 'EXCUSE MAKER', month: 'JULY', hp: 160, speed: 3.5, aggression: 0.6, defense: 0.1, color: '#ccff44' },
  { name: 'VALIDATION SEEKER', month: 'AUGUST', hp: 200, speed: 2.8, aggression: 0.7, defense: 0.2, color: '#88ff44' },
  { name: 'MENTAL BLOCK', month: 'SEPTEMBER', hp: 240, speed: 2.2, aggression: 0.6, defense: 0.25, color: '#44ff88' },
  { name: 'FEAR OF FAILURE', month: 'OCTOBER', hp: 280, speed: 3, aggression: 0.8, defense: 0.2, color: '#44ffcc' },
  { name: 'OVERTHINKING', month: 'NOVEMBER', hp: 300, speed: 4, aggression: 0.85, defense: 0.15, color: '#44ccff' },
  { name: 'THE INNER CRITIC', month: 'DECEMBER', hp: 400, speed: 3.5, aggression: 0.9, defense: 0.3, color: '#8844ff' }
];

// Positive & Negative Words
const POSITIVE_WORDS = ['FOCUS!', 'GRIND!', 'DISCIPLINE!', 'POWER!', 'STRONG!', 'UNSTOPPABLE!'];
const NEGATIVE_WORDS = ['DOUBT', 'LAZY', 'FEAR', 'WEAK', 'QUIT', 'FAILURE'];

// Game State
let gameState = STATE.MENU;
let currentLevel = 0;
let scrollOffset = 0;
let backgroundHue = 240;

// Player
const player = {
  x: 200,
  y: GROUND_Y - 60,
  width: 40,
  height: 60,
  hp: 100,
  maxHp: 100,
  speed: 4,
  isBlocking: false,
  isAttacking: false,
  attackType: null,
  attackFrame: 0,
  facingRight: true,
  invincible: false,
  invincibleTimer: 0,
  doubleDamage: false,
  doubleDamageTimer: 0
};

// Enemy
let enemy = null;

// Items
let items = [];

// Floating Text
let floatingTexts = [];

// Input
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

// Mobile Controls
const mobileButtons = {
  left: false,
  right: false,
  block: false,
  punch: false,
  kick: false
};

function setupMobileControls() {
  const btnLeft = document.getElementById('btnLeft');
  const btnRight = document.getElementById('btnRight');
  const btnBlock = document.getElementById('btnBlock');
  const btnPunch = document.getElementById('btnPunch');
  const btnKick = document.getElementById('btnKick');

  btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); mobileButtons.left = true; });
  btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); mobileButtons.left = false; });
  
  btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); mobileButtons.right = true; });
  btnRight.addEventListener('touchend', (e) => { e.preventDefault(); mobileButtons.right = false; });
  
  btnBlock.addEventListener('touchstart', (e) => { e.preventDefault(); mobileButtons.block = true; });
  btnBlock.addEventListener('touchend', (e) => { e.preventDefault(); mobileButtons.block = false; });
  
  btnPunch.addEventListener('touchstart', (e) => { e.preventDefault(); handlePunch(); });
  btnKick.addEventListener('touchstart', (e) => { e.preventDefault(); handleKick(); });
}
setupMobileControls();

// Helper Functions
function isKeyPressed(key) {
  return keys[key] || false;
}

function isMobileButtonPressed(button) {
  return mobileButtons[button] || false;
}

function spawnEnemy(level) {
  const enemyData = ENEMIES[level];
  enemy = {
    ...enemyData,
    x: GAME_WIDTH - 200,
    y: GROUND_Y - 60,
    width: 40,
    height: 60,
    maxHp: enemyData.hp,
    currentHp: enemyData.hp,
    isBlocking: false,
    isAttacking: false,
    attackType: null,
    attackFrame: 0,
    aiTimer: 0,
    aiAction: 'idle',
    facingRight: false
  };
}

function spawnItem() {
  if (Math.random() < 0.15) {
    const types = ['coffee', 'brain', 'shield'];
    const type = types[Math.floor(Math.random() * types.length)];
    items.push({
      type,
      x: GAME_WIDTH + Math.random() * 200,
      y: GROUND_Y - 40,
      width: 30,
      height: 30
    });
  }
}

function addFloatingText(text, x, y, color) {
  floatingTexts.push({ text, x, y, vy: -2, alpha: 1, color });
}

function handlePunch() {
  if (gameState === STATE.COMBAT && !player.isAttacking) {
    player.isAttacking = true;
    player.attackType = 'punch';
    player.attackFrame = 15;
  }
}

function handleKick() {
  if (gameState === STATE.COMBAT && !player.isAttacking) {
    player.isAttacking = true;
    player.attackType = 'kick';
    player.attackFrame = 25;
  }
}

// Update Functions
function updateMenu() {
  if (isKeyPressed(' ') || isKeyPressed('enter')) {
    gameState = STATE.RUNNING;
    currentLevel = 0;
    player.hp = player.maxHp;
    scrollOffset = 0;
  }
}

function updateRunning() {
  // Auto-scroll
  scrollOffset += 3;
  
  // Spawn items
  if (Math.random() < 0.005) {
    spawnItem();
  }
  
  // Update items
  items = items.filter(item => {
    item.x -= 3;
    
    // Collision with player
    if (Math.abs(player.x - item.x) < 40 && Math.abs(player.y - item.y) < 40) {
      if (item.type === 'coffee') {
        player.hp = Math.min(player.maxHp, player.hp + 30);
        addFloatingText('+30 HP', player.x, player.y - 40, '#00ff00');
      } else if (item.type === 'brain') {
        player.doubleDamage = true;
        player.doubleDamageTimer = 600;
        addFloatingText('FLOW STATE!', player.x, player.y - 40, '#ffff00');
      } else if (item.type === 'shield') {
        player.invincible = true;
        player.invincibleTimer = 300;
        addFloatingText('STOIC MIND!', player.x, player.y - 40, '#00ffff');
      }
      return false;
    }
    
    return item.x > -50;
  });
  
  // Trigger encounter
  if (scrollOffset > 800 + currentLevel * 200) {
    gameState = STATE.ENCOUNTER;
    spawnEnemy(currentLevel);
    scrollOffset = 0;
  }
}

function updateEncounter() {
  // Transition animation
  if (enemy && enemy.x > GAME_WIDTH - 300) {
    enemy.x -= 2;
  } else {
    gameState = STATE.COMBAT;
  }
}

function updateCombat() {
  // Player movement
  if ((isKeyPressed('arrowleft') || isMobileButtonPressed('left')) && player.x > 50) {
    player.x -= player.speed;
    player.facingRight = false;
  }
  if ((isKeyPressed('arrowright') || isMobileButtonPressed('right')) && player.x < GAME_WIDTH - 250) {
    player.x += player.speed;
    player.facingRight = true;
  }
  
  // Player blocking
  player.isBlocking = isKeyPressed(' ') || isMobileButtonPressed('block');
  
  // Player attacks
  if ((isKeyPressed('z') && !player.isAttacking)) {
    handlePunch();
    keys['z'] = false;
  }
  if ((isKeyPressed('x') && !player.isAttacking)) {
    handleKick();
    keys['x'] = false;
  }
  
  // Update attack frames
  if (player.isAttacking) {
    player.attackFrame--;
    
    // Check hit on enemy
    if (player.attackFrame === 10 && enemy) {
      const range = player.attackType === 'kick' ? 80 : 60;
      const distance = Math.abs(player.x - enemy.x);
      
      if (distance < range && !enemy.isBlocking) {
        const baseDamage = player.attackType === 'kick' ? 25 : 15;
        const damage = player.doubleDamage ? baseDamage * 2 : baseDamage;
        enemy.currentHp -= damage;
        addFloatingText('-' + damage, enemy.x, enemy.y - 40, '#ff0000');
        addFloatingText(POSITIVE_WORDS[Math.floor(Math.random() * POSITIVE_WORDS.length)], player.x, player.y - 60, '#00ffff');
      } else if (enemy.isBlocking) {
        addFloatingText('BLOCKED!', enemy.x, enemy.y - 40, '#ffff00');
      }
    }
    
    if (player.attackFrame <= 0) {
      player.isAttacking = false;
      player.attackType = null;
    }
  }
  
  // Enemy AI
  if (enemy) {
    enemy.aiTimer++;
    
    if (enemy.aiTimer > 60 / enemy.speed) {
      enemy.aiTimer = 0;
      const rand = Math.random();
      
      if (rand < enemy.aggression * 0.3) {
        enemy.aiAction = 'attack';
        enemy.isAttacking = true;
        enemy.attackType = Math.random() < 0.5 ? 'punch' : 'kick';
        enemy.attackFrame = enemy.attackType === 'kick' ? 25 : 15;
      } else if (rand < enemy.aggression * 0.5) {
        enemy.aiAction = 'move';
      } else if (rand < enemy.defense) {
        enemy.aiAction = 'block';
        enemy.isBlocking = true;
      } else {
        enemy.aiAction = 'idle';
        enemy.isBlocking = false;
      }
    }
    
    // Enemy movement
    if (enemy.aiAction === 'move') {
      const distance = player.x - enemy.x;
      if (Math.abs(distance) > 100) {
        enemy.x += distance > 0 ? enemy.speed : -enemy.speed;
      }
    }
    
    // Enemy attack
    if (enemy.isAttacking) {
      enemy.attackFrame--;
      
      if (enemy.attackFrame === 10) {
        const range = enemy.attackType === 'kick' ? 80 : 60;
        const distance = Math.abs(player.x - enemy.x);
        
        if (distance < range && !player.isBlocking && !player.invincible) {
          const damage = enemy.attackType === 'kick' ? 20 : 12;
          player.hp -= damage;
          addFloatingText('-' + damage, player.x, player.y - 40, '#ff0000');
          addFloatingText(NEGATIVE_WORDS[Math.floor(Math.random() * NEGATIVE_WORDS.length)], player.x, player.y - 60, '#ff4444');
        } else if (player.isBlocking) {
          addFloatingText('BLOCKED!', player.x, player.y - 40, '#00ff00');
        }
      }
      
      if (enemy.attackFrame <= 0) {
        enemy.isAttacking = false;
        enemy.attackType = null;
      }
    }
    
    // Check enemy defeat
    if (enemy.currentHp <= 0) {
      gameState = STATE.VICTORY;
      enemy = null;
    }
  }
  
  // Check player defeat
  if (player.hp <= 0) {
    gameState = STATE.GAME_OVER;
  }
  
  // Update timers
  if (player.invincibleTimer > 0) {
    player.invincibleTimer--;
    if (player.invincibleTimer === 0) player.invincible = false;
  }
  if (player.doubleDamageTimer > 0) {
    player.doubleDamageTimer--;
    if (player.doubleDamageTimer === 0) player.doubleDamage = false;
  }
}

function updateVictory() {
  // Heal player
  player.hp = Math.min(player.maxHp, player.hp + 20);
  
  // Wait for input
  setTimeout(() => {
    currentLevel++;
    if (currentLevel >= ENEMIES.length) {
      gameState = STATE.WIN;
    } else {
      gameState = STATE.RUNNING;
      backgroundHue = 240 - (currentLevel * 15);
    }
  }, 2000);
}

function updateFloatingTexts() {
  floatingTexts = floatingTexts.filter(text => {
    text.y += text.vy;
    text.alpha -= 0.02;
    return text.alpha > 0;
  });
}

// Draw Functions
function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  gradient.addColorStop(0, \`hsl(\${backgroundHue}, 70%, 10%)\`);
  gradient.addColorStop(1, \`hsl(\${backgroundHue + 40}, 60%, 20%)\`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  
  // Parallax stars
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  for (let i = 0; i < 50; i++) {
    const x = (i * 137 + scrollOffset * 0.5) % GAME_WIDTH;
    const y = (i * 73) % GAME_HEIGHT;
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawGround() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);
  
  // Grid lines
  ctx.strokeStyle = '#2a2a4e';
  ctx.lineWidth = 1;
  for (let i = 0; i < GAME_WIDTH; i += 50) {
    ctx.beginPath();
    ctx.moveTo(i - (scrollOffset % 50), GROUND_Y);
    ctx.lineTo(i - (scrollOffset % 50), GAME_HEIGHT);
    ctx.stroke();
  }
}

function drawPlayer() {
  ctx.save();
  
  // Invincibility effect
  if (player.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }
  
  // Body
  ctx.fillStyle = '#00ffff';
  ctx.fillRect(player.x - player.width / 2, player.y, player.width, player.height);
  
  // Head
  ctx.fillStyle = '#00cccc';
  ctx.fillRect(player.x - 15, player.y - 20, 30, 20);
  
  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(player.x - 10, player.y - 15, 6, 6);
  ctx.fillRect(player.x + 4, player.y - 15, 6, 6);
  
  // Blocking stance
  if (player.isBlocking) {
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(player.x - 25, player.y + 10, 10, 30);
    ctx.fillRect(player.x + 15, player.y + 10, 10, 30);
  }
  
  // Attack animation
  if (player.isAttacking) {
    ctx.fillStyle = '#ff00ff';
    const attackX = player.facingRight ? player.x + 30 : player.x - 50;
    const attackW = player.attackType === 'kick' ? 40 : 30;
    ctx.fillRect(attackX, player.y + 20, attackW, 15);
  }
  
  ctx.restore();
}

function drawEnemy() {
  if (!enemy) return;
  
  ctx.save();
  
  // Body
  ctx.fillStyle = enemy.color;
  ctx.fillRect(enemy.x - enemy.width / 2, enemy.y, enemy.width, enemy.height);
  
  // Head
  ctx.fillStyle = enemy.color;
  ctx.globalAlpha = 0.8;
  ctx.fillRect(enemy.x - 15, enemy.y - 20, 30, 20);
  
  // Eyes (menacing)
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(enemy.x - 10, enemy.y - 15, 8, 8);
  ctx.fillRect(enemy.x + 2, enemy.y - 15, 8, 8);
  
  // Blocking
  if (enemy.isBlocking) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(enemy.x - 25, enemy.y + 10, 10, 30);
    ctx.fillRect(enemy.x + 15, enemy.y + 10, 10, 30);
  }
  
  // Attack
  if (enemy.isAttacking) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ff0000';
    const attackX = enemy.facingRight ? enemy.x + 30 : enemy.x - 50;
    const attackW = enemy.attackType === 'kick' ? 40 : 30;
    ctx.fillRect(attackX, enemy.y + 20, attackW, 15);
  }
  
  ctx.restore();
}

function drawItems() {
  items.forEach(item => {
    if (item.type === 'coffee') {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(item.x, item.y, item.width, item.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(item.x + 5, item.y + 5, item.width - 10, item.height - 10);
    } else if (item.type === 'brain') {
      ctx.fillStyle = '#ff69b4';
      ctx.beginPath();
      ctx.arc(item.x + 15, item.y + 15, 15, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.type === 'shield') {
      ctx.fillStyle = '#4169e1';
      ctx.beginPath();
      ctx.moveTo(item.x + 15, item.y);
      ctx.lineTo(item.x + 30, item.y + 15);
      ctx.lineTo(item.x + 15, item.y + 30);
      ctx.lineTo(item.x, item.y + 15);
      ctx.closePath();
      ctx.fill();
    }
  });
}

function drawUI() {
  // Player HP
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px Courier New';
  ctx.fillText('WILLPOWER', 20, 30);
  
  ctx.fillStyle = '#333333';
  ctx.fillRect(20, 40, 200, 20);
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(20, 40, (player.hp / player.maxHp) * 200, 20);
  ctx.strokeStyle = '#ffffff';
  ctx.strokeRect(20, 40, 200, 20);
  
  // Enemy HP
  if (enemy) {
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText(enemy.month, GAME_WIDTH - 20, 30);
    ctx.textAlign = 'left';
    
    ctx.fillStyle = '#333333';
    ctx.fillRect(GAME_WIDTH - 220, 40, 200, 20);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(GAME_WIDTH - 220, 40, (enemy.currentHp / enemy.maxHp) * 200, 20);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(GAME_WIDTH - 220, 40, 200, 20);
    
    // Enemy name
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 24px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(\`VS \${enemy.name}\`, GAME_WIDTH / 2, 50);
    ctx.textAlign = 'left';
  }
  
  // Buffs
  let buffY = 80;
  if (player.doubleDamage) {
    ctx.fillStyle = '#ffff00';
    ctx.font = '14px Courier New';
    ctx.fillText(\`FLOW STATE: \${Math.ceil(player.doubleDamageTimer / 60)}s\`, 20, buffY);
    buffY += 20;
  }
  if (player.invincible) {
    ctx.fillStyle = '#00ffff';
    ctx.fillText(\`STOIC MIND: \${Math.ceil(player.invincibleTimer / 60)}s\`, 20, buffY);
  }
}

function drawFloatingTexts() {
  floatingTexts.forEach(text => {
    ctx.save();
    ctx.globalAlpha = text.alpha;
    ctx.fillStyle = text.color;
    ctx.font = 'bold 20px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(text.text, text.x, text.y);
    ctx.restore();
  });
}

function drawMenu() {
  drawBackground();
  
  ctx.fillStyle = '#00ffff';
  ctx.font = 'bold 48px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('RESOLUTION WARRIOR', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100);
  
  ctx.font = 'bold 32px Courier New';
  ctx.fillText('THE 2026 GAUNTLET', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px Courier New';
  ctx.fillText('Defeat your inner demons', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
  ctx.fillText('12 months. 12 battles.', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
  
  ctx.fillStyle = '#ffff00';
  ctx.font = 'bold 24px Courier New';
  ctx.fillText('PRESS SPACE TO START', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 120);
  
  ctx.fillStyle = '#888888';
  ctx.font = '14px Courier New';
  ctx.fillText('Controls: Arrow Keys (Move) | Z (Punch) | X (Kick) | Space (Block)', GAME_WIDTH / 2, GAME_HEIGHT - 40);
}

function drawGameOver() {
  drawBackground();
  
  ctx.fillStyle = '#ff0000';
  ctx.font = 'bold 48px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('DEFEATED', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px Courier New';
  const defeatedBy = ENEMIES[currentLevel].name;
  ctx.fillText(\`\${defeatedBy} won.\`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
  ctx.fillText('Try again next year.', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60);
  
  ctx.fillStyle = '#ffff00';
  ctx.font = '20px Courier New';
  ctx.fillText('Press SPACE to restart', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 120);
}

function drawWin() {
  drawBackground();
  
  ctx.fillStyle = '#00ff00';
  ctx.font = 'bold 56px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('CONGRATULATIONS!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80);
  
  ctx.fillStyle = '#ffff00';
  ctx.font = 'bold 36px Courier New';
  ctx.fillText('YOU CONQUERED YOURSELF!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px Courier New';
  ctx.fillText('2026 is yours.', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);
  
  ctx.fillStyle = '#00ffff';
  ctx.font = '18px Courier New';
  ctx.fillText('Press SPACE to play again', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100);
}

function drawVictory() {
  drawBackground();
  drawGround();
  drawPlayer();
  
  ctx.fillStyle = '#00ff00';
  ctx.font = 'bold 48px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText(\`\${ENEMIES[currentLevel].month} CLEARED!\`, GAME_WIDTH / 2, GAME_HEIGHT / 2);
  
  ctx.fillStyle = '#ffff00';
  ctx.font = '24px Courier New';
  ctx.fillText('+20% HP RESTORED', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
}

// Main Game Loop
function gameLoop() {
  // Update
  switch (gameState) {
    case STATE.MENU:
      updateMenu();
      break;
    case STATE.RUNNING:
      updateRunning();
      break;
    case STATE.ENCOUNTER:
      updateEncounter();
      break;
    case STATE.COMBAT:
      updateCombat();
      break;
    case STATE.VICTORY:
      updateVictory();
      break;
    case STATE.GAME_OVER:
      if (isKeyPressed(' ')) {
        gameState = STATE.MENU;
        currentLevel = 0;
        player.hp = player.maxHp;
      }
      break;
    case STATE.WIN:
      if (isKeyPressed(' ')) {
        gameState = STATE.MENU;
        currentLevel = 0;
        player.hp = player.maxHp;
      }
      break;
  }
  
  updateFloatingTexts();
  
  // Draw
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  
  switch (gameState) {
    case STATE.MENU:
      drawMenu();
      break;
    case STATE.RUNNING:
      drawBackground();
      drawGround();
      drawItems();
      drawPlayer();
      drawFloatingTexts();
      break;
    case STATE.ENCOUNTER:
      drawBackground();
      drawGround();
      drawPlayer();
      drawEnemy();
      break;
    case STATE.COMBAT:
      drawBackground();
      drawGround();
      drawPlayer();
      drawEnemy();
      drawUI();
      drawFloatingTexts();
      break;
    case STATE.VICTORY:
      drawVictory();
      break;
    case STATE.GAME_OVER:
      drawGameOver();
      break;
    case STATE.WIN:
      drawWin();
      break;
  }
  
  requestAnimationFrame(gameLoop);
}

// Start Game
gameLoop();
</script>
</body>
</html>
      ` }} />
    </div>
  );
}

