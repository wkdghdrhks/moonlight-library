# -*- coding: utf-8 -*-
"""책 이미지를 가로 1400px JPEG(q82)로 압축. 원본 png 는 _originals/ 로 백업(배포 제외).
book.json 의 image 경로와 library.json 의 cover 경로를 .png -> .jpg 로 갱신."""
import json, os, shutil
from PIL import Image

REPO = r"C:\DongHwa\moonlight-library"
BOOKSDIR = os.path.join(REPO, "books")
BACKUP = os.path.join(REPO, "_originals")
BOOKS = ["01-moonlight-library", "02-acorn-village-rescue", "03-bell-tower-yeonwoo"]
MAXW = 1400
Q = 82

def compress_one(png_path, jpg_path):
    im = Image.open(png_path).convert("RGB")
    if im.width > MAXW:
        h = round(im.height * MAXW / im.width)
        im = im.resize((MAXW, h), Image.LANCZOS)
    im.save(jpg_path, "JPEG", quality=Q, optimize=True, progressive=True)

before = after = 0
for slug in BOOKS:
    img_dir = os.path.join(BOOKSDIR, slug, "images")
    if not os.path.isdir(img_dir):
        continue
    bdir = os.path.join(BACKUP, slug, "images")
    os.makedirs(bdir, exist_ok=True)
    pngs = [f for f in os.listdir(img_dir) if f.lower().endswith(".png")]
    for f in pngs:
        src = os.path.join(img_dir, f)
        jpg = os.path.join(img_dir, f[:-4] + ".jpg")
        before += os.path.getsize(src)
        compress_one(src, jpg)
        after += os.path.getsize(jpg)
        shutil.move(src, os.path.join(bdir, f))  # 원본 백업(배포 제외)
    # book.json image 경로 갱신
    bjson = os.path.join(BOOKSDIR, slug, "book.json")
    with open(bjson, encoding="utf-8") as fp:
        data = json.load(fp)
    for p in data.get("pages", []):
        if isinstance(p.get("image"), str) and p["image"].lower().endswith(".png"):
            p["image"] = p["image"][:-4] + ".jpg"
    with open(bjson, "w", encoding="utf-8") as fp:
        json.dump(data, fp, ensure_ascii=False, indent=2)
    print(f"[ok] {slug}: {len(pngs)} 장 압축")

# library.json cover 경로 갱신
lib = os.path.join(BOOKSDIR, "library.json")
with open(lib, encoding="utf-8") as fp:
    ldata = json.load(fp)
for b in ldata.get("books", []):
    if isinstance(b.get("cover"), str) and b["cover"].lower().endswith(".png"):
        b["cover"] = b["cover"][:-4] + ".jpg"
with open(lib, "w", encoding="utf-8") as fp:
    json.dump(ldata, fp, ensure_ascii=False, indent=2)

print(f"=== 압축 완료: {before/1024/1024:.1f}MB -> {after/1024/1024:.1f}MB ===")
