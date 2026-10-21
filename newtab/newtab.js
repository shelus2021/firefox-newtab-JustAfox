"use strict";

const fox = document.querySelector("#fox");
const REST_AFTER_MS = 7000;
const SLEEP_AFTER_MS = 24000;

const state = {
  x: window.innerWidth * 0.5,
  y: window.innerHeight * 0.5,
  targetX: window.innerWidth * 0.5,
  targetY: window.innerHeight * 0.5,
  lastTime: performance.now(),
  pointerSeen: false,
  pointerInside: false,
  idleSince: performance.now(),
  idleMode: "awake",
  waking: false,
  interacting: false,
  turning: false,
  facing: "right",
  pendingFacing: "right",
  pendingFacingSince: 0,
  lastInteraction: -1,
};

const interactions = [
  { className: "interact-scratch", duration: 1320 },
  { className: "interact-curious", duration: 1280 },
  { className: "interact-pounce", duration: 1130 },
  { className: "interact-happy", duration: 1230 },
];

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

function bodyRadii() {
  const rect = fox.getBoundingClientRect();
  return { x: rect.width * 0.47, y: rect.height * 0.4 };
}

function keepInBounds(x, y) {
  const radii = bodyRadii();
  return {
    x: clamp(x, radii.x, window.innerWidth - radii.x),
    y: clamp(y, radii.y, window.innerHeight - radii.y),
  };
}

function relativeToBody(x, y) {
  const dx = x - state.x;
  const dy = y - state.y;
  const radii = bodyRadii();
  return { dx, dy, normalizedDistance: Math.hypot(dx / radii.x, dy / radii.y) };
}

function chooseInteraction() {
  let index = Math.floor(Math.random() * interactions.length);
  if (index === state.lastInteraction) index = (index + 1) % interactions.length;
  state.lastInteraction = index;
  return interactions[index];
}

function playInteraction() {
  if (state.interacting || state.turning || state.waking || state.idleMode !== "awake") return;
  state.interacting = true;
  fox.classList.remove("is-running");
  const interaction = chooseInteraction();
  fox.classList.add(interaction.className);
  window.setTimeout(() => {
    fox.classList.remove(interaction.className);
    state.interacting = false;
  }, interaction.duration);
}

function beginTurn(facing) {
  if (state.turning || state.interacting || state.waking || state.idleMode !== "awake" || facing === state.facing) return;
  state.turning = true;
  state.facing = facing;
  fox.classList.add("is-turning");
  fox.dataset.facing = facing;
  window.setTimeout(() => {
    fox.classList.remove("is-turning");
    state.turning = false;
  }, 540);
}

function considerTurning(dx, now) {
  const desired = dx < 0 ? "left" : "right";
  if (desired === state.facing) {
    state.pendingFacing = desired;
    state.pendingFacingSince = now;
    return;
  }
  if (desired !== state.pendingFacing) {
    state.pendingFacing = desired;
    state.pendingFacingSince = now;
    return;
  }
  if (now - state.pendingFacingSince >= 110) beginTurn(desired);
}

function setTarget(event) {
  state.pointerInside = true;
  state.idleSince = performance.now();
  wakeFox();
  const target = keepInBounds(event.clientX, event.clientY);
  state.targetX = target.x;
  state.targetY = target.y;
  state.pointerSeen = true;
}

function lieDown() {
  if (state.idleMode !== "awake" || state.waking) return;
  state.idleMode = "resting";
  fox.classList.remove("is-running", "is-turning");
  fox.classList.add("is-resting");
}

function fallAsleep() {
  if (state.idleMode === "sleeping" || state.waking) return;
  if (state.idleMode === "awake") lieDown();
  state.idleMode = "sleeping";
  fox.classList.add("is-sleeping");
}

function wakeFox() {
  if (state.idleMode === "awake") return;
  state.idleMode = "awake";
  state.waking = true;
  fox.classList.remove("is-resting", "is-sleeping");
  fox.classList.add("is-waking");
  window.setTimeout(() => {
    fox.classList.remove("is-waking");
    state.waking = false;
  }, 760);
}

function markPointerAbsent() {
  if (!state.pointerInside) return;
  state.pointerInside = false;
  state.idleSince = performance.now();
  fox.classList.remove("is-running");
}

function updateIdle(now) {
  if (state.interacting || state.turning || state.waking) return;
  const idleFor = now - state.idleSince;
  if (idleFor >= SLEEP_AFTER_MS) fallAsleep();
  else if (idleFor >= REST_AFTER_MS) lieDown();
}

function animate(now) {
  const dt = Math.min((now - state.lastTime) / 1000, 0.05);
  state.lastTime = now;
  updateIdle(now);

  if (!state.interacting && !state.waking && state.idleMode === "awake" && state.pointerInside && state.pointerSeen) {
    const { dx, dy, normalizedDistance } = relativeToBody(state.targetX, state.targetY);
    if (normalizedDistance > 1.015) {
      const distance = Math.hypot(dx, dy);
      const overflowRatio = 1 - 1 / normalizedDistance;
      const overflowX = dx * overflowRatio;
      const overflowY = dy * overflowRatio;
      const overflowDistance = Math.hypot(overflowX, overflowY);
      const speed = Math.min(305, 72 + overflowDistance * 1.05);
      const step = Math.min(overflowDistance, speed * (state.turning ? 0.32 : 1) * dt);
      if (distance > 0 && step > 0) {
        state.x += (dx / distance) * step;
        state.y += (dy / distance) * step;
      }
      const cycle = Math.round(clamp(520 - speed * 0.84, 255, 455));
      fox.style.setProperty("--run-cycle", `${cycle}ms`);
      fox.classList.add("is-running");
      if (Math.abs(dx) > bodyRadii().x * 0.3) considerTurning(dx, now);
    } else {
      fox.classList.remove("is-running");
      state.pendingFacing = state.facing;
      state.pendingFacingSince = now;
    }
  }

  fox.style.left = `${state.x}px`;
  fox.style.top = `${state.y}px`;
  requestAnimationFrame(animate);
}

window.addEventListener("pointermove", setTarget, { passive: true });
window.addEventListener("pointerdown", (event) => {
  state.pointerInside = true;
  state.idleSince = performance.now();
  wakeFox();
  if (relativeToBody(event.clientX, event.clientY).normalizedDistance <= 1) playInteraction();
});
document.documentElement.addEventListener("pointerleave", markPointerAbsent);
window.addEventListener("blur", markPointerAbsent);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) markPointerAbsent();
});
window.addEventListener("resize", () => {
  const target = keepInBounds(state.targetX, state.targetY);
  state.targetX = target.x;
  state.targetY = target.y;
  const position = keepInBounds(state.x, state.y);
  state.x = position.x;
  state.y = position.y;
});
fox.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    if (state.idleMode !== "awake") wakeFox();
    else playInteraction();
  }
});

requestAnimationFrame(animate);
