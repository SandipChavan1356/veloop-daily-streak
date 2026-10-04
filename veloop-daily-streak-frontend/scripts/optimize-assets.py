#!/usr/bin/env python3
"""Rebuilds public/assets/veloop/* from the official PNGs in design-source/.

  pip install pillow      (needs AVIF + WebP support)
  python3 scripts/optimize-assets.py

For every asset: crop fully-transparent margins, then export a width ladder as
AVIF (primary) + WebP (fallback). Resizing is done from the full-resolution
original with premultiplied alpha (no dark fringes). Writes
src/assets/veloop.manifest.json, which src/assets/veloop.js consumes.
"""
import json, os
from PIL import Image

SRC = 'design-source/VELoop assets'
OUT = 'public/assets/veloop'
LADDER = [128, 192, 288, 432, 640, 860]          # css px x dpr candidates
SPEC = {                                          # key: (source file, output stem)
    'coin': ('VEs_Coin.png', 'ves-coin'),
    'giftBurst': ('Day-4.png', 'day-4'),
    'giftCard': ('Day-5.png', 'day-5'),
    'crown': ('Day-7.png', 'day-7'),
    'exclusive': ('Exclusive-reward.png', 'exclusive-reward'),
    'flame': ('Flame.png', 'flame'),
    'stayActive': ('Stay_Active.png', 'stay-active'),
    'heroCrown': ('Top_right.png', 'top-right'),
    'biggerStreak': ('Bigger_Streak.png', 'bigger-streak'),
    # Mobile_Hero.png is intentionally not exported: it bakes in headline copy the UI no longer uses.
}
os.makedirs(OUT, exist_ok=True)
manifest, total = {}, 0
for key, (fname, stem) in SPEC.items():
    im = Image.open(f'{SRC}/{fname}').convert('RGBA')
    bbox = im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    if bbox: im = im.crop(bbox)
    nat_w, nat_h = im.size
    widths = sorted({w for w in LADDER if w < nat_w} | {min(nat_w, LADDER[-1])})
    for w in widths:
        h = round(nat_h * w / nat_w)
        r = im.resize((w, h), Image.LANCZOS)
        r.save(f'{OUT}/{stem}-{w}.webp', 'WEBP', quality=86, method=6, alpha_quality=95)
        r.save(f'{OUT}/{stem}-{w}.avif', 'AVIF', quality=58, speed=5, subsampling='4:4:4')
        total += os.path.getsize(f'{OUT}/{stem}-{w}.webp') + os.path.getsize(f'{OUT}/{stem}-{w}.avif')
    top = widths[-1]
    manifest[key] = {'stem': stem, 'w': top, 'h': round(nat_h * top / nat_w), 'widths': widths}
    print(f'{key:13s} {nat_w}x{nat_h} -> {widths}')
json.dump(manifest, open('src/assets/veloop.manifest.json', 'w'), indent=1)
print('ladder total on disk:', total // 1024, 'KB')
