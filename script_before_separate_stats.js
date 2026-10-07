const SUNSHINE_ACTORS = new Set([
  "高海千歌",
  "桜内梨子",
  "黒澤ダイヤ",
  "津島善子",
  "黒澤ルビィ"
]);

let gachaType = "normal";

let total = 0;
let n4 = 0;
let n3 = 0;
let n2 = 0;

let current = null;
let side = "before";

const $ = s => document.querySelector(s);

function currentPool() {
  if (gachaType === "sunshine") {
    return ALL_CARDS;
  }

  return ALL_CARDS.filter(card => !SUNSHINE_ACTORS.has(card.actor));
}

function chooseRank() {
  const x = Math.random() * 100;

  if (x < 3) return 4;
  if (x < 18) return 3;
  return 2;
}

function pull(n) {
  const cards = currentPool();
  const results = [];

  // 모든 카드를 먼저 일반 확률로 뽑기
  for (let i = 0; i < n; i++) {
    const rank = chooseRank();
    const pool = cards.filter(card => card.rank === rank);
    const card = pool[Math.floor(Math.random() * pool.length)];
    results.push(card);
  }

  // 10연 결과가 전부 ★2일 때만
  // 랜덤한 한 장을 ★3 이상으로 교체
  if (n === 10 && !results.some(card => card.rank >= 3)) {
    const guaranteedRank = Math.random() * 18 < 3 ? 4 : 3;
    const pool = cards.filter(card => card.rank === guaranteedRank);
    const replacement = pool[Math.floor(Math.random() * pool.length)];

    const replaceIndex = Math.floor(Math.random() * 10);
    results[replaceIndex] = replacement;
  }

  $("#results").innerHTML = "";

  for (const card of results) {
    const rank = card.rank;

    total++;

    if (rank === 4) n4++;
    else if (rank === 3) n3++;
    else n2++;

    const button = document.createElement("button");
    button.className = "card";

    button.innerHTML = `
      <img src="${card.before}" alt="${card.title}">
      <div class="info">
        <div class="stars">${"★".repeat(rank)}</div>
        <div class="actor">${card.actor}</div>
        <div class="title">${card.title}</div>
      </div>
    `;

    button.addEventListener("click", () => openCard(card));
    $("#results").append(button);
  }

  updateStats();
}
function updateStats() {
  $("#count").textContent = total;
  $("#four").textContent = n4;
  $("#three").textContent = n3;
  $("#two").textContent = n2;
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
  total = 0;
  n4 = 0;
  n3 = 0;
  n2 = 0;

  updateStats();

  $("#results").innerHTML =
    '<div class="empty">ガチャを引いてみよう ✦</div>';
};

window.selectGacha = function(type) {
  gachaType = type;

  document
    .querySelectorAll(".gacha-tab")
    .forEach(tab => tab.classList.remove("active"));

  document
    .querySelector(`[data-gacha="${type}"]`)
    .classList.add("active");

  const banner = document.querySelector(".banner");

  if (type === "normal") {
    banner.classList.remove("collab");

    banner.innerHTML = `
      <div>
        <b>ALL ACTORS</b>
        <h2>フェス限定アクターを含む全アクターが登場！</h2>
      </div>
    `;
  } else {
    banner.classList.add("collab");

    banner.innerHTML = `
      <div>
        <b>COLLABORATION</b>
        <h2>「ラブライブ！サンシャイン！！」のメンバーが登場！</h2>
      </div>
    `;
  }

  $("#results").innerHTML =
    '<div class="empty">ガチャを引いてみよう ✦</div>';
};


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
