const GROUP_ACTORS = {
  sirius: new Set([
    "鳳ここな",
    "静香",
    "カトリナ・グリーベル",
    "新妻八恵",
    "柳場ぱんだ",
    "流石知冴"
  ]),

  eden: new Set([
    "連尺野初魅",
    "烏森大黒",
    "舎人仁花子",
    "萬容",
    "筆島しぐれ"
  ]),

  gingaza: new Set([
    "千寿暦",
    "ラモーナ・ウォルフ",
    "王雪",
    "リリヤ・クルトベイ",
    "与那国緋花里"
  ]),

  denki: new Set([
    "千寿いろは",
    "白丸美兎",
    "阿岐留カミラ",
    "猫足蕾",
    "本巣叶羽"
  ])
};

const SUNSHINE_ACTORS = new Set([
  "高海千歌",
  "桜内梨子",
  "黒澤ダイヤ",
  "津島善子",
  "黒澤ルビィ"
]);

let gachaType = "normal";

const gachaResults = {
  normal: [],
  sirius: [],
  eden: [],
  gingaza: [],
  denki: [],
  sunshine: []
};

const gachaStats = {
  normal:   { total: 0, n4: 0, n3: 0, n2: 0 },
  sirius:   { total: 0, n4: 0, n3: 0, n2: 0 },
  eden:     { total: 0, n4: 0, n3: 0, n2: 0 },
  gingaza:  { total: 0, n4: 0, n3: 0, n2: 0 },
  denki:    { total: 0, n4: 0, n3: 0, n2: 0 },
  sunshine: { total: 0, n4: 0, n3: 0, n2: 0 }
};

let current = null;
let side = "before";

const $ = s => document.querySelector(s);

function currentPool() {
  // 선샤인 콜라보: 기존 21명 + 선샤인 5명
  if (gachaType === "sunshine") {
    return ALL_CARDS;
  }

  // 극단별 가챠
  if (GROUP_ACTORS[gachaType]) {
    return ALL_CARDS.filter(card =>
      GROUP_ACTORS[gachaType].has(card.actor)
    );
  }

  // 통상: 선샤인 멤버 제외, 유메스테 21명
  return ALL_CARDS.filter(card =>
    !SUNSHINE_ACTORS.has(card.actor)
  );
}

function chooseRank() {
  const x = Math.random() * 100;

  if (x < 3) return 4;       // ★★★★ 3%
  if (x < 11.5) return 3;    // ★★★  8.5%
  return 2;                  // ★★   88.5%
}

function pull(n) {
  const cards = currentPool();
  const results = [];

  // 먼저 일반 확률로 전부 뽑기
  for (let i = 0; i < n; i++) {
    const rank = chooseRank();
    const pool = cards.filter(card => card.rank === rank);
    const card = pool[Math.floor(Math.random() * pool.length)];

    results.push(card);
  }

  // 10연에서 ★3 이상이 하나도 없을 때만 한 장 보장
  if (n === 10 && !results.some(card => card.rank >= 3)) {
    const guaranteedRank = Math.random() * 11.5 < 3 ? 4 : 3;
    const pool = cards.filter(card => card.rank === guaranteedRank);
    const replacement = pool[Math.floor(Math.random() * pool.length)];

    const replaceIndex = Math.floor(Math.random() * 10);
    results[replaceIndex] = replacement;
  }

  // 이 가챠의 마지막 결과 저장
  gachaResults[gachaType] = [...results];

  // 누적 통계
  const stats = gachaStats[gachaType];

  for (const card of results) {
    stats.total++;

    if (card.rank === 4) stats.n4++;
    else if (card.rank === 3) stats.n3++;
    else stats.n2++;
  }

  renderResults(results);
  updateStats();
}


function renderResults(cards) {
  const container = $("#results");
  container.innerHTML = "";

  if (!cards || cards.length === 0) {
    container.innerHTML =
      '<div class="empty">ガチャを引いてみよう ✦</div>';
    return;
  }

  for (const card of cards) {
    const button = document.createElement("button");
    button.className = "card";

    button.innerHTML = `
      <img src="${card.before}" alt="${card.title}">
      <div class="info">
        <div class="stars">${"★".repeat(card.rank)}</div>
        <div class="actor">${card.actor}</div>
        <div class="title">${card.title}</div>
      </div>
    `;

    button.addEventListener("click", () => openCard(card));
    container.append(button);
  }
}
function updateStats() {
  const stats = gachaStats[gachaType];

  $("#count").textContent = stats.total;
  $("#four").textContent = stats.n4;
  $("#three").textContent = stats.n3;
  $("#two").textContent = stats.n2;
}

function openCard(card) {
  current = card;
  side = "before";

  $("#big").src = card.before;
  $("#modalStars").textContent = "★".repeat(card.rank);
  $("#modalTitle").textContent = card.title;

  const actor = document.querySelector(".meta span");
  actor.textContent = card.actor;

  $("#modal").hidden = false;

  $("#awaken").hidden = !(card.rank === 4 && card.after);
}

$("#awaken").addEventListener("click", () => {
  if (!current || !current.after) return;

  side = side === "before" ? "after" : "before";

  $("#big").src =
    side === "after"
      ? current.after
      : current.before;
});

$("#close").onclick = () => {
  $("#modal").hidden = true;
};

$("#modal").addEventListener("click", e => {
  if (e.target === $("#modal")) {
    $("#modal").hidden = true;
  }
});

$("#one").onclick = () => pull(1);
$("#ten").onclick = () => pull(10);

$("#clear").onclick = () => {
  const stats = gachaStats[gachaType];

  stats.total = 0;
  stats.n4 = 0;
  stats.n3 = 0;
  stats.n2 = 0;

  gachaResults[gachaType] = [];

  updateStats();

  $("#results").innerHTML =
    '<div class="empty">ガチャを引いてみよう ✦</div>';
};

window.selectGacha = function(type) {
  gachaType = type;

  updateStats();

  document.querySelectorAll(".gacha-tab").forEach(tab => {
    tab.classList.toggle(
      "active",
      tab.dataset.gacha === type
    );
  });

  const banner = document.querySelector(".banner");

  banner.classList.remove("collab");

  const banners = {
    normal: {
      badge: "ALL ACTORS",
      text: "フェス限定アクターを含む全アクターが登場！"
    },

    sirius: {
      badge: "SIRIUS",
      text: "限定を含むシリウスのアクターのみ登場！"
    },

    eden: {
      badge: "EDEN",
      text: "限定を含むEdenのアクターのみ登場！"
    },

    gingaza: {
      badge: "GINGAZA",
      text: "限定を含む銀河座のアクターのみ登場！"
    },

    denki: {
      badge: "DENKI",
      text: "限定を含む劇団電姫のアクターのみ登場！"
    },

    sunshine: {
      badge: "COLLABORATION",
      text: "「ラブライブ！サンシャイン！！」のメンバーが登場！"
    }
  };

  const info = banners[type] || banners.normal;

  if (type === "sunshine") {
    banner.classList.add("collab");
  }

  banner.innerHTML = `
    <div>
      <b>${info.badge}</b>
      <h2>${info.text}</h2>
    </div>
  `;

  // 해당 가챠에서 마지막으로 뽑았던 결과 복원
  renderResults(gachaResults[gachaType]);
};;


/* =========================
   START SCREEN
   ========================= */

const startScreen = document.querySelector("#startScreen");
const startButton = document.querySelector("#startButton");
const startDugong = document.querySelector("#startDugong");

if (startScreen && startButton && startDugong) {
  const normalDugong = startDugong.dataset.normal;
  const activeDugong = startDugong.dataset.active;

  startButton.addEventListener("mouseenter", () => {
    startDugong.src = activeDugong;
  });

  startButton.addEventListener("mouseleave", () => {
    startDugong.src = normalDugong;
  });

  startButton.addEventListener("mousedown", () => {
    startDugong.src = activeDugong;
  });

  startButton.addEventListener("mouseup", () => {
    startDugong.src = activeDugong;
  });

  startButton.addEventListener("click", () => {
    startDugong.src = activeDugong;
    startScreen.classList.add("start-leave");

    setTimeout(() => {
      startScreen.hidden = true;
    }, 380);
  });
}


/* 최초 진입은 通常ガチャ 선택 상태 */
selectGacha("normal");


/* TITLE EASTER EGG */
const easterEgg = document.getElementById("easterEgg");
const easterTrigger = document.getElementById("easterTrigger");
const easterReveal = document.getElementById("easterReveal");

if (easterEgg && easterTrigger && easterReveal) {
  easterTrigger.addEventListener("click", () => {
    const isOpen = easterEgg.classList.toggle("open");

    easterTrigger.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    easterReveal.setAttribute(
      "aria-hidden",
      String(!isOpen)
    );
  });
}





/* ===== TITLE SCREEN RETURN ===== */

const titleHome = document.getElementById("titleHome");
const startScreenForReturn = document.querySelector(".start-screen");
const startTriggerForReturn =
  document.querySelector(".start-screen button") ||
  document.querySelector(".start-screen img");

/* 타이틀 화면 열기 */
function showTitleScreen() {
  if (!startScreenForReturn) return;

  /* 이스터에그가 열려 있으면 닫기 */
  if (typeof easterEgg !== "undefined" && easterEgg) {
    easterEgg.classList.remove("open");
  }

  if (typeof easterTrigger !== "undefined" && easterTrigger) {
    easterTrigger.setAttribute("aria-expanded", "false");
  }

  if (typeof easterReveal !== "undefined" && easterReveal) {
    easterReveal.setAttribute("aria-hidden", "true");
  }

  startScreenForReturn.hidden = false;
  startScreenForReturn.removeAttribute("hidden");

  startScreenForReturn.style.display = "flex";
  startScreenForReturn.style.visibility = "visible";
  startScreenForReturn.style.pointerEvents = "auto";
  startScreenForReturn.style.opacity = "0";

  requestAnimationFrame(() => {
    startScreenForReturn.style.opacity = "1";
  });
}


/* 타이틀 화면 닫고 다시 가챠로 */
function hideTitleScreen() {
  if (!startScreenForReturn) return;

  startScreenForReturn.style.opacity = "0";
  startScreenForReturn.style.pointerEvents = "none";

  setTimeout(() => {
    startScreenForReturn.style.display = "none";
    startScreenForReturn.style.visibility = "hidden";
  }, 380);
}


/* 제목 클릭 → 타이틀 */
if (titleHome) {
  titleHome.addEventListener("click", showTitleScreen);
}


/*
  시작 화면을 다시 띄운 뒤에도 확실하게 작동하도록
  start-screen 자체에서 클릭을 받음.

  기존 듀공 클릭 이벤트와 충돌하지 않도록
  재진입 상태일 때만 우리가 직접 닫아줌.
*/
if (startScreenForReturn) {
  startScreenForReturn.addEventListener("click", (event) => {

    const clickedStart =
      event.target.closest("button") ||
      event.target.closest("img") ||
      event.target.closest(".start-screen");

    if (!clickedStart) return;

    /*
      처음 접속했을 때는 기존 시작 이벤트가 작동하고,
      제목으로 돌아온 뒤에는 이 코드가 확실히 닫아준다.
    */
    if (
      startScreenForReturn.style.display === "flex" ||
      startScreenForReturn.style.visibility === "visible"
    ) {
      hideTitleScreen();
    }
  });
}

