import cv2, numpy as np, glob, os, sys
from PIL import Image

def load_raw_bgr(path):
    im = Image.open(path)
    raw = Image.new(im.mode, im.size); raw.putdata(list(im.getdata()))
    return cv2.cvtColor(np.array(raw.convert('RGB')), cv2.COLOR_RGB2BGR)

def detect_bbox(img):
    """Crop by excluding background = dark carpet + pink binder sleeve.
    Use row/column foreground profiles for a robust axis-aligned box."""
    h, w = img.shape[:2]
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    H,S,V = hsv[:,:,0].astype(int), hsv[:,:,1].astype(int), hsv[:,:,2].astype(int)
    dark = V < 105
    pink = (((H>=150)&(H<=180)) | (H<=9)) & (S>=22) & (S<=150) & (V>135)
    fg = (~dark & ~pink).astype(np.uint8)
    fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((9,9),np.uint8))
    fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, np.ones((35,35),np.uint8))
    col = fg.mean(axis=0); row = fg.mean(axis=1)
    cth, rth = 0.35, 0.35
    xs = np.where(col > cth)[0]; ys = np.where(row > rth)[0]
    if len(xs) < 10 or len(ys) < 10: return None
    x0,x1,y0,y1 = xs.min(), xs.max(), ys.min(), ys.max()
    if (x1-x0) < 0.4*w or (y1-y0) < 0.4*h: return None
    return (int(x0), int(y0), int(x1), int(y1))

def crop_box(img, box):
    x0,y0,x1,y1 = box
    return img[y0:y1, x0:x1]

def enhance(img):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l,a,b = cv2.split(lab)
    l = cv2.createCLAHE(1.4,(8,8)).apply(l)
    out = cv2.cvtColor(cv2.merge((l,a,b)), cv2.COLOR_LAB2BGR)
    return cv2.convertScaleAbs(out, alpha=1.05, beta=8)

if __name__ == '__main__':
    files = sorted(glob.glob('ywoo/Horizontal/KakaoTalk_*.jpg'))
    sel = sys.argv[1:] or [str(i) for i in range(len(files))]
    sel = [int(s) for s in sel]
    os.makedirs('ywoo/Horizontal/corrected', exist_ok=True)
    for i in sel:
        f = files[i]
        img = load_raw_bgr(f)
        box = detect_bbox(img)
        if box is None:
            out = img; status='NOBOX'
        else:
            out = enhance(crop_box(img, box)); status='ok'
        op = f'ywoo/Horizontal/corrected/art_{i:02d}.jpg'
        cv2.imwrite(op, out, [cv2.IMWRITE_JPEG_QUALITY,92])
        print(i, status, out.shape[1],'x',out.shape[0])
