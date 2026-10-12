#!/usr/bin/env python3
"""Repair confirmed 4+3 sheet-boundary cuts using whole-figure components."""
import importlib.util
import json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import label, binary_dilation

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('sheet', ROOT / 'tools/prep-authored-sheet.py')
sheet = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sheet)
repairs = {'goblin': ['idle','move','attack','signature'],
           'mole': ['idle','move','attack','signature','hit'],
           'beetank': ['idle','attack','signature','hit'],
           'goose': ['move','attack','guard','defeat'],
           'barbarian': ['move','attack']}
manifest = []
for fighter, selected in repairs.items():
    rgb = np.asarray(Image.open(ROOT / f'tools/art-sources/{fighter}-base-sheet.jpg').convert('RGB'))
    rgba = sheet.chroma_alpha(rgb)
    labels, n = label(rgba[:, :, 3] > 45)
    areas = np.bincount(labels.ravel())
    identifiers = sorted(range(1,n+1), key=lambda i: areas[i], reverse=True)[:7]
    components = []
    for ident in identifiers:
        ys,xs = np.where(labels == ident)
        components.append((ident,int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)))
    top = sorted([c for c in components if c[2] < rgb.shape[0]*.45], key=lambda c:c[1])
    bottom = sorted([c for c in components if c[2] >= rgb.shape[0]*.45], key=lambda c:c[1])
    assert len(top)==4 and len(bottom)==3, fighter
    for name,comp in zip(sheet.POSES_7,top+bottom):
        if name not in selected:
            continue
        ident,x0,y0,x1,y1 = comp
        assert x0>0 and y0>0 and x1<rgb.shape[1] and y1<rgb.shape[0], (fighter,name,comp)
        pixels = rgba.copy()
        keep = binary_dilation(labels == ident, iterations=2)
        pixels[:,:,3][~keep] = 0
        out = sheet.add_outline(sheet.normalize(Image.fromarray(pixels)))
        bounds = out.getchannel('A').getbbox()
        assert bounds and min(bounds[:2])>0 and max(bounds[2:])<96, (fighter,name,bounds)
        out.save(ROOT / f'v3/assets/authored/{fighter}/{name}.webp','WEBP',lossless=True,method=6)
        manifest.append({'fighter':fighter,'pose':name,'source_bounds':[x0,y0,x1,y1],'alpha_bounds':bounds})
(ROOT / 'tools/art-sources/boundary-repairs.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Repaired',len(manifest),'confirmed boundary-cut poses from approved sources')
