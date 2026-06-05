import cv2, numpy as np
from PIL import Image

def load_raw(src):
    im = Image.open(src)
    raw = Image.new(im.mode, im.size); raw.putdata(list(im.getdata()))
    return cv2.cvtColor(np.array(raw.convert('RGB')), cv2.COLOR_RGB2BGR)

def warp(img, quad):
    quad = np.array(quad, dtype="float32")  # tl,tr,br,bl
    tl,tr,br,bl = quad
    W = int(max(np.linalg.norm(br-bl), np.linalg.norm(tr-tl)))
    H = int(max(np.linalg.norm(tr-br), np.linalg.norm(tl-bl)))
    dst = np.array([[0,0],[W-1,0],[W-1,H-1],[0,H-1]], dtype="float32")
    M = cv2.getPerspectiveTransform(quad, dst)
    return cv2.warpPerspective(img, M, (W,H))

def enhance(img):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l,a,b = cv2.split(lab)
    l = cv2.createCLAHE(1.5,(8,8)).apply(l)
    out = cv2.cvtColor(cv2.merge((l,a,b)), cv2.COLOR_LAB2BGR)
    return cv2.convertScaleAbs(out, alpha=1.06, beta=12)

jobs = [
  ("KakaoTalk_20260605_143533751.jpg",
   [[292,205],[3435,108],[3500,2092],[300,2150]], "amusement_corrected.jpg"),
  ("KakaoTalk_20260605_143533751_01.jpg",
   [[150,90],[3360,45],[3395,2138],[128,2168]], "camping_corrected.jpg"),
]
for src,quad,out in jobs:
    img = load_raw(src)
    w = enhance(warp(img, quad))
    cv2.imwrite(out, w, [cv2.IMWRITE_JPEG_QUALITY,95])
    # small preview
    cv2.imwrite("prev_"+out, cv2.resize(w,(w.shape[1]//4,w.shape[0]//4)))
    print(out, w.shape[1],"x",w.shape[0])
