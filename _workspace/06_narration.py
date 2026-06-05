import json, asyncio, edge_tts, os

BOOK = "books/06-yeonwoo-drawing-world"
VOICE = "ko-KR-SunHiNeural"
os.makedirs(f"{BOOK}/audio", exist_ok=True)
d = json.load(open(f"{BOOK}/book.json", encoding="utf-8"))

# Build (filename, text) per page. Cover -> title+subtitle; scene -> body; ending -> message.
jobs = []
for i, p in enumerate(d["pages"]):
    fn = os.path.basename(p["audio"])
    if p["type"] == "cover":
        text = p["title"] + ". " + p.get("subtitle", "")
    elif p["type"] == "ending":
        text = p["message"]
    else:
        text = p["body"]
    jobs.append((fn, text.strip()))

async def one(fn, text):
    out = f"{BOOK}/audio/{fn}"
    await edge_tts.Communicate(text, VOICE, rate="-8%").save(out)
    print(fn, os.path.getsize(out), "bytes")

async def main():
    for fn, text in jobs:
        await one(fn, text)

asyncio.run(main())
print("done", len(jobs))
