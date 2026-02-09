  // Variables 

  let arrows = []

  const pauseOverlay = document.getElementById("pauseOverlay");
  const pause_button = document.getElementById("pause");
  const resume_button = document.getElementById("resumeBtn");

  const shotsFired_div = document.getElementById("shots");
  const score_div = document.getElementById("score");
  const hitPercent_div = document.getElementById("hitPercent");
  const timer_div = document.getElementById("timer");

  const test_div = document.getElementById("test");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const bow = document.getElementById("bow");

  let dragEnabled = false;
  const bowCenterX = bow.offsetLeft + (bow.offsetWidth / 2);
  const bowCenterY = bow.offsetTop + (bow.offsetHeight / 2);

  let stringPulledX = 0;  // How far string is pulled horizontally
  const MAX_PULL = 80;    // Max string stretch in pixels

  let shotsFired = 0;
  let angle = 0;
  let score = 0;

  let gameTime = 15; // seconds
  let gameActive = true;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Classes

  class Target {
    constructor() {
      this.img = new Image();
      this.img.src = "assets/target3.png";

      this.speed = 5;
      this.x = canvas.width - 200;
      this.y = 400;
      this.direction = 1;
      this.endings = 50;

      // Default size until image loads
      this.width = 120;
      this.height = 120;


      // When image loads, set correct size
      this.img.onload = () => {
        this.width = this.img.naturalWidth * 2;
        this.height = this.img.naturalHeight * 2;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
      };
    }

    update(ctx) {
      // If you want movement later, keep this logic
      if ((this.y < this.endings) || (this.y > canvas.height - this.height / 2 - this.endings)) {
        this.direction *= -1;
      }

      this.y += this.speed * this.direction;

      this.draw(ctx);
    }

    draw(ctx) {
      if (!this.img.complete || this.img.naturalWidth === 0) return;

      ctx.drawImage(
        this.img,
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height
      );
    }
  }

  class Arrow {
    constructor(angle, factor, target) {
      this.x = bowCenterX;
      this.y = bowCenterY;
      this.angle = angle;
      this.speed = 0.25 * factor;

      this.img = new Image();; // Store reference
      this.img.src = "assets/arrow3.png";

      this.stuck = false;
      this.target = target;

      this.width = this.img.naturalWidth * 0.4;
      this.height = this.img.naturalHeight * 0.4;

      this.hitOffsetX = this.width;
      this.hitOffsetY = this.height;

    }

    getTip() {
      // Tip is in front of the arrow
      const tipDistance = this.width; // how far forward from center
      return {
        x: this.x + Math.cos(this.angle) * tipDistance,
        y: this.y + Math.sin(this.angle) * tipDistance
      };
    }


    update(ctx) {

      if (this.stuck) {
        this.x = this.target.x - this.hitOffsetX;
        this.y = this.target.y + this.hitOffsetY / 2;
      }
      else {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
      }

      this.draw(ctx)
    }

    draw(ctx) {
      if (this.img.complete) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.img, -15, -5, this.width, this.height); // Adjust size
        ctx.restore();
      } else {
        // Fallback circle
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }


  const target = new Target()

  // Functions

  function gameloop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameActive) {
      gameTime -= 1/60; // 60 FPS = subtract 1/60 each frame
      
      // Update timer display every second
      if (Math.floor(gameTime) !== Math.floor(gameTime + 1/60)) {
        timer_div.textContent = Math.ceil(gameTime) + "s";
        
        // Visual feedback
        if (gameTime <= 10) {
          timer_div.style.color = "#ff4757";
        } else if (gameTime <= 30) {
          timer_div.style.color = "#ffa502";
        }
      }
      
      // Game over
      if (gameTime <= 0) {
        gameActive = false;
        timer_div.textContent = "0s";
        timer_div.style.color = "#ff4757";
        
        // Optional: Stop arrow spawning
        dragEnabled = false;

        endGame()
      }
    }

    target.update(ctx);
    drawString();
    // drawTargetDebug(target);

    // test_div.innerText = `Nope`;
    arrowCollision();

    requestAnimationFrame(gameloop);
  }


  function checkCollision(target, arrow) {
    if (arrow.stuck) return true;

    const tip = arrow.getTip();

    const dx = tip.x - target.x;
    const dy = tip.y - target.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    // Target radius + arrow radius
    const targetRadius = target.width / 2 || 50;
    const arrowRadius = 5;

    return distance < (targetRadius + arrowRadius);
  }


  function arrowCollision()
  {
    arrows = arrows.filter(arrow => {

      if (!arrow.stuck && checkCollision(target, arrow)) {
        score++;
        score_div.innerText = `${score}`;

        const hitPercent = Math.round((score / shotsFired) * 100);
        hitPercent_div.innerText = hitPercent + "%";

        arrow.stuck = true;

        const tip = arrow.getTip();

        // store where it hit RELATIVE to target center
        // arrow.hitOffsetX = tip.x - target.x;
        arrow.hitOffsetY = tip.y - target.y;
      }


      // drawArrowDebug(arrow)
      const keep = !(arrow.x > canvas.width || arrow.y > canvas.height || arrow.x < 0 || arrow.y < 0);
      if (keep) arrow.update(ctx);
      return keep;
    });

  }

  function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function handleMousedown(e) {
    dragEnabled = true;

    const dx = e.clientX - bowCenterX;
    const dy = e.clientY - bowCenterY;
    angle = Math.atan2(-dy, -dx) - 0.1;
    bow.style.transform = `rotate(${angle}rad)`;
  }

  function handleMouseup(e) {
    if (!dragEnabled) return;

    dragEnabled = false;
    const dx = e.clientX - bowCenterX;
    const dy = e.clientY - bowCenterY;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const pullPower = Math.min(distance / 200, 1);

    arrows.push(new Arrow(angle, distance, target));

    stringPulledX = 0;
    shotsFired++;
    shotsFired_div.innerText = `${shotsFired}`;

    bow.style.transform = `rotate(${angle}rad)`;
  }

  function handleMousemove(e) {
    const dx = e.clientX - bowCenterX;
    const dy = e.clientY - bowCenterY;

    // Calculate distance from bow center
    const distance = Math.sqrt(dx * dx + dy * dy);
    const MIN_DISTANCE = 30;

    if (dragEnabled && dx < 0 && distance > MIN_DISTANCE) {
      angle = Math.atan2(-dy, -dx) - 0.1;

      // Calculate string pull based on drag distance
      const pullPercent = Math.min(distance / 200, 1); // 0 to 1
      stringPulledX = -pullPercent * MAX_PULL; // Pull backward

      bow.style.transform = `rotate(${angle}rad)`;
    }
  }

  function drawString() {
    const bowHeight = bow.offsetHeight || 80;

    // Top and bottom string points (based on bow height)
    const stringTopY = -bowHeight * 0.33;
    const stringBottomY = bowHeight * 0.33;
    const stringX = -bowHeight * 0.07; // String start position

    ctx.save();
    ctx.translate(bowCenterX, bowCenterY);
    ctx.rotate(angle);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    // Draw string with pull effect
    ctx.beginPath();
    ctx.moveTo(stringX, stringTopY);
    ctx.lineTo(stringX + stringPulledX, 0);
    ctx.lineTo(stringX, stringBottomY);
    ctx.stroke();

    ctx.restore();
  }

 
  function endGame() {
    gameActive = false;
    
    // Show game over overlay
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.85);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: Arial;
      z-index: 10000;
    `;
    
    const finalScore = Math.round((score / shotsFired) * 100) || 0;
    
    overlay.innerHTML = `
      <h1 style="font-size: 48px; margin-bottom: 10px;">🎯 GAME OVER</h1>
      <div style="font-size: 24px; margin-bottom: 30px;">Final Score: ${score}</div>
      <div style="display: flex; gap: 40px; margin-bottom: 40px;">
        <div style="text-align: center;">
          <div style="font-size: 18px; opacity: 0.8;">Accuracy</div>
          <div style="font-size: 32px; font-weight: bold;">${finalScore}%</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 18px; opacity: 0.8;">Arrows Shot</div>
          <div style="font-size: 32px; font-weight: bold;">${shotsFired}</div>
        </div>
      </div>
      <button id="restartBtn" style="
        padding: 15px 40px;
        font-size: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 50px;
        color: white;
        cursor: pointer;
        transition: transform 0.2s;
      ">Play Again</button>
    `;
    
    document.body.appendChild(overlay);
    
    // Restart button
    document.getElementById("restartBtn").onclick = () => {
      location.reload(); // Simple restart
    };
  }

  pause_button.onclick = () => {
    pauseOverlay.style.display = "flex";
    gameActive = false; // Pause game logic
  };

// Hide overlay on resume
  resumeBtn.onclick = () => {
    pauseOverlay.style.display = "none";
    gameActive = true; // Resume game logic
  };

  // Restart from menu
  document.getElementById("restartMenuBtn").onclick = () => {
    location.reload(); // Or your restart function
  };

  // Difficulty buttons
  document.getElementById("incDiffBtn").onclick = () => {
    // Your increase difficulty logic
    target.speed++
    console.log("Increase difficulty");
  };

  document.getElementById("decDiffBtn").onclick = () => {
    // Your decrease difficulty logic
    target.speed--
    console.log("Decrease difficulty");
  };
  // ========== INITIALIZE ==========

  // Event Listeners
  window.addEventListener("resize", handleResize);
  window.addEventListener("mousedown", handleMousedown);
  window.addEventListener("mouseup", handleMouseup);
  window.addEventListener("mousemove", handleMousemove);

  gameloop();