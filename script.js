// ================== Utilities ==================
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = matchMedia("(hover: none), (pointer: coarse)").matches;

// iOS 100vh fix
const setVH = () => document.documentElement.style.setProperty("--vh", (window.innerHeight * 0.01) + "px");
setVH();
addEventListener("resize", setVH);
addEventListener("orientationchange", () => setTimeout(setVH, 100));

// Block pinch + double-tap zoom
addEventListener("gesturestart", (e) => e.preventDefault());
addEventListener("dblclick", (e) => {
    if (e.target.closest("button, #envelope-container")) e.preventDefault();
});

// ================== Mood data ==================
// Each mood has a carousel of slides + music pattern
const MOODS = {
    happy: {
        color: "#e86a92",
        tempo: 0.28,
        notes: [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25],
        slides: [
            { img: "hi-paw.jpg",       title: "Vui thật hả em",       text: "Giữ lại khoảnh khắc này. Không phải ngày nào cũng có." },
            { img: "happy-hearts.jpg", title: "Xinh quá",              text: "Niềm vui của em đáng giá hơn em nghĩ." },
            { img: "heart-offer.jpg",  title: "Cho em này",            text: "Một phần nhỏ anh gửi em. Giữ kỹ nha." },
        ],
    },
    excited: {
        color: "#c64c74",
        tempo: 0.22,
        notes: [659.25, 783.99, 987.77, 1046.5, 1174.66, 1046.5, 987.77, 783.99],
        slides: [
            { img: "cat_dance.gif",    title: "Năng lượng xịn đó",      text: "Thấy em vậy là anh cũng lây theo rồi." },
            { img: "flower-gift.jpg",  title: "Cho em nè",              text: "Một bó — cho một ngày đẹp của em." },
            { img: "thuong-lam.jpg",   title: "Thương em",              text: "Giữ cái mood này, mai tính tiếp." },
        ],
    },
    normal: {
        color: "#e86a92",
        tempo: 0.34,
        notes: [523.25, 587.33, 659.25, 783.99, 659.25, 587.33],
        slides: [
            { img: "bleh.jpg",         title: "Bình thường cũng ổn",    text: "Không phải lúc nào cũng phải rực rỡ mới đáng." },
            { img: "flower-gift.jpg",  title: "Có hoa nè",              text: "Để ngày thường thơm hơn một chút." },
            { img: "bouquet.jpg",      title: "Cho em xứng đáng",       text: "Kể cả những ngày không có gì đặc biệt." },
        ],
    },
    sad: {
        color: "#9a5f7a",
        tempo: 0.44,
        notes: [440, 392, 349.23, 329.63, 349.23, 392],
        slides: [
            { img: "hug.jpg",          title: "Lại đây anh ôm cái",     text: "Buồn một chút cũng không sao. Không phải lỗi của em." },
            { img: "cat_heart.gif",    title: "Anh đây",                 text: "Thở một hơi dài rồi kể anh nghe, nếu em muốn." },
            { img: "thuong-lam.jpg",   title: "Thương em",              text: "Em không cần đi qua cái này một mình." },
        ],
    },
    tired: {
        color: "#8a6f9e",
        tempo: 0.52,
        notes: [523.25, 493.88, 440, 392, 440, 493.88],
        slides: [
            { img: "hug.jpg",          title: "Nghỉ đi em",             text: "Mệt thì dừng. Em không cần giải thích với ai." },
            { img: "cat_heart.gif",    title: "Nhắm mắt chút",           text: "Nghe nhạc thôi, không cần làm gì cả." },
            { img: "bouquet.jpg",      title: "Mai tính tiếp",           text: "Hôm nay em tồn tại là đã đủ." },
        ],
    },
};

// ================== Scene order (progress bar) ==================
const SCENE_ORDER = ["envelope","greeting","mood","gift","feelingCheck","smug","reminders","love"];
const progressEl = $("#progress");
SCENE_ORDER.slice(1).forEach(() => {
    const d = document.createElement("div");
    d.className = "p";
    progressEl.appendChild(d);
});

function updateProgress(scene) {
    const idx = SCENE_ORDER.indexOf(scene);
    $$("#progress .p").forEach((el, i) => {
        el.classList.remove("active", "done");
        if (i + 1 < idx) el.classList.add("done");
        else if (i + 1 === idx) el.classList.add("active");
    });
}

// ================== Scene transitions ==================
let currentScene = "envelope";
async function goTo(scene) {
    if (scene === currentScene) return;
    const cur = $(`.scene[data-scene="${currentScene}"]`);
    const next = $(`.scene[data-scene="${scene}"]`);
    if (!next) return;
    cur.classList.remove("active");
    await new Promise(r => setTimeout(r, 280));
    next.classList.add("active");
    currentScene = scene;
    if (scene !== "envelope") document.body.classList.add("started");
    updateProgress(scene);
    onSceneEnter(scene);
}

function onSceneEnter(scene) {
    if (scene === "mood") {
        stopMelody();
        playMelody([659.25, 783.99, 1046.5], 0.25, false);
    }
    if (scene === "feelingCheck") {
        fcNoAttempts = 0;
        resetNoBtn();
    }
    if (scene === "smug") {
        playMelody([523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5], 0.18, false);
        setTimeout(() => smallConfetti(80), 200);
    }
    if (scene === "reminders") {
        playMelody([523.25, 587.33, 659.25, 783.99], 0.3, false);
    }
    if (scene === "love") {
        launchConfetti();
        playMelody([523.25, 659.25, 783.99, 1046.5, 987.77, 783.99, 659.25, 523.25], 0.3, true);
    }
}

// Wire data-go buttons
$$("[data-go]").forEach(b => b.addEventListener("click", () => {
    resumeAudio();
    goTo(b.dataset.go);
}));

// ================== 1. Envelope ==================
const envelope = $("#envelope-container");
function openEnvelope() {
    if (envelope.classList.contains("opening")) return;
    envelope.classList.add("opening");
    resumeAudio();
    playTone(660, 0.12);
    setTimeout(() => {
        playTone(880, 0.18);
        goTo("greeting");
    }, 420);
}
envelope.addEventListener("click", openEnvelope);
envelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEnvelope(); }
});

// ================== 3. Mood pick -> 4. Gift ==================
let currentMood = null;
let giftIdx = 0;

$$(".mood-btn").forEach(btn => btn.addEventListener("click", () => {
    currentMood = btn.dataset.mood;
    giftIdx = 0;
    const m = MOODS[currentMood];
    document.documentElement.style.setProperty("--pink-4", m.color);
    stopMelody();
    playMelody(m.notes, m.tempo, true);
    goTo("gift");
    renderGift();
}));

function renderGift() {
    const m = MOODS[currentMood];
    const slide = m.slides[giftIdx];
    $("#gift-img").src = slide.img;
    $("#gift-img").classList.remove("round");
    if (slide.img.endsWith(".gif") || slide.img === "hug.jpg") $("#gift-img").classList.add("round");
    $("#gift-title").textContent = slide.title;
    $("#gift-text").textContent = slide.text;

    // dots
    const dots = $("#gift-dots");
    dots.innerHTML = "";
    m.slides.forEach((_, i) => {
        const d = document.createElement("div");
        d.className = "dot" + (i === giftIdx ? " active" : "");
        dots.appendChild(d);
    });

    // CTA text
    const next = $("#gift-next");
    next.textContent = (giftIdx < m.slides.length - 1) ? "Tiếp ♥" : "Anh hỏi bé xíu →";

    // heart burst ambient
    spawnHeart(); spawnHeart();
    playTone(m.notes[giftIdx % m.notes.length], 0.18, "triangle", 0.09);
}

$("#gift-next").addEventListener("click", () => {
    const m = MOODS[currentMood];
    if (giftIdx < m.slides.length - 1) {
        giftIdx++;
        renderGift();
    } else {
        goTo("feelingCheck");
    }
});

// ================== 5. Feeling check ==================
// Yes -> smug; No -> chaos linh tinh then FORCE smug (good ending)
const noBtn = $("#fc-no");
const fcTitle = $("#fc-title");
let fcNoAttempts = 0;
const noTexts = ["Chưa", "ờm", "vẫn chưa", "hmm", "chắc chưa"];
const noTitles = [
    "Thật hả em?",
    "Để anh thử tiếp",
    "Một cái nữa nha",
    "Anh không bỏ cuộc đâu",
];

function resetNoBtn() {
    noBtn.style.position = "";
    noBtn.style.transform = "";
    noBtn.style.left = "";
    noBtn.style.top = "";
    noBtn.textContent = "Chưa";
    fcTitle.textContent = "Em thấy nhẹ hơn chưa?";
    document.body.classList.remove("chaos");
}

function escapeNo() {
    const rect = noBtn.getBoundingClientRect();
    const pad = 14;
    const maxX = Math.max(pad, innerWidth - rect.width - pad);
    const maxY = Math.max(pad, innerHeight - rect.height - pad);
    const tx = pad + Math.random() * (maxX - pad);
    const ty = pad + Math.random() * (maxY - pad);
    noBtn.style.position = "fixed";
    noBtn.style.left = "0px";
    noBtn.style.top = "0px";
    noBtn.style.transform = `translate(${tx}px, ${ty}px)`;
    noBtn.textContent = noTexts[Math.min(fcNoAttempts, noTexts.length - 1)];
    fcTitle.textContent = noTitles[Math.min(fcNoAttempts, noTitles.length - 1)];
    playTone(220 + fcNoAttempts * 40, 0.08);
}

function chaosThenEnd() {
    document.body.classList.add("chaos");
    for (let i = 0; i < 25; i++) setTimeout(spawnHeart, i * 40);
    smallConfetti(120);
    fcTitle.textContent = "Rồi, anh biết rồi.";
    setTimeout(() => {
        document.body.classList.remove("chaos");
        goTo("smug");
    }, 1600);
}

// Proximity dodge on desktop
function onPointerMoveFC(e) {
    if (currentScene !== "feelingCheck") return;
    const r = noBtn.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    const d = Math.hypot(e.clientX - cx, e.clientY - cy);
    if (d < Math.max(80, r.width * 0.9)) {
        fcNoAttempts++;
        if (fcNoAttempts >= 4) return chaosThenEnd();
        escapeNo();
    }
}
addEventListener("pointermove", onPointerMoveFC, { passive: true });

noBtn.addEventListener("click", (e) => {
    e.preventDefault();
    fcNoAttempts++;
    if (fcNoAttempts >= 4) return chaosThenEnd();
    escapeNo();
});
noBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    fcNoAttempts++;
    if (fcNoAttempts >= 4) return chaosThenEnd();
    escapeNo();
}, { passive: false });

// ================== Floating hearts ==================
const heartsBg = $("#hearts-bg");
const heartGlyphs = ["♥", "♡", "❣", "🌸", "🌻"];
let heartTimer = null;

function spawnHeart() {
    if (document.hidden) return;
    const h = document.createElement("span");
    h.className = "float-heart";
    h.textContent = heartGlyphs[Math.floor(Math.random() * heartGlyphs.length)];
    const size = 14 + Math.random() * 28;
    h.style.fontSize = size + "px";
    h.style.left = Math.random() * 100 + "vw";
    h.style.setProperty("--dx", (Math.random() * 120 - 60) + "px");
    const dur = 6 + Math.random() * 6;
    h.style.animationDuration = dur + "s";
    h.style.opacity = 0.5 + Math.random() * 0.5;
    heartsBg.appendChild(h);
    setTimeout(() => h.remove(), dur * 1000 + 200);
}
function startHearts() {
    if (reduceMotion || heartTimer) return;
    heartTimer = setInterval(spawnHeart, 400);
    for (let i = 0; i < 8; i++) setTimeout(spawnHeart, i * 200);
}
function stopHearts() { if (heartTimer) { clearInterval(heartTimer); heartTimer = null; } }
document.addEventListener("visibilitychange", () => { if (document.hidden) stopHearts(); else startHearts(); });
startHearts();

// ================== Confetti ==================
const confettiCanvas = $("#confetti");
const ctx = confettiCanvas.getContext("2d");
let parts = [], running = false;

function resizeCanvas() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    confettiCanvas.width = innerWidth * dpr;
    confettiCanvas.height = innerHeight * dpr;
    confettiCanvas.style.width = innerWidth + "px";
    confettiCanvas.style.height = innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", resizeCanvas);
resizeCanvas();

function spawnBurst(count) {
    const colors = ["#ff5c8a","#ff8fa3","#ffd1dc","#ffffff","#ffe66d","#ff477e","#f4b400"];
    const shapes = ["heart","rect","circle","star"];
    for (let i = 0; i < count; i++) {
        parts.push({
            x: innerWidth/2 + (Math.random()-0.5)*200,
            y: innerHeight/2 + (Math.random()-0.5)*80,
            vx: (Math.random()-0.5)*10,
            vy: -Math.random()*14 - 6,
            g: 0.28 + Math.random()*0.15,
            size: 6 + Math.random()*10,
            color: colors[Math.floor(Math.random()*colors.length)],
            rot: Math.random()*Math.PI*2,
            vr: (Math.random()-0.5)*0.3,
            life: 180 + Math.random()*120,
            shape: shapes[Math.floor(Math.random()*shapes.length)],
        });
    }
    if (!running) { running = true; requestAnimationFrame(step); }
}
function launchConfetti() { if (!reduceMotion) spawnBurst(isTouch ? 150 : 220); }
function smallConfetti(n) { if (!reduceMotion) spawnBurst(n); }

function drawHeart(x,y,size,color,rot) {
    ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.fillStyle = color;
    ctx.beginPath();
    const s = size/2;
    ctx.moveTo(0, s*0.3);
    ctx.bezierCurveTo(0,-s*0.2,-s,-s*0.2,-s,s*0.3);
    ctx.bezierCurveTo(-s,s*0.8,0,s,0,s*1.2);
    ctx.bezierCurveTo(0,s,s,s*0.8,s,s*0.3);
    ctx.bezierCurveTo(s,-s*0.2,0,-s*0.2,0,s*0.3);
    ctx.fill(); ctx.restore();
}
function drawStar(x,y,size,color,rot){
    ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.fillStyle=color;
    ctx.beginPath();
    for (let i=0;i<5;i++){
        ctx.lineTo(Math.cos((18+i*72)*Math.PI/180)*size, -Math.sin((18+i*72)*Math.PI/180)*size);
        ctx.lineTo(Math.cos((54+i*72)*Math.PI/180)*size*0.45, -Math.sin((54+i*72)*Math.PI/180)*size*0.45);
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
}

function step() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    for (const p of parts) {
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 1;
        if (p.shape === "heart") drawHeart(p.x, p.y, p.size*1.6, p.color, p.rot);
        else if (p.shape === "star") drawStar(p.x, p.y, p.size*0.9, p.color, p.rot);
        else if (p.shape === "rect") {
            ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color;
            ctx.fillRect(-p.size/2, -p.size/3, p.size, p.size/1.5); ctx.restore();
        } else {
            ctx.fillStyle = p.color; ctx.beginPath();
            ctx.arc(p.x, p.y, p.size/2, 0, Math.PI*2); ctx.fill();
        }
    }
    parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 40);
    if (parts.length > 0) requestAnimationFrame(step); else running = false;
}

// ================== WebAudio (tones + melody loop) ==================
let audioCtx = null, muted = false, melodyTimer = null;

function getAudio() {
    if (!audioCtx) {
        try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch (e) { audioCtx = null; }
    }
    return audioCtx;
}
function resumeAudio() {
    const a = getAudio();
    if (a && a.state === "suspended") a.resume().catch(() => {});
}
function playTone(freq, dur=0.15, type="sine", vol=0.07) {
    if (muted) return;
    const a = getAudio(); if (!a) return;
    resumeAudio();
    try {
        const osc = a.createOscillator();
        const gain = a.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = vol;
        osc.connect(gain).connect(a.destination);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
        osc.stop(a.currentTime + dur + 0.02);
    } catch (e) {}
}
function playMelody(notes, tempo=0.3, loop=true) {
    stopMelody();
    let i = 0;
    const tick = () => {
        if (muted) return;
        const n = notes[i % notes.length];
        if (n) playTone(n, tempo * 0.85, "triangle", 0.055);
        i++;
        if (!loop && i >= notes.length) { stopMelody(); return; }
    };
    tick();
    melodyTimer = setInterval(tick, tempo * 1000);
}
function stopMelody() {
    if (melodyTimer) { clearInterval(melodyTimer); melodyTimer = null; }
}

const soundToggle = $("#sound-toggle");
soundToggle.addEventListener("click", () => {
    muted = !muted;
    soundToggle.classList.toggle("muted", muted);
    soundToggle.textContent = muted ? "♪̸" : "♪";
    resumeAudio();
    if (muted) stopMelody();
});

// unlock audio on first interaction (iOS)
const unlockOnce = () => {
    resumeAudio();
    removeEventListener("touchstart", unlockOnce);
    removeEventListener("click", unlockOnce);
};
addEventListener("touchstart", unlockOnce, { passive: true });
addEventListener("click", unlockOnce);

updateProgress("envelope");
