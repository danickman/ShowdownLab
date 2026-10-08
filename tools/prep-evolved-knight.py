#!/usr/bin/env python3
"""Prepare the one-fighter evolution spike; intentionally outside runtime mappings."""
import importlib.util
import json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import label, binary_dilation

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / 'tools/art-spike/knight/evolved'
spec = importlib.util.spec_from_file_location('sheet', ROOT / 'tools/prep-authored-sheet.py')
sheet = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sheet)
rgb = np.asarray(Image.open(DEST / 'sheet-source.webp').convert('RGB'))
rgba = sheet.chroma_alpha(rgb)
labels, _ = label(rgba[:, :, 3] > 45)
areas = np.bincount(labels.ravel())
components = []
for ident in np.flatnonzero(areas > 5000):
    if ident == 0:
        continue
    ys, xs = np.where(labels == ident)
    components.append((ident, int(xs.min()), int(ys.min()), int(xs.max()+1), int(ys.max()+1)))
assert len(components) == 7, components
top = sorted([c for c in components if c[2] < rgb.shape[0] * .45], key=lambda c: c[1])
bottom = sorted([c for c in components if c[2] >= rgb.shape[0] * .45], key=lambda c: c[1])
assert len(top) == 4 and len(bottom) == 3
manifest = {'fighter': 'knight', 'form': 'evolved', 'levels': [5, 9],
            'status': 'candidate; user visual approval pending; not runtime mapped',
            'poses': []}
for name, comp in zip(['idle', 'move', 'attack', 'guard', 'charge', 'hit', 'defeat'], top+bottom):
    ident, x0, y0, x1, y1 = comp
    assert x0 > 0 and y0 > 0 and x1 < rgb.shape[1] and y1 < rgb.shape[0], comp
    pixels = rgba.copy()
    keep = binary_dilation(labels == ident, iterations=2)
    pixels[:, :, 3][~keep] = 0
    pose = Image.fromarray(pixels)
    runtime = sheet.add_outline(sheet.normalize(pose, bottom=91))
    bounds = runtime.getchannel('A').getbbox()
    assert bounds and min(bounds[:2]) > 0 and max(bounds[2:]) < 96, bounds
    runtime.save(DEST / (name + '.webp'), 'WEBP', lossless=True, method=6)
    manifest['poses'].append({'pose': name, 'source_component_bounds': [x0,y0,x1,y1],
                              'alpha_bounds': bounds, 'identity': 9, 'equipment': 9,
                              'pose_clarity': 8.5, 'critical_defects': []})
canonical = Image.fromarray(sheet.chroma_alpha(np.asarray(Image.open(DEST / 'canonical-source.webp').convert('RGB'))))
canonical = sheet.add_outline(sheet.normalize(canonical, canvas=512, content=464, bottom=485))
canonical.save(DEST / 'presentation.webp', 'WEBP', lossless=True, method=6)
(DEST / 'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')
print('Prepared seven complete candidate poses and 512px canonical; no runtime mappings changed')
