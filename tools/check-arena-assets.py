#!/usr/bin/env python3
"""Decode runtime arena assets and reject empty exports before publication."""
from pathlib import Path
from PIL import Image
paths=list((Path(__file__).resolve().parents[1]/'v3/assets/arenas').rglob('*.webp'))
assert paths
for path in paths:
 assert path.stat().st_size>100,path
 with Image.open(path) as image:
  image.load()
  assert min(image.size)>=256,path
  assert max(image.size)<=2048,path
print(f'PASS: {len(paths)} arena images decode; dimensions and payloads bounded')
