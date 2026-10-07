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
        <div class="title">${card.title}</div>
        <div class="actor">${card.actor}</div>
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
    '<div class="empty">뽑기 버튼을 눌러봐 ✦</div>';
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
    banner.innerHTML = `
      <div>
        <b>ALL ACTOR</b>
        <h2>通常 PHOTO GACHA</h2>
        <p>★★★★ 3%　★★★ 15%　★★ 82%</p>
        <small>ワールドダイスター オリジナル21人</small>
      </div>
    `;
  } else {
    banner.innerHTML = `
      <div>
        <b>COLLABORATION</b>
        <h2>LoveLive! Sunshine!! PHOTO GACHA</h2>
        <p>★★★★ 3%　★★★ 15%　★★ 82%</p>
        <small>オリジナル21人 ＋ Aqours 5人</small>
      </div>
    `;
  }

  $("#results").innerHTML =
    '<div class="empty">뽑기 버튼을 눌러봐 ✦</div>';
};
