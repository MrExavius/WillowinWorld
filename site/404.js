    (() => {
      const body = document.body;
      const canvas = document.getElementById("lostStarsCanvas");
      const ctx = canvas.getContext("2d", { alpha: true });
      const scoreValue = document.getElementById("scoreValue");
      const bestValue = document.getElementById("bestValue");
      const comboValue = document.getElementById("comboValue");
      const livesValue = document.getElementById("livesValue");
      const effectValue = document.getElementById("effectValue");
      const toast = document.getElementById("gameToast");
      const startButtons = document.querySelectorAll("[data-start-game]");
      const pauseButtons = document.querySelectorAll("[data-pause-game]");
      const controlButtons = document.querySelectorAll("[data-control-mode]");
      const themeToggle = document.querySelector("[data-theme-toggle]");
      const leftTouch = document.querySelector("[data-touch-left]");
      const rightTouch = document.querySelector("[data-touch-right]");

      const assetBase = "assets/404/";
      const imageSources = {
        stay: "magic-cat-mascot_stay_clean.webp",
        step1: "magic-cat-mascot_step1_clean.webp",
        step2: "magic-cat-mascot_step2_clean.webp",
        step3: "magic-cat-mascot_step3_clean.webp",
        step4: "magic-cat-mascot_step4_clean.webp",
        blackhole: "magic-cat-mascot_blackhole_clean.webp",
        heart: "magic-cat-mascot_heart_clean.webp",
        star1: "magic-cat-mascot_star1_clean.webp",
        star2: "magic-cat-mascot_star2_clean.webp",
        star3: "magic-cat-mascot_star3_clean.webp"
      };

      const images = {};
      const sprites = {};
      Object.entries(imageSources).forEach(([key, file]) => {
        images[key] = new Image();
        images[key].addEventListener("load", () => processSprite(key, images[key]), { once: true });
        images[key].src = assetBase + file;
      });

      const state = {
        width: 0,
        height: 0,
        dpr: 1,
        time: 0,
        lastFrame: performance.now(),
        running: true,
        mode: "idle",
        score: 0,
        best: 0,
        combo: 0,
        comboTimer: 0,
        comboMultiplier: 1,
        grace: 0,
        lives: 3,
        spawnTimer: 0,
        elapsed: 0,
        minute: 0,
        difficulty: 1,
        effects: {
          speed: 0,
          shield: 0,
          calm: 0
        },
        controlMode: "mouse",
        pointerX: null,
        keys: { left: false, right: false },
        items: [],
        particles: [],
        backgroundStars: []
      };

      const cat = {
        x: 0,
        y: 0,
        width: 132,
        height: 132,
        vx: 0,
        direction: 1,
        movingTime: 0,
        idleTime: 99,
        hurtTime: 0,
        caughtTime: 0
      };

      function processSprite(key, image) {
        const work = document.createElement("canvas");
        const workCtx = work.getContext("2d", { willReadFrequently: true });
        work.width = image.naturalWidth;
        work.height = image.naturalHeight;
        workCtx.drawImage(image, 0, 0);

        const imageData = workCtx.getImageData(0, 0, work.width, work.height);
        const data = imageData.data;
        const width = work.width;
        const height = work.height;
        const visited = new Uint8Array(width * height);
        const queue = [];

        function isBackdrop(index) {
          const offset = index * 4;
          const r = data[offset];
          const g = data[offset + 1];
          const b = data[offset + 2];
          return r > 214 && g > 214 && b > 214 && Math.abs(r - g) < 18 && Math.abs(g - b) < 18;
        }

        function push(x, y) {
          if (x < 0 || y < 0 || x >= width || y >= height) return;
          const index = y * width + x;
          if (visited[index] || !isBackdrop(index)) return;
          visited[index] = 1;
          queue.push(index);
        }

        for (let x = 0; x < width; x += 1) {
          push(x, 0);
          push(x, height - 1);
        }
        for (let y = 1; y < height - 1; y += 1) {
          push(0, y);
          push(width - 1, y);
        }

        for (let cursor = 0; cursor < queue.length; cursor += 1) {
          const index = queue[cursor];
          const x = index % width;
          const y = Math.floor(index / width);
          data[index * 4 + 3] = 0;
          push(x + 1, y);
          push(x - 1, y);
          push(x, y + 1);
          push(x, y - 1);
        }

        workCtx.putImageData(imageData, 0, 0);
        sprites[key] = work;

        document.querySelectorAll(`[data-sprite-preview="${key}"]`).forEach((previewImage) => {
          previewImage.src = work.toDataURL("image/png");
        });
      }

      const itemConfigs = {
        star1: { score: 1, size: 72, weight: 0.62, speed: 170 },
        star2: { score: 5, size: 80, weight: 0.24, speed: 188 },
        star3: { score: 10, size: 90, weight: 0.1, speed: 204 },
        heart: { score: 0, size: 58, weight: 0.055, speed: 168 },
        blackhole: { score: 0, size: 64, weight: 0.16, speed: 196 }
      };

      const variantConfigs = {
        speed: { color: "#ffe260", label: "Speed", duration: 5 },
        shield: { color: "#8ff1ff", label: "Shield", duration: 5 },
        red: { color: "#ff5b69", label: "Clear", duration: 5 },
        double: { color: "#b56cff", label: "x2", duration: 0 }
      };

      function fitCanvas() {
        state.dpr = Math.min(window.devicePixelRatio || 1, 2);
        state.width = window.innerWidth;
        state.height = window.innerHeight;
        canvas.width = Math.floor(state.width * state.dpr);
        canvas.height = Math.floor(state.height * state.dpr);
        canvas.style.width = state.width + "px";
        canvas.style.height = state.height + "px";
        ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
        cat.width = Math.max(108, Math.min(150, state.width * 0.11));
        cat.height = cat.width;
        cat.x = cat.x || state.width * 0.5;
        cat.y = Math.max(160, state.height - Math.max(110, state.height * 0.16));
        cat.x = clamp(cat.x, cat.width * 0.5, state.width - cat.width * 0.5);
        makeBackgroundStars();
      }

      function makeBackgroundStars() {
        state.backgroundStars.length = 0;
        const count = Math.max(44, Math.min(120, Math.floor((state.width * state.height) / 15000)));
        for (let i = 0; i < count; i += 1) {
          state.backgroundStars.push({
            x: Math.random() * state.width,
            y: Math.random() * state.height * 0.78,
            radius: Math.random() * 1.8 + 0.7,
            alpha: Math.random() * 0.54 + 0.22,
            drift: Math.random() * Math.PI * 2,
            color: Math.random() > 0.74 ? "#ffe277" : Math.random() > 0.52 ? "#67dcff" : "#ffffff"
          });
        }
      }

      function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
      }

      function setMode(mode) {
        state.mode = mode;
        body.dataset.gameState = mode;
        pauseButtons.forEach((button) => {
          button.textContent = mode === "paused" ? "Resume" : button.classList.contains("icon-pill") ? "II" : "Pause";
        });
      }

      function updateHud() {
        scoreValue.textContent = state.score;
        bestValue.textContent = state.best;
        comboValue.textContent = "x" + state.comboMultiplier;
        livesValue.textContent = state.lives;
        const active = [];
        if (state.effects.speed > 0) active.push("Speed " + Math.ceil(state.effects.speed));
        if (state.effects.shield > 0) active.push("Shield " + Math.ceil(state.effects.shield));
        if (state.effects.calm > 0) active.push("Clear " + Math.ceil(state.effects.calm));
        effectValue.textContent = active.length ? active.join(" / ") : "None";
      }

      function showToast(message) {
        toast.textContent = message;
        toast.classList.add("is-visible");
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 1450);
      }

      function comboMultiplierFor(combo) {
        if (combo >= 18) return 4;
        if (combo >= 11) return 3;
        if (combo >= 5) return 2;
        return 1;
      }

      function resetCombo() {
        state.combo = 0;
        state.comboTimer = 0;
        state.comboMultiplier = 1;
      }

      function addCombo() {
        state.combo += 1;
        state.comboTimer = 4.4;
        const previousMultiplier = state.comboMultiplier;
        state.comboMultiplier = comboMultiplierFor(state.combo);
        return state.comboMultiplier > previousMultiplier;
      }

      function startGame() {
        state.score = 0;
        state.lives = 3;
        state.spawnTimer = 0.3;
        state.elapsed = 0;
        state.minute = 0;
        state.difficulty = 1;
        resetCombo();
        state.grace = 1.2;
        state.effects.speed = 0;
        state.effects.shield = 0;
        state.effects.calm = 0;
        state.items.length = 0;
        state.particles.length = 0;
        state.pointerX = null;
        state.keys.left = false;
        state.keys.right = false;
        cat.x = state.width * 0.5;
        cat.vx = 0;
        cat.direction = 1;
        cat.idleTime = 99;
        cat.movingTime = 0;
        cat.hurtTime = 0;
        updateHud();
        setMode("playing");
        showToast("Catch stars. Avoid black holes.");
      }

      function gameOver() {
        setMode("gameover");
        state.items.length = 0;
        state.particles.length = 0;
        showToast("Game over. Score " + state.score + ".");
      }

      function resetEphemeralRun() {
        state.score = 0;
        state.best = 0;
        state.lives = 3;
        state.spawnTimer = 0;
        state.elapsed = 0;
        state.minute = 0;
        state.difficulty = 1;
        state.grace = 0;
        resetCombo();
        state.effects.speed = 0;
        state.effects.shield = 0;
        state.effects.calm = 0;
        state.items.length = 0;
        state.particles.length = 0;
        state.pointerX = null;
        state.keys.left = false;
        state.keys.right = false;
        cat.x = state.width * 0.5;
        cat.vx = 0;
        cat.direction = 1;
        cat.hurtTime = 0;
        cat.caughtTime = 0;
        setMode("idle");
        updateHud();
        draw();
      }

      function togglePause() {
        if (state.mode === "idle") {
          startGame();
          return;
        }
        if (state.mode === "gameover") {
          startGame();
          return;
        }
        setMode(state.mode === "paused" ? "playing" : "paused");
      }

      function setTheme(theme) {
        body.dataset.theme = theme;
        themeToggle.textContent = theme === "light" ? "☀" : "☾";
        themeToggle.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
      }

      function toggleTheme() {
        setTheme(body.dataset.theme === "light" ? "dark" : "light");
      }

      function isTouchMode() {
        return window.matchMedia("(pointer: coarse)").matches || state.width <= 920;
      }

      function setControlMode(mode) {
        state.controlMode = mode === "keyboard" ? "keyboard" : "mouse";
        if (state.controlMode === "keyboard") state.pointerX = null;
        controlButtons.forEach((button) => {
          const active = button.dataset.controlMode === state.controlMode;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-pressed", active ? "true" : "false");
        });
      }

      function chooseItemType() {
        const total = Object.values(itemConfigs).reduce((sum, item) => sum + item.weight, 0);
        let pick = Math.random() * total;
        for (const [type, config] of Object.entries(itemConfigs)) {
          pick -= config.weight;
          if (pick <= 0) return type;
        }
        return "star1";
      }

      function spawnItem() {
        let type = chooseItemType();
        const blackHoleLimit = Math.max(2, Math.min(5, Math.floor(1 + state.difficulty)));
        const activeBlackHoles = state.items.filter((item) => item.type === "blackhole").length;
        if (type === "blackhole" && activeBlackHoles >= blackHoleLimit) type = "star1";
        const config = itemConfigs[type];
        const margin = Math.max(46, state.width * 0.055);
        const variant = chooseStarVariant(type);
        state.items.push({
          type,
          variant,
          x: margin + Math.random() * (state.width - margin * 2),
          y: -config.size,
          size: config.size,
          vy: config.speed + Math.random() * 78 + state.difficulty * 18,
          vx: (Math.random() - 0.5) * 24,
          spin: (Math.random() - 0.5) * 2.2,
          angle: Math.random() * Math.PI * 2,
          wobble: Math.random() * Math.PI * 2
        });
      }

      function chooseStarVariant(type) {
        if (!type.startsWith("star")) return null;
        const roll = Math.random();
        if (roll < 0.1) return "speed";
        if (roll < 0.2) return "shield";
        if (roll < 0.3) return "red";
        if (roll < 0.4) return "double";
        return null;
      }

      function spawnHeartNearCat() {
        const config = itemConfigs.heart;
        state.items.push({
          type: "heart",
          variant: null,
          x: clamp(cat.x + (Math.random() - 0.5) * 180, config.size, state.width - config.size),
          y: Math.max(86, cat.y - 300),
          size: config.size,
          vy: config.speed * 0.82,
          vx: (Math.random() - 0.5) * 18,
          spin: (Math.random() - 0.5) * 1.8,
          angle: Math.random() * Math.PI * 2,
          wobble: Math.random() * Math.PI * 2
        });
      }

      function clearDropAroundCat() {
        let removed = 0;
        for (let i = state.items.length - 1; i >= 0; i -= 1) {
          const item = state.items[i];
          if (item.type === "heart") continue;
          const dx = Math.abs(item.x - cat.x);
          const dy = Math.abs(item.y - cat.y);
          if (dx < state.width * 0.34 && dy < state.height * 0.55) {
            createBurst(item.x, item.y, "#ff5b69", 7);
            state.items.splice(i, 1);
            removed += 1;
          }
        }
        return removed;
      }

      function createBurst(x, y, color, amount) {
        const count = Math.min(amount, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 8 : amount);
        for (let i = 0; i < count; i += 1) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 70 + Math.random() * 190;
          state.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 40,
            life: 0.38 + Math.random() * 0.42,
            maxLife: 0.8,
            radius: 2 + Math.random() * 3.5,
            color
          });
        }
      }

      function collectItem(item) {
        if (item.type === "blackhole") {
          if (state.effects.shield > 0 || state.grace > 0) {
            createBurst(item.x, item.y, "#8ff1ff", 18);
            showToast("Shield blocked the black hole.");
            updateHud();
            return;
          }
          state.lives -= 1;
          resetCombo();
          state.grace = 1.15;
          cat.hurtTime = 0.38;
          createBurst(item.x, item.y, "#b36cff", 18);
          updateHud();
          if (state.lives <= 0) {
            gameOver();
          } else {
            showToast("Black hole hit. Life lost.");
          }
          return;
        }

        if (item.type === "heart") {
          state.lives = Math.min(5, state.lives + 1);
          createBurst(item.x, item.y, "#ff8bc2", 16);
          showToast("Heart caught. +1 life.");
        } else {
          const basePoints = itemConfigs[item.type].score;
          const comboLeveled = addCombo();
          const variantMultiplier = item.variant === "double" ? 2 : 1;
          const points = basePoints * variantMultiplier * state.comboMultiplier;
          state.score += points;
          state.best = Math.max(state.best, state.score);
          const variant = item.variant ? variantConfigs[item.variant] : null;
          createBurst(item.x, item.y, variant ? variant.color : item.type === "star3" ? "#ffe277" : "#67dcff", item.type === "star1" ? 12 : 18);
          if (item.variant === "speed") {
            state.effects.speed = variantConfigs.speed.duration;
            showToast("Yellow star: speed boost for 5 seconds.");
          } else if (item.variant === "shield") {
            state.effects.shield = variantConfigs.shield.duration;
            showToast("Shield star: protected for 5 seconds.");
          } else if (item.variant === "red") {
            state.effects.calm = variantConfigs.red.duration;
            const removed = clearDropAroundCat();
            spawnHeartNearCat();
            showToast("Red star: cleared " + removed + " drops and called a heart.");
          } else if (item.variant === "double") {
            showToast("Purple star: double points.");
          } else if (comboLeveled) {
            showToast("Combo x" + state.comboMultiplier + ". Keep the chain alive.");
          }
          cat.caughtTime = 0.18;
        }
        updateHud();
      }

      function itemHitsCat(item) {
        const catchY = cat.y - cat.height * 0.44;
        const dx = Math.abs(item.x - cat.x);
        const dy = Math.abs(item.y - catchY);
        const catchWidth = cat.width * 0.48 + item.size * 0.28;
        const catchHeight = cat.height * 0.2 + item.size * 0.24;
        return dx < catchWidth && dy < catchHeight;
      }

      function update(dt) {
        if (state.mode !== "playing") return;

        state.elapsed += dt;
        const nextMinute = Math.floor(state.elapsed / 60);
        if (nextMinute > state.minute) {
          state.minute = nextMinute;
          showToast("Minute " + (state.minute + 1) + ": the sky gets heavier.");
        }
        state.difficulty = 1 + state.elapsed / 60 * 0.72;
        state.effects.speed = Math.max(0, state.effects.speed - dt);
        state.effects.shield = Math.max(0, state.effects.shield - dt);
        state.effects.calm = Math.max(0, state.effects.calm - dt);
        state.grace = Math.max(0, state.grace - dt);
        if (state.comboTimer > 0) {
          state.comboTimer = Math.max(0, state.comboTimer - dt);
          if (state.comboTimer === 0) resetCombo();
        }

        const speedMultiplier = state.effects.speed > 0 ? 1.45 : 1;
        const maxSpeed = Math.max(520, state.width * 0.62) * speedMultiplier;
        const acceleration = maxSpeed * 7.2;
        let moving = false;

        const keyboardEnabled = state.controlMode === "keyboard" || isTouchMode();
        const pointerEnabled = state.controlMode === "mouse" || isTouchMode();

        if (keyboardEnabled && state.keys.left) {
          cat.vx -= acceleration * dt;
          moving = true;
          cat.direction = -1;
        }

        if (keyboardEnabled && state.keys.right) {
          cat.vx += acceleration * dt;
          moving = true;
          cat.direction = 1;
        }

        if (pointerEnabled && state.pointerX !== null) {
          const delta = state.pointerX - cat.x;
          cat.vx += clamp(delta * 18, -acceleration, acceleration) * dt;
          moving = Math.abs(delta) > 8;
          if (Math.abs(delta) > 8) cat.direction = delta > 0 ? 1 : -1;
        }

        cat.vx *= Math.pow(0.84, dt * 60);
        cat.vx = clamp(cat.vx, -maxSpeed, maxSpeed);
        cat.x += cat.vx * dt;
        cat.x = clamp(cat.x, cat.width * 0.52, state.width - cat.width * 0.52);

        if (moving || Math.abs(cat.vx) > 18) {
          cat.movingTime += dt;
          cat.idleTime = 0;
        } else {
          cat.idleTime += dt;
          cat.movingTime = 0;
        }

        state.spawnTimer -= dt;
        if (state.spawnTimer <= 0) {
          spawnItem();
          const calmMultiplier = state.effects.calm > 0 ? 1.75 : 1;
          const base = Math.max(0.22, 0.82 - state.difficulty * 0.09) * calmMultiplier;
          state.spawnTimer = base * (0.74 + Math.random() * 0.72);
        }

        for (let i = state.items.length - 1; i >= 0; i -= 1) {
          const item = state.items[i];
          const catchY = cat.y - cat.height * 0.44;
          if (item.type !== "blackhole" && item.y < catchY && catchY - item.y < 210) {
            const pull = clamp(1 - Math.abs(item.x - cat.x) / (cat.width * 1.35), 0, 1);
            item.x += (cat.x - item.x) * pull * dt * 1.8;
            item.y += (catchY - item.y) * pull * dt * 0.18;
          }
          item.y += item.vy * dt;
          item.x += (item.vx + Math.sin(state.time * 0.002 + item.wobble) * 18) * dt;
          item.angle += item.spin * dt;
          if (itemHitsCat(item)) {
            state.items.splice(i, 1);
            collectItem(item);
          } else if (item.y > state.height + item.size) {
            if (item.type.startsWith("star") && state.combo > 0) resetCombo();
            state.items.splice(i, 1);
          } else if (item.type === "blackhole" && !item.nearMissed && item.y > catchY + item.size * 0.35) {
            const nearMiss = Math.abs(item.x - cat.x) < cat.width * 0.78;
            if (nearMiss) {
              item.nearMissed = true;
              state.score += 1;
              state.best = Math.max(state.best, state.score);
              createBurst(item.x, catchY, "#8ff1ff", 8);
              showToast("Close dodge. +1");
            }
          }
        }

        for (let i = state.particles.length - 1; i >= 0; i -= 1) {
          const particle = state.particles[i];
          particle.life -= dt;
          particle.x += particle.vx * dt;
          particle.y += particle.vy * dt;
          particle.vy += 220 * dt;
          if (particle.life <= 0) state.particles.splice(i, 1);
        }

        cat.hurtTime = Math.max(0, cat.hurtTime - dt);
        cat.caughtTime = Math.max(0, cat.caughtTime - dt);
        updateHud();
      }

      function drawBackground() {
        const { width, height } = state;
        const light = body.dataset.theme === "light";
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, light ? "#eaf7ff" : "#08162b");
        gradient.addColorStop(0.54, light ? "#cceeff" : "#102a4d");
        gradient.addColorStop(1, light ? "#8fcdea" : "#19507a");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        const moonX = width * 0.72;
        const moonY = height * 0.23;
        const moonR = Math.max(54, Math.min(118, width * 0.075));
        const glow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonR * 2.8);
        glow.addColorStop(0, light ? "rgba(255, 219, 94, 0.42)" : "rgba(255, 232, 150, 0.36)");
        glow.addColorStop(0.42, light ? "rgba(20, 166, 211, 0.14)" : "rgba(103, 220, 255, 0.12)");
        glow.addColorStop(1, "rgba(103, 220, 255, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonR * 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = light ? "rgba(255, 199, 72, 0.7)" : "rgba(255, 226, 119, 0.72)";
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.strokeStyle = light ? "rgba(20, 121, 165, 0.16)" : "rgba(141, 215, 235, 0.17)";
        ctx.lineWidth = Math.max(18, width * 0.014);
        ctx.lineCap = "round";
        for (let i = 0; i < 5; i += 1) {
          const startX = -width * 0.2 + i * width * 0.32;
          const startY = height * (0.2 + i * 0.105);
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.bezierCurveTo(startX + width * 0.2, startY - 90, startX + width * 0.38, startY + 150, startX + width * 0.65, startY + 30);
          ctx.stroke();
        }
        ctx.restore();

        for (const star of state.backgroundStars) {
          const alpha = star.alpha * (0.65 + Math.sin(state.time * 0.002 + star.drift) * 0.28);
          ctx.globalAlpha = clamp(alpha, 0.08, 0.9);
          drawSpark(star.x, star.y, star.radius * 3.2, star.color);
        }
        ctx.globalAlpha = 1;

        drawGround();
      }

      function drawGround() {
        const light = body.dataset.theme === "light";
        const y = state.height * 0.78;
        const layers = light
          ? [
            ["rgba(91, 196, 220, 0.28)", 0, 38, 0.0013],
            ["rgba(33, 142, 181, 0.26)", 34, 28, 0.0018],
            ["rgba(255, 255, 255, 0.4)", 72, 42, 0.0011]
          ]
          : [
            ["rgba(103, 220, 255, 0.2)", 0, 38, 0.0013],
            ["rgba(77, 179, 215, 0.32)", 34, 28, 0.0018],
            ["rgba(8, 20, 38, 0.45)", 72, 42, 0.0011]
          ];
        for (const [color, offset, amp, speed] of layers) {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(0, y + offset);
          for (let x = 0; x <= state.width + 26; x += 26) {
            const wave = Math.sin(x * 0.008 + state.time * speed) * amp + Math.cos(x * 0.004 + state.time * speed * 1.8) * amp * 0.42;
            ctx.lineTo(x, y + offset + wave);
          }
          ctx.lineTo(state.width, state.height);
          ctx.lineTo(0, state.height);
          ctx.closePath();
          ctx.fill();
        }
      }

      function drawSpark(x, y, size, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size * 0.26, y - size * 0.26);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x + size * 0.26, y + size * 0.26);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x - size * 0.26, y + size * 0.26);
        ctx.lineTo(x - size, y);
        ctx.lineTo(x - size * 0.26, y - size * 0.26);
        ctx.closePath();
        ctx.fill();
      }

      function drawItems() {
        for (const item of state.items) {
          const img = sprites[item.type] || images[item.type];
          const variant = item.variant ? variantConfigs[item.variant] : null;
          const glowColor = item.type === "blackhole" ? "#b36cff" : variant ? variant.color : item.type === "star3" ? "#ffe277" : item.type === "heart" ? "#ff8bc2" : "#67dcff";
          ctx.save();
          ctx.globalAlpha = item.type === "blackhole" ? 0.42 : 0.24;
          const tail = ctx.createLinearGradient(item.x, item.y - item.size * 1.45, item.x, item.y + item.size * 0.25);
          tail.addColorStop(0, "rgba(255, 255, 255, 0)");
          tail.addColorStop(1, glowColor);
          ctx.fillStyle = tail;
          ctx.beginPath();
          ctx.ellipse(item.x, item.y - item.size * 0.44, item.size * 0.18, item.size * 0.86, 0, 0, Math.PI * 2);
          ctx.fill();
          if (item.type === "blackhole") {
            ctx.globalAlpha = 0.52 + Math.sin(state.time * 0.014 + item.wobble) * 0.18;
            ctx.strokeStyle = "rgba(179, 108, 255, 0.72)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(item.x, item.y, item.size * 0.58 + Math.sin(state.time * 0.011) * 7, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.restore();
          ctx.save();
          ctx.translate(item.x, item.y);
          ctx.rotate(item.angle);
          ctx.shadowColor = item.type === "blackhole" ? "rgba(179, 108, 255, 0.55)" : variant ? variant.color : "rgba(103, 220, 255, 0.38)";
          ctx.shadowBlur = item.type === "blackhole" || variant ? 28 : 18;
          ctx.drawImage(img, -item.size * 0.5, -item.size * 0.5, item.size, item.size);
          if (variant) {
            ctx.globalCompositeOperation = "source-atop";
            ctx.globalAlpha = 0.36;
            ctx.fillStyle = variant.color;
            ctx.fillRect(-item.size * 0.5, -item.size * 0.5, item.size, item.size);
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = 1;
            ctx.strokeStyle = variant.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, item.size * 0.48 + Math.sin(state.time * 0.012) * 3, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.restore();
        }

        for (const particle of state.particles) {
          ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      function currentCatImage() {
        if (cat.idleTime > 1 || Math.abs(cat.vx) < 18 || state.mode !== "playing") return sprites.stay || images.stay;
        const frame = Math.floor(cat.movingTime * 12) % 4;
        return [
          sprites.step1 || images.step1,
          sprites.step2 || images.step2,
          sprites.step3 || images.step3,
          sprites.step4 || images.step4
        ][frame];
      }

      function drawCat() {
        const bob = state.mode === "playing" ? Math.sin(state.time * 0.012) * 2 : Math.sin(state.time * 0.004) * 6;
        const hurtShake = cat.hurtTime > 0 ? Math.sin(state.time * 0.08) * 8 : 0;
        const img = currentCatImage();
        ctx.save();
        ctx.translate(cat.x + hurtShake, cat.y + bob);
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = "#67dcff";
        ctx.beginPath();
        ctx.ellipse(0, cat.height * 0.39, cat.width * 0.34, cat.height * 0.075, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        if (state.effects.shield > 0) {
          ctx.strokeStyle = "rgba(143, 241, 255, 0.82)";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, -cat.height * 0.12, cat.width * 0.55 + Math.sin(state.time * 0.012) * 5, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (state.effects.speed > 0) {
          ctx.fillStyle = "rgba(255, 226, 96, 0.24)";
          ctx.beginPath();
          ctx.ellipse(-cat.direction * cat.width * 0.34, cat.height * 0.12, cat.width * 0.24, cat.height * 0.08, -cat.direction * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
        if (cat.direction < 0) ctx.scale(-1, 1);
        ctx.shadowColor = "rgba(0, 0, 0, 0.38)";
        ctx.shadowBlur = 22;
        ctx.shadowOffsetY = 18;
        if (state.grace > 0 && Math.floor(state.time / 90) % 2 === 0) ctx.globalAlpha = 0.62;
        ctx.drawImage(img, -cat.width * 0.5, -cat.height * 0.68, cat.width, cat.height);
        ctx.restore();
      }

      function drawOverlayText() {
        if (state.mode !== "paused" && state.mode !== "gameover") return;
        ctx.save();
        ctx.fillStyle = "rgba(5, 12, 25, 0.48)";
        ctx.fillRect(0, 0, state.width, state.height);
        ctx.fillStyle = "#f5fbff";
        ctx.textAlign = "center";
        ctx.font = "900 " + Math.max(34, Math.min(64, state.width * 0.055)) + "px system-ui, sans-serif";
        ctx.fillText(state.mode === "paused" ? "Paused" : "Game Over", state.width * 0.5, state.height * 0.48);
        ctx.font = "800 16px system-ui, sans-serif";
        ctx.fillStyle = "#b9d0df";
        const detail = state.mode === "gameover" ? "Score " + state.score + " / run best " + state.best : "Press Space or Start to continue";
        ctx.fillText(detail, state.width * 0.5, state.height * 0.48 + 38);
        if (state.mode === "gameover") ctx.fillText("Close the page and this run is forgotten.", state.width * 0.5, state.height * 0.48 + 64);
        ctx.restore();
      }

      function draw() {
        drawBackground();
        drawItems();
        if (state.mode !== "idle") drawCat();
        drawOverlayText();
      }

      function frame(now) {
        const dt = clamp((now - state.lastFrame) / 1000, 0.001, 0.033);
        state.lastFrame = now;
        state.time += dt * 1000;
        update(dt);
        draw();
        if (state.running) requestAnimationFrame(frame);
      }

      function pointerMove(event) {
        if (state.mode !== "playing") return;
        if (state.controlMode !== "mouse" && !isTouchMode()) return;
        state.pointerX = event.clientX;
      }

      function pointerEnd() {
        state.pointerX = null;
      }

      function keyDown(event) {
        const key = event.key.toLowerCase();
        if ([" ", "a", "d", "arrowleft", "arrowright"].includes(key)) event.preventDefault();
        if (key === " ") {
          if (state.mode === "playing" || state.mode === "paused") {
            togglePause();
          } else {
            startGame();
          }
          return;
        }
        if (key === "p") togglePause();
        if (key === "t") toggleTheme();
        if (key === "a" || key === "arrowleft") state.keys.left = true;
        if (key === "d" || key === "arrowright") state.keys.right = true;
      }

      function keyUp(event) {
        const key = event.key.toLowerCase();
        if (key === "a" || key === "arrowleft") state.keys.left = false;
        if (key === "d" || key === "arrowright") state.keys.right = false;
      }

      startButtons.forEach((button) => button.addEventListener("click", startGame));
      pauseButtons.forEach((button) => button.addEventListener("click", togglePause));
      controlButtons.forEach((button) => {
        button.addEventListener("click", () => setControlMode(button.dataset.controlMode));
      });
      themeToggle.addEventListener("click", toggleTheme);
      window.addEventListener("resize", fitCanvas);
      window.addEventListener("pointerdown", pointerMove, { passive: true });
      window.addEventListener("pointermove", pointerMove, { passive: true });
      window.addEventListener("pointerup", pointerEnd, { passive: true });
      window.addEventListener("pointercancel", pointerEnd, { passive: true });
      window.addEventListener("keydown", keyDown, { passive: false });
      window.addEventListener("keyup", keyUp, { passive: true });

      leftTouch.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        state.keys.left = true;
      });
      leftTouch.addEventListener("pointerup", () => {
        state.keys.left = false;
      });
      leftTouch.addEventListener("pointercancel", () => {
        state.keys.left = false;
      });
      rightTouch.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        state.keys.right = true;
      });
      rightTouch.addEventListener("pointerup", () => {
        state.keys.right = false;
      });
      rightTouch.addEventListener("pointercancel", () => {
        state.keys.right = false;
      });

      document.addEventListener("visibilitychange", () => {
        if (document.hidden && state.mode === "playing") setMode("paused");
      });
      window.addEventListener("pagehide", resetEphemeralRun);
      window.addEventListener("pageshow", (event) => {
        if (event.persisted) resetEphemeralRun();
      });

      fitCanvas();
      const themeParam = new URLSearchParams(window.location.search).get("theme");
      setTheme(themeParam === "light" || themeParam === "dark" ? themeParam : body.dataset.theme || "dark");
      setControlMode(state.controlMode);
      updateHud();
      draw();
      requestAnimationFrame(frame);
    })();
