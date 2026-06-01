# -*- coding: utf-8 -*-
"""각 책의 book.json 을 읽어 페이지별 내레이션 mp3 를 edge-tts(InJoon, 따뜻한 남성)로 생성하고
book.json 에 audio 경로를 채워 넣는다. 진짜 사람이 읽어주는 듯한 동화 낭독."""
import json, os, subprocess, sys

ROOT = r"C:\DongHwa\moonlight-library\books"
BOOKS = ["01-moonlight-library", "02-acorn-village-rescue", "03-bell-tower-yeonwoo"]
VOICE = "ko-KR-InJoonNeural"
RATE = "-8%"     # 살짝 느리게 — 동화 읽어주듯 차분하게
PITCH = "-2Hz"   # 살짝 낮춰 따뜻한 톤

def narration_text(p):
    t = p.get("type")
    if t == "cover":
        return ". ".join(x for x in [p.get("title"), p.get("subtitle")] if x)
    if t == "ending":
        return p.get("message", "")
    return ". ".join(x for x in [p.get("title"), p.get("body")] if x)

def gen(text, out):
    text = " ".join(text.split())  # 개행/중복공백 정리
    if not text.strip():
        return False
    subprocess.run(
        [sys.executable, "-m", "edge_tts", "--voice", VOICE,
         f"--rate={RATE}", f"--pitch={PITCH}", "--text", text, "--write-media", out],
        check=True
    )
    return True

total = 0
for slug in BOOKS:
    bdir = os.path.join(ROOT, slug)
    bjson = os.path.join(bdir, "book.json")
    if not os.path.exists(bjson):
        print(f"[skip] {slug}: book.json 없음"); continue
    with open(bjson, encoding="utf-8") as f:
        data = json.load(f)
    adir = os.path.join(bdir, "audio")
    os.makedirs(adir, exist_ok=True)
    n = 0
    for i, p in enumerate(data["pages"]):
        txt = narration_text(p)
        if not txt.strip():
            p.pop("audio", None)
            continue
        fname = f"p{i:02d}.mp3"
        out = os.path.join(adir, fname)
        try:
            if gen(txt, out):
                p["audio"] = f"audio/{fname}"
                n += 1
        except subprocess.CalledProcessError as e:
            print(f"  [err] {slug} page {i}: {e}")
    with open(bjson, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[ok] {slug}: {n} 개 생성")
    total += n

print(f"=== 총 {total} 개 내레이션 mp3 생성 완료 ===")
