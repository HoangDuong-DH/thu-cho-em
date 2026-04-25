// ================== App Version ==================
const APP_VERSION = "night-transition-v1";
console.log("App version:", APP_VERSION);

// ================== Utilities ==================
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = matchMedia("(hover: none), (pointer: coarse)").matches;

// iOS 100vh fix
const setVH = () => {
    document.documentElement.style.setProperty("--vh", (window.innerHeight * 0.01) + "px");
};
setVH();
addEventListener("resize", setVH);
addEventListener("orientationchange", () => setTimeout(setVH, 100));

// Block pinch + double-tap zoom
addEventListener("gesturestart", (e) => e.preventDefault());
addEventListener("dblclick", (e) => {
    if (e.target.closest("button, #envelope-container")) e.preventDefault();
});

// ================== Dynamic UI Enhancements ==================
function createMusicStartButton() {
    let btn = $("#music-start");

    if (btn) return btn;

    btn = document.createElement("button");
    btn.id = "music-start";
    btn.type = "button";
    btn.textContent = "Bật nhạc ♪";
    btn.className = "music-start hidden";

    btn.style.position = "fixed";
    btn.style.right = "16px";
    btn.style.bottom = "16px";
    btn.style.zIndex = "9999";
    btn.style.border = "none";
    btn.style.borderRadius = "999px";
    btn.style.padding = "10px 14px";
    btn.style.background = "rgba(255, 143, 176, 0.94)";
    btn.style.color = "#fff";
    btn.style.fontWeight = "700";
    btn.style.fontSize = "14px";
    btn.style.boxShadow = "0 8px 24px rgba(0,0,0,0.18)";
    btn.style.backdropFilter = "blur(8px)";
    btn.style.cursor = "pointer";
    btn.style.display = "none";

    document.body.appendChild(btn);

    return btn;
}

function createVersionBadge() {
    let badge = $("#app-version");

    if (badge) return badge;

    badge = document.createElement("div");
    badge.id = "app-version";
    badge.textContent = APP_VERSION;

    badge.style.position = "fixed";
    badge.style.left = "8px";
    badge.style.bottom = "8px";
    badge.style.zIndex = "9999";
    badge.style.fontSize = "10px";
    badge.style.color = "rgba(0,0,0,0.32)";
    badge.style.pointerEvents = "none";
    badge.style.userSelect = "none";

    document.body.appendChild(badge);

    return badge;
}

const musicStartBtn = createMusicStartButton();
createVersionBadge();

function showMusicStartButton() {
    if (!musicStartBtn) return;
    musicStartBtn.classList.remove("hidden");
    musicStartBtn.style.display = "block";
}

function hideMusicStartButton() {
    if (!musicStartBtn) return;
    musicStartBtn.classList.add("hidden");
    musicStartBtn.style.display = "none";
}

// ================== Mood data ==================
const MOODS = {
    happy: {
        color: "#ff8fb0",
        tempo: 0.26,
        song: "anh-biet",
        notes: [523.25, 659.25, 783.99, 1046.5, 987.77, 1046.5, 783.99, 659.25],
        slides: [
            { img: "hi-paw.jpg",       title: "Vui ghê đó",             text: "Giữ lấy cảm giác này đi. Không phải ngày nào cũng có đâu nha." },
            { img: "happy-hearts.jpg", title: "Một ngày rất xinh",      text: "Có những khoảnh khắc nhỏ nhưng đủ làm ngày hôm nay nhẹ hơn." },
            { img: "heart-offer.jpg",  title: "Một chút vui nữa",       text: "Thêm một miếng vui nhỏ để ngày này dễ thương hơn." },
        ],
    },
    excited: {
        color: "#ef6f93",
        tempo: 0.2,
        song: "anh-biet",
        notes: [659.25, 783.99, 987.77, 1174.66, 1318.51, 1174.66, 987.77, 783.99],
        slides: [
            { img: "cat_dance.gif",    title: "Năng lượng xịn ghê",     text: "Cứ giữ cái vibe này thêm một chút nữa." },
            { img: "flower-gift.jpg",  title: "Tặng một bó hoa",        text: "Ngày đẹp thì nên có thêm một thứ nhỏ xinh đi kèm." },
            { img: "thuong-lam.jpg",   title: "Ổn áp lắm rồi",          text: "Cứ vui như vậy đã, mai tính tiếp." },
        ],
    },
    normal: {
        color: "#ff8fb0",
        tempo: 0.34,
        song: "anh-biet",
        notes: [523.25, 587.33, 659.25, 783.99, 880, 783.99, 659.25, 587.33],
        slides: [
            { img: "bleh.jpg",         title: "Bình thường cũng đáng",  text: "Không phải ngày nào cũng cần rực rỡ. Vậy là ổn rồi." },
            { img: "flower-gift.jpg",  title: "Có hoa nè",              text: "Để ngày thường thơm hơn một chút." },
            { img: "bouquet.jpg",      title: "Vẫn đáng được dịu dàng", text: "Kể cả những ngày chẳng có gì đặc biệt." },
        ],
    },
    sad: {
        color: "#c994c4",
        tempo: 0.44,
        song: "vuong",
        notes: [440, 392, 349.23, 329.63, 349.23, 392, 440, 493.88],
        slides: [
            { img: "hug.jpg",          title: "Nghỉ một chút nha",      text: "Buồn một chút cũng không sao. Cảm xúc đó có thể được đặt xuống từ từ." },
            { img: "cat_heart.gif",    title: "Thở chậm lại",           text: "Một hơi sâu trước đã. Không cần phải ổn ngay lập tức." },
            { img: "thuong-lam.jpg",   title: "Không cần gồng quá",     text: "Đi qua từng chút một cũng được." },
        ],
    },
    tired: {
        color: "#b39bd8",
        tempo: 0.5,
        song: "vuong",
        notes: [523.25, 493.88, 440, 392, 440, 493.88, 523.25, 587.33],
        slides: [
            { img: "hug.jpg",          title: "Nghỉ đi một chút",       text: "Mệt thì dừng lại đã. Không cần giải thích với ai cả." },
            { img: "cat_heart.gif",    title: "Nhắm mắt chút đi",       text: "Để nhạc chạy nhẹ thôi, không cần làm gì hết." },
            { img: "bouquet.jpg",      title: "Mai tính tiếp nha",      text: "Giờ chỉ cần thở nhẹ thôi. Vậy là đủ." },
        ],
    },
};

// ================== Preload mood + scene images ==================
const PRELOAD = [
    "hi-paw.jpg", "happy-hearts.jpg", "heart-offer.jpg",
    "cat_dance.gif", "flower-gift.jpg", "thuong-lam.jpg",
    "bleh.jpg", "bouquet.jpg",
    "hug.jpg", "cat_heart.gif",
    "smug.jpg", "love-you.jpg",
];

function preloadImages() {
    PRELOAD.forEach(src => {
        const i = new Image();
        i.decoding = "async";
        i.loading = "eager";
        i.src = src;
    });
}

preloadImages();

// ================== Scene order ==================
const SCENE_ORDER = [
    "envelope",
    "greeting",
    "mood",
    "gift",
    "feelingCheck",
    "smug",
    "match",
    "reminders",
    "night",
    "love",
];

const progressEl = $("#progress");

if (progressEl) {
    SCENE_ORDER.slice(1).forEach(() => {
        const d = document.createElement("div");
        d.className = "p";
        progressEl.appendChild(d);
    });
}

function updateProgress(scene) {
    const idx = SCENE_ORDER.indexOf(scene);

    $$("#progress .p").forEach((el, i) => {
        el.classList.remove("active", "done");

        if (i + 1 < idx) {
            el.classList.add("done");
        } else if (i + 1 === idx) {
            el.classList.add("active");
        }
    });
}

// ================== Floating hearts config ==================
const HEART_QUIET_SCENES = new Set(["match"]);

// ================== Scene transitions ==================
let currentScene = "envelope";

function goTo(scene) {
    if (scene === currentScene) return;

    const cur = $(`.scene[data-scene="${currentScene}"]`);
    const next = $(`.scene[data-scene="${scene}"]`);

    if (!next) return;

    if (cur) cur.classList.remove("active");

    next.scrollTop = 0;

    requestAnimationFrame(() => {
        next.classList.add("active");
    });

    currentScene = scene;

    if (scene !== "envelope") {
        document.body.classList.add("started");
    }

    updateProgress(scene);
    onSceneEnter(scene);
}

function onSceneEnter(scene) {
    if (HEART_QUIET_SCENES.has(scene)) {
        stopHearts();
    } else {
        startHearts();
    }

    if (scene === "greeting") {
        playChord([659.25, 987.77], 1.1, "sine", 0.14);
    }

    if (scene === "mood") {
        playChord([523.25, 783.99], 1.1, "sine", 0.14);
    }

    if (scene === "feelingCheck") {
        fcNoAttempts = 0;
        resetNoBtn();
        attachFcPointer();
        playChord([587.33, 880], 1.0, "sine", 0.13);
    } else {
        detachFcPointer();
    }

    if (scene === "smug") {
        playChord([659.25, 987.77], 1.1, "sine", 0.14);
        setTimeout(() => smallConfetti(80), 200);
    }

    if (scene === "match") {
        initMatch();
        playChord([587.33, 880], 1.0, "sine", 0.13);
    }

    if (scene === "reminders") {
        playChord([523.25, 783.99], 1.0, "sine", 0.13);
    }

    if (scene === "night") {
        initNightScene();
        playChord([392, 523.25, 659.25], 1.4, "sine", 0.11);
    }

    if (scene === "love") {
        launchConfetti();
        playSfx("chime", 0.3);

        const other = Object.keys(SONGS).find(k => k !== currentSongId);
        if (other) playSong(other);
    }
}

// Wire data-go buttons
$$("[data-go]").forEach(b => {
    b.addEventListener("click", () => {
        resumeAudio();
        primeSfxElements();
        playSfx("click", 0.35);
        goTo(b.dataset.go);
    });
});

// ================== Envelope ==================
const envelope = $("#envelope-container");

function openEnvelope() {
    if (!envelope) return;
    if (envelope.classList.contains("opening")) return;

    envelope.classList.add("opening");

    resumeAudio();
    primeSfxElements();
    preloadSongs();

    playSfx("envelope", 0.45);

    // Phát nhạc thật trực tiếp từ gesture click.
    // Không play/pause nhạc nền để unlock nữa.
    playSong(DEFAULT_SONG);

    playChord([523.25, 783.99, 1046.5], 1.2, "sine", 0.17, 0.1);

    setTimeout(() => goTo("greeting"), 420);
}

if (envelope) {
    envelope.addEventListener("click", openEnvelope);

    envelope.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openEnvelope();
        }
    });
}

// ================== Mood pick -> Gift ==================
let currentMood = null;
let giftIdx = 0;

$$(".mood-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        resumeAudio();
        primeSfxElements();
        preloadSongs();

        currentMood = btn.dataset.mood;
        giftIdx = 0;

        const m = MOODS[currentMood];
        if (!m) return;

        document.documentElement.style.setProperty("--pink-4", m.color);

        stopMelody();
        playSong(m.song);

        goTo("gift");
        renderGift();
    });
});

function renderGift() {
    const m = MOODS[currentMood];
    if (!m) return;

    const slide = m.slides[giftIdx];

    const giftImg = $("#gift-img");
    const giftTitle = $("#gift-title");
    const giftText = $("#gift-text");

    if (giftImg) {
        giftImg.src = slide.img;
        giftImg.classList.remove("round");

        if (slide.img.endsWith(".gif") || slide.img === "hug.jpg") {
            giftImg.classList.add("round");
        }
    }

    if (giftTitle) giftTitle.textContent = slide.title;
    if (giftText) giftText.textContent = slide.text;

    const dots = $("#gift-dots");
    if (dots) {
        dots.innerHTML = "";

        m.slides.forEach((_, i) => {
            const d = document.createElement("div");
            d.className = "dot" + (i === giftIdx ? " active" : "");
            dots.appendChild(d);
        });
    }

    const next = $("#gift-next");
    if (next) {
        next.textContent = giftIdx < m.slides.length - 1 ? "Tiếp ♥" : "Một câu hỏi nhỏ →";
    }

    spawnHeart();
    spawnHeart();

    playTone(m.notes[giftIdx % m.notes.length], 0.9, "sine", 0.12);
}

const giftNext = $("#gift-next");
if (giftNext) {
    giftNext.addEventListener("click", () => {
        resumeAudio();

        const m = MOODS[currentMood];
        if (!m) return;

        if (giftIdx < m.slides.length - 1) {
            giftIdx++;
            renderGift();
        } else {
            goTo("feelingCheck");
        }
    });
}

// ================== Feeling check ==================
const noBtn = $("#fc-no");
const fcTitle = $("#fc-title");

let fcNoAttempts = 0;

const noTexts = ["Chưa", "Ờm", "Vẫn chưa", "Hmm", "Chắc chưa"];
const noTitles = [
    "Thật hả?",
    "Thử tiếp chút nha",
    "Một cái nữa nha",
    "Chưa bỏ cuộc đâu",
];

function resetNoBtn() {
    if (!noBtn || !fcTitle) return;

    noBtn.style.position = "";
    noBtn.style.transform = "";
    noBtn.style.left = "";
    noBtn.style.top = "";
    noBtn.textContent = "Chưa";

    fcTitle.textContent = "Bạn thấy nhẹ hơn chưa?";

    document.body.classList.remove("chaos");
}

function escapeNo() {
    if (!noBtn || !fcTitle) return;

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

    playTone(660 + fcNoAttempts * 80, 0.5, "sine", 0.1);
}

function chaosThenEnd() {
    document.body.classList.add("chaos");

    for (let i = 0; i < 25; i++) {
        setTimeout(spawnHeart, i * 40);
    }

    smallConfetti(120);

    if (fcTitle) {
        fcTitle.textContent = "Rồi, biết rồi.";
    }

    setTimeout(() => {
        document.body.classList.remove("chaos");
        goTo("smug");
    }, 1600);
}

let fcLastX = 0;
let fcLastY = 0;
let fcFrameQueued = false;

function fcCheck() {
    fcFrameQueued = false;

    if (currentScene !== "feelingCheck") return;
    if (!noBtn) return;

    const r = noBtn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    const d = Math.hypot(fcLastX - cx, fcLastY - cy);

    if (d < Math.max(80, r.width * 0.9)) {
        fcNoAttempts++;

        if (fcNoAttempts >= 4) {
            return chaosThenEnd();
        }

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

let fcPointerAttached = false;

function attachFcPointer() {
    if (fcPointerAttached) return;

    fcPointerAttached = true;
    addEventListener("pointermove", onPointerMoveFC, { passive: true });
}

function detachFcPointer() {
    if (!fcPointerAttached) return;

    fcPointerAttached = false;
    removeEventListener("pointermove", onPointerMoveFC);
}

if (noBtn) {
    noBtn.addEventListener("click", (e) => {
        e.preventDefault();

        fcNoAttempts++;

        if (fcNoAttempts >= 4) {
            return chaosThenEnd();
        }

        escapeNo();
    });

    noBtn.addEventListener("touchstart", (e) => {
        e.preventDefault();

        fcNoAttempts++;

        if (fcNoAttempts >= 4) {
            return chaosThenEnd();
        }

        escapeNo();
    }, { passive: false });
}

// ================== Memory match minigame ==================
const MATCH_IMAGES = [
    "cat_dance.gif",
    "cat_heart.gif",
    "flower-gift.jpg",
    "bouquet.jpg",
    "happy-hearts.jpg",
    "heart-offer.jpg",
];

const MATCH_PRAISES = [
    "Giỏi rồi đó",
    "Khớp nè",
    "Đẹp",
    "Đúng rồi á",
    "Tinh ghê",
    "Ghép ngọt",
];

let matchState = {
    firstPick: null,
    locked: false,
    matched: 0,
    advancing: false,
};

function shuffled(arr) {
    const a = arr.slice();

    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
}

function initMatch() {
    const grid = $("#match-grid");
    const status = $("#match-status");

    if (!grid) return;

    grid.innerHTML = "";

    if (status) status.textContent = "";

    matchState = {
        firstPick: null,
        locked: false,
        matched: 0,
        advancing: false,
    };

    const deck = shuffled([...MATCH_IMAGES, ...MATCH_IMAGES]);

    deck.forEach((img) => {
        const card = document.createElement("div");

        card.className = "match-card";
        card.dataset.img = img;

        card.innerHTML =
            '<div class="match-card-inner">' +
                '<div class="match-card-face match-card-front"></div>' +
                '<div class="match-card-face match-card-back">' +
                    `<img src="${img}" alt="" draggable="false">` +
                '</div>' +
            '</div>';

        card.addEventListener("click", () => flipMatchCard(card));

        grid.appendChild(card);
    });
}

function flipMatchCard(card) {
    if (matchState.advancing || matchState.locked) return;
    if (card.classList.contains("flipped") || card.classList.contains("matched")) return;

    card.classList.add("flipped");
    playTone(659.25, 0.4, "sine", 0.1);

    if (!matchState.firstPick) {
        matchState.firstPick = card;
        return;
    }

    const first = matchState.firstPick;
    const second = card;

    matchState.firstPick = null;

    if (first.dataset.img === second.dataset.img) {
        setTimeout(() => {
            first.classList.add("matched");
            second.classList.add("matched");
        }, 120);

        matchState.matched++;

        playTone(987.77, 0.7, "sine", 0.14);

        const praise = MATCH_PRAISES[matchState.matched - 1] || "Hay quá";
        const status = $("#match-status");

        if (status) {
            status.textContent = `${praise} · ${matchState.matched}/${MATCH_IMAGES.length}`;
        }

        if (matchState.matched === MATCH_IMAGES.length) {
            matchState.advancing = true;

            if (status) {
                status.textContent = "Xong hết rồi.";
            }

            setTimeout(() => smallConfetti(80), 200);
            playSfx("chime", 0.32);

            setTimeout(() => goTo("reminders"), 1800);
        }
    } else {
        matchState.locked = true;

        setTimeout(() => {
            first.classList.remove("flipped");
            second.classList.remove("flipped");
            matchState.locked = false;
        }, 820);
    }
}

// ================== Night transition mini-flow ==================
const NIGHT_LINES = [
    "Có những chuyện nhỏ không đáng để hai đứa nặng lòng vì nhau nữa.",
    "Đi bên nhau là để có nhẹ nhàng và thấu hiểu, không phải thêm một vai diễn.",
    "Mình yêu con người thật của nhau, không phải một phiên bản bị kỳ vọng.",
    "Khi đủ chín, tình cảm tự nâng lên. Cứ chân thành và trân trọng là đủ.",
];

let nightStep = 0;

function renderNightStep() {
    const line = $("#night-line");
    const nextBtn = $("#night-next");

    $$(".night-step").forEach((btn, idx) => {
        btn.classList.remove("active", "done");
        if (idx < nightStep) btn.classList.add("done");
        if (idx === nightStep) btn.classList.add("active");
    });

    if (line) {
        line.textContent = NIGHT_LINES[Math.max(0, Math.min(nightStep - 1, NIGHT_LINES.length - 1))] || "";
    }

    if (nextBtn) {
        nextBtn.disabled = nightStep < NIGHT_LINES.length;
    }
}

function advanceNightStep(step) {
    if (step !== nightStep) return;
    nightStep = Math.min(NIGHT_LINES.length, nightStep + 1);
    renderNightStep();
    playTone(523.25 + nightStep * 55, 0.5, "sine", 0.1);
}

function initNightScene() {
    nightStep = 0;
    renderNightStep();
}

$$(".night-step").forEach((btn) => {
    btn.addEventListener("click", () => {
        resumeAudio();
        const step = Number(btn.dataset.step);
        advanceNightStep(step);
    });
});

// ================== Floating hearts + sparkles ==================
const heartsBg = $("#hearts-bg");

const heartGlyphs = ["♥", "♡", "❣", "🌸", "🌻", "🎀", "💗", "✿"];
const sparkleGlyphs = ["✨", "🌟", "💫", "⋆"];

let heartTimer = null;

const heartInterval = isTouch ? 950 : 560;
const maxHearts = isTouch ? 18 : 34;

function spawnHeart() {
    if (document.hidden || !heartsBg) return;

    if (heartsBg.children.length >= maxHearts) return;

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
    if (HEART_QUIET_SCENES.has(currentScene)) return;

    heartTimer = setInterval(spawnHeart, heartInterval);

    const initialCount = isTouch ? 2 : 5;

    for (let i = 0; i < initialCount; i++) {
        setTimeout(spawnHeart, i * 240);
    }
}

function stopHearts() {
    if (heartTimer) {
        clearInterval(heartTimer);
        heartTimer = null;
    }
}

startHearts();

// ================== Confetti ==================
const confettiCanvas = $("#confetti");
const ctx = confettiCanvas ? confettiCanvas.getContext("2d") : null;

let parts = [];
let running = false;

function resizeCanvas() {
    if (!confettiCanvas || !ctx) return;

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
    if (!ctx) return;

    const colors = [
        "#ff5c8a",
        "#ff8fa3",
        "#ffd1dc",
        "#ffffff",
        "#ffe66d",
        "#ff477e",
        "#f4b400",
    ];

    const shapes = ["heart", "rect", "circle", "star"];

    const safeCount = isTouch ? Math.min(count, 55) : count;

    for (let i = 0; i < safeCount; i++) {
        parts.push({
            x: innerWidth / 2 + (Math.random() - 0.5) * 200,
            y: innerHeight / 2 + (Math.random() - 0.5) * 80,
            vx: (Math.random() - 0.5) * 10,
            vy: -Math.random() * 14 - 6,
            g: 0.28 + Math.random() * 0.15,
            size: 6 + Math.random() * 10,
            color: colors[Math.floor(Math.random() * colors.length)],
            rot: Math.random() * Math.PI * 2,
            vr: (Math.random() - 0.5) * 0.3,
            life: 180 + Math.random() * 120,
            shape: shapes[Math.floor(Math.random() * shapes.length)],
        });
    }

    if (!running) {
        running = true;
        requestAnimationFrame(step);
    }
}

function launchConfetti() {
    if (!reduceMotion) {
        spawnBurst(isTouch ? 65 : 150);
    }
}

function smallConfetti(n) {
    if (!reduceMotion) {
        spawnBurst(isTouch ? Math.min(n, 45) : n);
    }
}

function drawHeart(x, y, size, color, rot) {
    if (!ctx) return;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = color;

    ctx.beginPath();

    const s = size / 2;

    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo(0, -s * 0.2, -s, -s * 0.2, -s, s * 0.3);
    ctx.bezierCurveTo(-s, s * 0.8, 0, s, 0, s * 1.2);
    ctx.bezierCurveTo(0, s, s, s * 0.8, s, s * 0.3);
    ctx.bezierCurveTo(s, -s * 0.2, 0, -s * 0.2, 0, s * 0.3);

    ctx.fill();
    ctx.restore();
}

function drawStar(x, y, size, color, rot) {
    if (!ctx) return;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = color;

    ctx.beginPath();

    for (let i = 0; i < 5; i++) {
        ctx.lineTo(
            Math.cos((18 + i * 72) * Math.PI / 180) * size,
            -Math.sin((18 + i * 72) * Math.PI / 180) * size
        );

        ctx.lineTo(
            Math.cos((54 + i * 72) * Math.PI / 180) * size * 0.45,
            -Math.sin((54 + i * 72) * Math.PI / 180) * size * 0.45
        );
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function step() {
    if (!ctx || !confettiCanvas) {
        running = false;
        return;
    }

    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (const p of parts) {
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 1;

        if (p.shape === "heart") {
            drawHeart(p.x, p.y, p.size * 1.6, p.color, p.rot);
        } else if (p.shape === "star") {
            drawStar(p.x, p.y, p.size * 0.9, p.color, p.rot);
        } else if (p.shape === "rect") {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size / 1.5);
            ctx.restore();
        } else {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 40);

    if (parts.length > 0) {
        requestAnimationFrame(step);
    } else {
        running = false;
    }
}

// ================== WebAudio ==================
let audioCtx = null;
let masterGain = null;
let melodyTimer = null;

let muted = localStorage.getItem("lovePageMuted") === "true";

const MASTER_VOL = 0.9;

const mediaUnlock = $("#media-unlock");

function getAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();

            masterGain = audioCtx.createGain();
            masterGain.gain.value = muted ? 0 : MASTER_VOL;
            masterGain.connect(audioCtx.destination);
        } catch (e) {
            audioCtx = null;
            masterGain = null;
        }
    }

    return audioCtx;
}

function resumeAudio() {
    const a = getAudio();

    if (a && a.state === "suspended") {
        a.resume().catch(() => {});
    }

    if (mediaUnlock && mediaUnlock.paused) {
        mediaUnlock.muted = true;
        mediaUnlock.play().catch(() => {});
    }
}

function playToneAt(freq, startAt, dur = 1.1, type = "sine", vol = 0.18) {
    if (muted) return;

    const a = getAudio();

    if (!a || !masterGain) return;
    if (a.state === "suspended") return;

    try {
        const start = startAt !== undefined ? startAt : a.currentTime + 0.005;
        const end = start + dur;

        const voiceGain = a.createGain();

        voiceGain.gain.setValueAtTime(0.0001, start);
        voiceGain.gain.exponentialRampToValueAtTime(vol, start + 0.012);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, end);

        const lp = a.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 2800;
        lp.Q.value = 0.5;

        voiceGain.connect(lp).connect(masterGain);

        const partials = [
            [1, 1.0],
            [2, 0.22],
            [3, 0.08],
        ];

        for (const [mul, g] of partials) {
            const osc = a.createOscillator();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq * mul, start);

            const pg = a.createGain();
            pg.gain.value = g;

            osc.connect(pg).connect(voiceGain);
            osc.start(start);
            osc.stop(end + 0.05);
        }
    } catch (e) {}
}

function playTone(freq, dur, type, vol) {
    if (muted) return;

    const a = getAudio();
    if (!a) return;

    const sched = () => {
        if (!muted) {
            playToneAt(freq, undefined, dur, type, vol);
        }
    };

    if (a.state === "suspended") {
        a.resume().then(sched).catch(() => {});
    } else {
        sched();
    }
}

function playChord(freqs, dur = 1.0, type = "sine", vol = 0.16, spacing = 0.08) {
    if (muted) return;

    const a = getAudio();
    if (!a) return;

    const sched = () => {
        if (muted) return;

        const base = a.currentTime + 0.01;

        freqs.forEach((f, i) => {
            playToneAt(f, base + i * spacing, dur, type, vol);
        });
    };

    if (a.state === "suspended") {
        a.resume().then(sched).catch(() => {});
    } else {
        sched();
    }
}

function playMelody(notes, tempo = 0.3, loop = true) {
    stopMelody();

    let i = 0;

    const tick = () => {
        if (muted) return;

        const n = notes[i % notes.length];

        if (n) {
            playTone(n, tempo * 1.1, "triangle", 0.32);
        }

        i++;

        if (!loop && i >= notes.length) {
            stopMelody();
            return;
        }
    };

    tick();
    melodyTimer = setInterval(tick, tempo * 1000);
}

function stopMelody() {
    if (melodyTimer) {
        clearInterval(melodyTimer);
        melodyTimer = null;
    }
}

// ================== Songs + SFX ==================
const SONGS = {
    "anh-biet": $("#song-anh-biet"),
    "vuong": $("#song-vuong"),
};

const SFX = {
    envelope: $("#sfx-envelope"),
    pop: $("#sfx-pop"),
    chime: $("#sfx-chime"),
    click: $("#sfx-click"),
};

const SONG_VOL = 0.5;
const DEFAULT_SONG = "anh-biet";

let currentSongId = null;
let sfxReady = false;
let songPlayToken = 0;

function prepareAudioElement(el) {
    if (!el) return;

    el.loop = true;
    el.playsInline = true;
    el.preload = "auto";

    try {
        el.load();
    } catch (e) {}
}

function preloadSongs() {
    Object.values(SONGS).forEach(prepareAudioElement);
}

preloadSongs();

function validateAudioFiles() {
    for (const [id, el] of Object.entries(SONGS)) {
        if (!el) {
            console.warn(`[AUDIO] Missing element for song: ${id}`);
            continue;
        }

        if (!el.getAttribute("src")) {
            console.warn(`[AUDIO] Missing src for song: ${id}`);
        }
    }

    for (const [id, el] of Object.entries(SFX)) {
        if (!el) {
            console.warn(`[SFX] Missing element for sfx: ${id}`);
            continue;
        }

        if (!el.getAttribute("src")) {
            console.warn(`[SFX] Missing src for sfx: ${id}`);
        }
    }
}

validateAudioFiles();

function fadeAudio(el, target, duration, onDone) {
    if (!el) return;

    if (el._fadeTimer) {
        clearInterval(el._fadeTimer);
        el._fadeTimer = null;
    }

    const start = Number.isFinite(el.volume) ? el.volume : 0;
    const t0 = performance.now();

    el._fadeTimer = setInterval(() => {
        const t = Math.min(1, (performance.now() - t0) / duration);
        const nextVol = start + (target - start) * t;

        el.volume = Math.max(0, Math.min(1, nextVol));

        if (t >= 1) {
            clearInterval(el._fadeTimer);
            el._fadeTimer = null;

            if (onDone) onDone();
        }
    }, 50);
}

function stopOtherSongs(activeId) {
    for (const [k, el] of Object.entries(SONGS)) {
        if (!el || k === activeId) continue;

        if (!el.paused) {
            fadeAudio(el, 0, 500, () => {
                if (currentSongId !== k) {
                    el.pause();
                    el.currentTime = 0;
                }
            });
        }
    }
}

function playSong(id) {
    const next = SONGS[id];

    if (!next) {
        console.warn("[AUDIO] Song not found:", id);
        return;
    }

    currentSongId = id;

    if (muted) return;

    const token = ++songPlayToken;

    prepareAudioElement(next);
    stopOtherSongs(id);

    const startFade = () => {
        if (token !== songPlayToken) return;

        currentSongId = id;
        hideMusicStartButton();
        fadeAudio(next, SONG_VOL, 850);
    };

    try {
        if (next.paused) {
            next.volume = 0;

            const p = next.play();

            if (p && p.then) {
                p.then(startFade).catch((err) => {
                    console.warn("[AUDIO] Song play rejected:", id, err);
                    showMusicStartButton();
                });
            } else {
                startFade();
            }
        } else {
            startFade();
        }
    } catch (err) {
        console.warn("[AUDIO] Song play error:", id, err);
        showMusicStartButton();
    }
}

function stopAllSongs() {
    songPlayToken++;

    for (const el of Object.values(SONGS)) {
        if (!el) continue;

        if (!el.paused) {
            fadeAudio(el, 0, 320, () => {
                el.pause();
                el.currentTime = 0;
            });
        }
    }
}

function softenCurrentSong() {
    const activeSong = SONGS[currentSongId];

    if (activeSong && !activeSong.paused && !muted) {
        fadeAudio(activeSong, 0.08, 500);
    }
}

function restoreCurrentSong() {
    const activeSong = SONGS[currentSongId];

    if (activeSong && !activeSong.paused && !muted) {
        fadeAudio(activeSong, SONG_VOL, 700);
    }
}

function playSfx(name, vol = 0.7) {
    if (muted) return;

    const el = SFX[name];

    if (!el) return;

    try {
        el.currentTime = 0;
        el.volume = vol;

        const p = el.play();

        if (p && p.catch) {
            p.catch(() => {});
        }
    } catch (e) {}
}

// Chỉ unlock SFX, không unlock nhạc nền bằng play/pause.
function primeSfxElements() {
    if (sfxReady) return;

    sfxReady = true;

    for (const el of Object.values(SFX)) {
        if (!el) continue;

        try {
            el.volume = 0;

            const p = el.play();

            if (p && p.then) {
                p.then(() => {
                    el.pause();
                    el.currentTime = 0;
                    el.volume = 1;
                }).catch(() => {});
            }
        } catch (e) {}
    }
}

// ================== Music Start Fallback Button ==================
if (musicStartBtn) {
    musicStartBtn.addEventListener("click", () => {
        resumeAudio();
        preloadSongs();

        if (currentSongId) {
            playSong(currentSongId);
        } else {
            playSong(DEFAULT_SONG);
        }

        hideMusicStartButton();
    });
}

// ================== Sound toggle ==================
const soundToggle = $("#sound-toggle");

function syncSoundButton() {
    if (!soundToggle) return;

    soundToggle.classList.toggle("muted", muted);
    soundToggle.textContent = muted ? "♪̸" : "♪";
}

syncSoundButton();

if (soundToggle) {
    soundToggle.addEventListener("click", () => {
        muted = !muted;

        localStorage.setItem("lovePageMuted", String(muted));

        syncSoundButton();
        resumeAudio();
        primeSfxElements();

        if (muted) {
            hideMusicStartButton();
            stopMelody();
            stopAllSongs();

            if (masterGain && audioCtx) {
                masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
            }
        } else {
            if (masterGain && audioCtx) {
                masterGain.gain.setTargetAtTime(MASTER_VOL, audioCtx.currentTime, 0.05);
            }

            if (currentSongId) {
                playSong(currentSongId);
            } else {
                playSong(DEFAULT_SONG);
            }

            playTone(783.99, 0.8, "sine", 0.12);
        }
    });
}

// ================== Unlock audio on first interaction ==================
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

        if (a.state === "suspended") {
            a.resume().catch(() => {});
        }
    }

    if (mediaUnlock) {
        mediaUnlock.muted = true;
        mediaUnlock.play().catch(() => {});
    }

    primeSfxElements();
    preloadSongs();

    removeEventListener("touchstart", unlockOnce);
    removeEventListener("pointerdown", unlockOnce);
    removeEventListener("click", unlockOnce);
    removeEventListener("keydown", unlockOnce);
};

addEventListener("touchstart", unlockOnce, { passive: true });
addEventListener("pointerdown", unlockOnce, { passive: true });
addEventListener("click", unlockOnce);
addEventListener("keydown", unlockOnce);

// ================== Visibility Handling ==================
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        stopHearts();
        softenCurrentSong();
    } else {
        startHearts();
        restoreCurrentSong();
    }
});

// ================== Audio Debug Logs ==================
for (const [id, el] of Object.entries(SONGS)) {
    if (!el) continue;

    el.addEventListener("play", () => console.log("[AUDIO]", id, "play"));
    el.addEventListener("pause", () => console.log("[AUDIO]", id, "pause"));
    el.addEventListener("ended", () => console.log("[AUDIO]", id, "ended"));
    el.addEventListener("error", () => console.log("[AUDIO]", id, "error", el.error));
}

// ================== Init ==================
updateProgress("envelope");
