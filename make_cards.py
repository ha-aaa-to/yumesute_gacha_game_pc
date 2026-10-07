from pathlib import Path
import json

ROOT = Path.home() / "Downloads/kokona_gacha_v8_mobile"
PHOTO_ROOT = ROOT / "photos"

cards = []

def clean_title(filename):
    # 【カード名】 배우명.webp → 【カード名】
    stem = Path(filename).stem
    if stem.startswith("【") and "】" in stem:
        return stem[:stem.index("】") + 1]
    return stem

for actor_dir in sorted(PHOTO_ROOT.iterdir()):
    if not actor_dir.is_dir():
        continue

    actor = actor_dir.name

    # ★★ / ★★★
    for stars, rank in [("★★", 2), ("★★★", 3)]:
        folder = actor_dir / stars
        if not folder.exists():
            continue

        for img in sorted(folder.iterdir()):
            if not img.is_file() or img.name.startswith("."):
                continue

            cards.append({
                "rank": rank,
                "title": clean_title(img.name),
                "actor": actor,
                "before": img.relative_to(ROOT).as_posix(),
                "after": None
            })

    # ★★★★
    before_dir = actor_dir / "★★★★" / "覚醒前"
    after_dir = actor_dir / "★★★★" / "覚醒後"

    if before_dir.exists():
        for img in sorted(before_dir.iterdir()):
            if not img.is_file() or img.name.startswith("."):
                continue

            # 각전/각후의 확장자가 달라도 같은 카드명으로 연결
            matches = [
                x for x in after_dir.glob(img.stem + ".*")
                if x.is_file()
            ] if after_dir.exists() else []

            after = matches[0] if matches else None
            after_path = after.relative_to(ROOT).as_posix() if after else None

            cards.append({
                "rank": 4,
                "title": clean_title(img.name),
                "actor": actor,
                "before": img.relative_to(ROOT).as_posix(),
                "after": after_path
            })

out = ROOT / "cards.js"

with out.open("w", encoding="utf-8") as f:
    f.write("const ALL_CARDS = ")
    json.dump(cards, f, ensure_ascii=False, indent=2)
    f.write(";\n")

print(f"완료: {len(cards)}장")
print(f"★★★★: {sum(c['rank']==4 for c in cards)}")
print(f"★★★: {sum(c['rank']==3 for c in cards)}")
print(f"★★: {sum(c['rank']==2 for c in cards)}")
print(f"★4 각후 연결: {sum(1 for c in cards if c['rank']==4 and c['after'])}")
