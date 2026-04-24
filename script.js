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
// Each mood has a carousel of slides + a background song + synth melody.
// Song mapping: upbeat moods → "anh-biet", comfort moods → "vuong".
// Swap the `song` field to rebalance without touching the player.
const MOODS = {
    happy: {
        color: "#ff8fb0",
        tempo: 0.26,
        song: "anh-biet",
        notes: [523.25, 659.25, 783.99, 1046.5, 987.77, 1046.5, 783.99, 659.25],
        slides: [
            { img: "hi-paw.jpg",       title: "Vui ghê đó",             text: "Giữ lấy cảm giác này đi. Không phải ngày nào cũng có đâu nha." },
            { img: "happy-hearts.jpg", title: "Em cười xinh thật",      text: "Anh nói thiệt đó, không phải khen lấy lòng đâu." },
            { img: "heart-offer.jpg",  title: "Anh gửi em cái này",     text: "Thêm một miếng vui nữa — để ngày em đẹp gấp đôi." },
        ],
    },
    excited: {
        color: "#ef6f93",
        tempo: 0.2,
        song: "anh-biet",
        notes: [659.25, 783.99, 987.77, 1174.66, 1318.51, 1174.66, 987.77, 783.99],
        slides: [
            { img: "cat_dance.gif",    title: "Năng lượng xịn ghê",     text: "Thấy em vậy là anh cũng lây theo luôn rồi." },
            { img: "flower-gift.jpg",  title: "Tặng em bó này",         text: "Ngày đẹp phải có hoa mới đủ bộ chứ." },
            { img: "thuong-lam.jpg",   title: "Thương em bể trời",      text: "Giữ cái vibe này nha em, mai tính tiếp." },
        ],
    },
    normal: {
        color: "#ff8fb0",
        tempo: 0.34,
        song: "anh-biet",
        notes: [523.25, 587.33, 659.25, 783.99, 880, 783.99, 659.25, 587.33],
        slides: [
            { img: "bleh.jpg",         title: "Bình thường cũng đáng",  text: "Không phải ngày nào cũng cần rực rỡ đâu em. Vậy là ổn rồi." },
            { img: "flower-gift.jpg",  title: "Có hoa cho em nè",       text: "Để ngày thường của em thơm hơn một chút." },
            { img: "bouquet.jpg",      title: "Em xứng đáng mà",        text: "Kể cả những ngày chẳng có gì đặc biệt — vẫn xứng." },
        ],
    },
    sad: {
        color: "#c994c4",
        tempo: 0.44,
        song: "vuong",
        notes: [440, 392, 349.23, 329.63, 349.23, 392, 440, 493.88],
        slides: [
            { img: "hug.jpg",          title: "Lại đây anh ôm cái",     text: "Buồn một chút cũng không sao đâu. Không phải lỗi của em." },
            { img: "cat_heart.gif",    title: "Anh ở đây này",          text: "Thở một hơi sâu đi. Rồi kể anh nghe, nếu em muốn." },
            { img: "thuong-lam.jpg",   title: "Thương em lắm",          text: "Em không phải đi qua cái này một mình đâu." },
        ],
    },
    tired: {
        color: "#b39bd8",
        tempo: 0.5,
        song: "vuong",
        notes: [523.25, 493.88, 440, 392, 440, 493.88, 523.25, 587.33],
        slides: [
            { img: "hug.jpg",          title: "Nghỉ đi em",             text: "Mệt thì dừng lại thôi. Em không cần giải thích với ai cả." },
            { img: "cat_heart.gif",    title: "Nhắm mắt chút đi",       text: "Để nhạc chạy nhẹ thôi, em không cần làm gì hết." },
            { img: "bouquet.jpg",      title: "Mai tính tiếp nha",      text: "Giờ chỉ cần thở nhẹ thôi. Em vẫn ổn mà." },
        ],
    },
};

// ================== Preload mood + scene images ==================
// Avoid flicker + layout shift when switching to a scene
const PRELOAD = [
    "hi-paw.jpg", "happy-hearts.jpg", "heart-offer.jpg",
    "cat_dance.gif", "flower-gift.jpg", "thuong-lam.jpg",
    "bleh.jpg", "bouquet.jpg",
    "hug.jpg", "cat_heart.gif",
    "smug.jpg", "love-you.jpg",
];
PRELOAD.forEach(src => { const i = new Image(); i.src = src; });

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
function goTo(scene) {
    if (scene === currentScene) return;
    const cur = $(`.scene[data-scene="${currentScene}"]`);
    const next = $(`.scene[data-scene="${scene}"]`);
    if (!next) return;
    // Crossfade: start both transitions in the same frame for smoothness
    cur.classList.remove("active");
    next.scrollTop = 0;
    requestAnimationFrame(() => next.classList.add("active"));
    currentScene = scene;
    if (scene !== "envelope") document.body.classList.add("started");
    updateProgress(scene);
    onSceneEnter(scene);
}

function onSceneEnter(scene) {
    // Short one-shot synth chords as UI chimes. No looping melody —
    // the mood song (real audio) is the only continuous layer after mood pick,
    // so stacking a synth loop on top makes the mix muddy.
    if (scene === "greeting") {
        playChord([659.25, 783.99, 987.77], 0.35, "triangle", 0.32);
    }
    if (scene === "mood") {
        playChord([523.25, 659.25, 783.99, 1046.5], 0.35, "triangle", 0.32);
    }
    if (scene === "feelingCheck") {
        fcNoAttempts = 0;
        resetNoBtn();
        playChord([587.33, 740, 880], 0.32, "triangle", 0.30);
    }
    if (scene === "smug") {
        playChord([523.25, 659.25, 783.99, 1046.5], 0.28, "triangle", 0.32);
        setTimeout(() => smallConfetti(80), 200);
    }
    if (scene === "reminders") {
        playChord([523.25, 659.25, 783.99], 0.32, "triangle", 0.30);
    }
    if (scene === "love") {
        launchConfetti();
        // Single finale accent over the mood song — low volume so it layers gently.
        playSfx("chime", 0.35);
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
    primeMediaElements();
    // opening sparkle — two arpeggios, spaced so they don't overlap.
    playChord([523.25, 659.25, 783.99, 1046.5], 0.32, "triangle", 0.36);
    setTimeout(() => {
        playChord([783.99, 987.77, 1174.66], 0.38, "triangle", 0.34);
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
    playSong(m.song);
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

    // heart burst ambient — single soft tone so it doesn't fight the song.
    spawnHeart(); spawnHeart();
    playTone(m.notes[giftIdx % m.notes.length], 0.32, "triangle", 0.28);
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

// Proximity dodge on desktop — throttled via rAF to avoid layout thrash
let fcLastX = 0, fcLastY = 0, fcFrameQueued = false;
function fcCheck() {
    fcFrameQueued = false;
    if (currentScene !== "feelingCheck") return;
    const r = noBtn.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const d = Math.hypot(fcLastX - cx, fcLastY - cy);
    if (d < Math.max(80, r.width * 0.9)) {
        fcNoAttempts++;
        if (fcNoAttempts >= 4) return chaosThenEnd();
        escapeNo();
    }
}
function onPointerMoveFC(e) {
    if (currentScene !== "feelingCheck") return;
    fcLastX = e.clientX;
    fcLastY = e.clientY;
    if (!fcFrameQueued) {
        fcFrameQueued = true;
        requestAnimationFrame(fcCheck);
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

// ================== Floating hearts + sparkles ==================
const heartsBg = $("#hearts-bg");
const heartGlyphs = ["♥", "♡", "❣", "🌸", "🌻", "🎀", "💗", "✿"];
const sparkleGlyphs = ["✨", "🌟", "💫", "⋆"];
let heartTimer = null;
// fewer particles on low-powered mobile
const heartInterval = isTouch ? 600 : 400;

function spawnHeart() {
    if (document.hidden) return;
    const isSparkle = Math.random() < 0.28;
    const h = document.createElement("span");
    h.className = "float-heart" + (isSparkle ? " sparkle" : "");
    const glyphs = isSparkle ? sparkleGlyphs : heartGlyphs;
    h.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    const size = 14 + Math.random() * 28;
    h.style.fontSize = size + "px";
    h.style.left = Math.random() * 100 + "vw";
    h.style.setProperty("--dx", (Math.random() * 120 - 60) + "px");
    const dur = 6 + Math.random() * 6;
    h.style.animationDuration = dur + "s";
    h.style.opacity = 0.55 + Math.random() * 0.45;
    heartsBg.appendChild(h);
    setTimeout(() => h.remove(), dur * 1000 + 200);
}
function startHearts() {
    if (reduceMotion || heartTimer) return;
    heartTimer = setInterval(spawnHeart, heartInterval);
    const initialCount = isTouch ? 5 : 8;
    for (let i = 0; i < initialCount; i++) setTimeout(spawnHeart, i * 200);
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
function launchConfetti() { if (!reduceMotion) spawnBurst(isTouch ? 110 : 200); }
function smallConfetti(n) { if (!reduceMotion) spawnBurst(isTouch ? Math.min(n, 70) : n); }

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
let audioCtx = null, masterGain = null, muted = false, melodyTimer = null;
const MASTER_VOL = 0.9;

// Silent looping <audio> element — keeps Safari in media-playback mode
// so WebAudio routes through the media channel (bypasses iOS silent switch).
const mediaUnlock = $("#media-unlock");

function getAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = audioCtx.createGain();
            masterGain.gain.value = MASTER_VOL;
            masterGain.connect(audioCtx.destination);
        } catch (e) { audioCtx = null; masterGain = null; }
    }
    return audioCtx;
}
function resumeAudio() {
    const a = getAudio();
    if (a && a.state === "suspended") a.resume().catch(() => {});
    // Also make sure the silent media element is playing (keeps iOS media session alive)
    if (mediaUnlock && mediaUnlock.paused) mediaUnlock.play().catch(() => {});
}
// Schedule a single tone at an absolute audio-context time
function playToneAt(freq, startAt, dur = 0.35, type = "triangle", vol = 0.42) {
    if (muted) return;
    const a = getAudio(); if (!a || !masterGain) return;
    try {
        const start = startAt !== undefined ? startAt : a.currentTime;
        const osc = a.createOscillator();
        const gain = a.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        const attack = 0.015;
        const release = Math.min(0.18, dur * 0.5);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(vol, start + attack);
        gain.gain.setValueAtTime(vol, Math.max(start + attack, start + dur - release));
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        osc.connect(gain).connect(masterGain);
        osc.start(start);
        osc.stop(start + dur + 0.03);
    } catch (e) {}
}
function playTone(freq, dur, type, vol) { playToneAt(freq, undefined, dur, type, vol); }
// Arpeggio — notes scheduled via AudioContext timeline (not setTimeout) for rock-solid timing on iOS
function playChord(freqs, dur = 0.4, type = "triangle", vol = 0.38, spacing = 0.045) {
    if (muted) return;
    const a = getAudio(); if (!a) return;
    resumeAudio();
    const base = a.currentTime + 0.01;
    freqs.forEach((f, i) => playToneAt(f, base + i * spacing, dur, type, vol));
}
function playMelody(notes, tempo = 0.3, loop = true) {
    stopMelody();
    let i = 0;
    const tick = () => {
        if (muted) return;
        const n = notes[i % notes.length];
        if (n) playTone(n, tempo * 1.1, "triangle", 0.32);
        i++;
        if (!loop && i >= notes.length) { stopMelody(); return; }
    };
    tick();
    melodyTimer = setInterval(tick, tempo * 1000);
}
function stopMelody() {
    if (melodyTimer) { clearInterval(melodyTimer); melodyTimer = null; }
}

// ================== Songs + SFX (HTMLAudioElement layer) ==================
// WebAudio handles chimes/arpeggios; real audio files handle music and
// richer SFX. Kept separate from WebAudio because HTMLAudioElement is more
// reliable for long mp3/m4a playback on iOS and survives tab backgrounding.
const SONGS = {
    "anh-biet": $("#song-anh-biet"),
    "vuong":    $("#song-vuong"),
};
const SFX = {
    envelope: $("#sfx-envelope"),
    pop:      $("#sfx-pop"),
    chime:    $("#sfx-chime"),
    click:    $("#sfx-click"),
};
const SONG_VOL = 0.5;
let currentSongId = null;
let sfxReady = false;

// Smooth volume ramp for <audio> — ~16 fps, plenty for fades.
function fadeAudio(el, target, duration, onDone) {
    if (el._fadeTimer) { clearInterval(el._fadeTimer); el._fadeTimer = null; }
    const start = el.volume;
    const t0 = performance.now();
    el._fadeTimer = setInterval(() => {
        const t = Math.min(1, (performance.now() - t0) / duration);
        el.volume = Math.max(0, Math.min(1, start + (target - start) * t));
        if (t >= 1) {
            clearInterval(el._fadeTimer); el._fadeTimer = null;
            if (onDone) onDone();
        }
    }, 60);
}

function playSong(id) {
    const next = SONGS[id];
    if (!next) return;
    currentSongId = id;
    // Fade out any other song that's currently playing.
    for (const [k, el] of Object.entries(SONGS)) {
        if (k !== id && !el.paused) {
            fadeAudio(el, 0, 600, () => { el.pause(); el.currentTime = 0; });
        }
    }
    if (muted) return;
    if (next.paused) {
        next.volume = 0;
        const p = next.play();
        if (p && p.catch) p.catch(() => {}); // iOS may reject outside gesture
    }
    fadeAudio(next, SONG_VOL, 1000);
}

function stopAllSongs() {
    for (const el of Object.values(SONGS)) {
        if (!el.paused) fadeAudio(el, 0, 400, () => { el.pause(); el.currentTime = 0; });
    }
}

// SFX: rewind-on-replay so rapid triggers don't queue up.
function playSfx(name, vol = 0.7) {
    if (muted) return;
    const el = SFX[name];
    if (!el) return;
    try {
        el.currentTime = 0;
        el.volume = vol;
        const p = el.play();
        if (p && p.catch) p.catch(() => {});
    } catch (e) {}
}

// iOS requires each <audio> to be "unlocked" inside a user gesture before
// later programmatic play() works. Trigger a silent play/pause on each one.
function primeMediaElements() {
    if (sfxReady) return;
    sfxReady = true;
    const els = [...Object.values(SFX), ...Object.values(SONGS)];
    for (const el of els) {
        try {
            el.volume = 0;
            const p = el.play();
            if (p && p.then) {
                p.then(() => { el.pause(); el.currentTime = 0; })
                 .catch(() => {}); // ignored — toggle/next gesture will retry
            }
        } catch (e) {}
    }
}

const soundToggle = $("#sound-toggle");
soundToggle.addEventListener("click", () => {
    muted = !muted;
    soundToggle.classList.toggle("muted", muted);
    soundToggle.textContent = muted ? "♪̸" : "♪";
    resumeAudio();
    primeMediaElements();
    if (muted) {
        stopMelody();
        stopAllSongs();
        if (masterGain) masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
    } else {
        if (masterGain) masterGain.gain.setTargetAtTime(MASTER_VOL, audioCtx.currentTime, 0.05);
        // Resume the mood song if one was picked before mute.
        if (currentSongId) playSong(currentSongId);
        // confirmation ping — confirms audio is really flowing
        playChord([523.25, 659.25, 783.99], 0.32);
    }
});

// Unlock audio + media session on first interaction (iOS / autoplay policies)
// Also plays a silent 1-sample buffer — the classic iOS WebAudio unlock.
const unlockOnce = () => {
    const a = getAudio();
    if (a) {
        try {
            const buf = a.createBuffer(1, 1, 22050);
            const src = a.createBufferSource();
            src.buffer = buf;
            src.connect(a.destination);
            src.start(0);
        } catch (e) {}
        if (a.state === "suspended") a.resume().catch(() => {});
    }
    if (mediaUnlock) {
        mediaUnlock.muted = true;
        mediaUnlock.play().catch(() => {});
    }
    // Unlock every <audio> element while we're still inside the user gesture.
    primeMediaElements();
    removeEventListener("touchstart", unlockOnce);
    removeEventListener("pointerdown", unlockOnce);
    removeEventListener("click", unlockOnce);
    removeEventListener("keydown", unlockOnce);
};
addEventListener("touchstart", unlockOnce, { passive: true });
addEventListener("pointerdown", unlockOnce, { passive: true });
addEventListener("click", unlockOnce);
addEventListener("keydown", unlockOnce);

updateProgress("envelope");
