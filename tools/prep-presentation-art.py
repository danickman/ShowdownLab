#!/usr/bin/env python3
"""Recover canonical menu detail from approved originals; leave battle poses intact."""
import io
import importlib.util
import json
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('sheet', ROOT / 'tools/prep-authored-sheet.py')
sheet = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sheet)

def main():
    crops = json.loads((ROOT / 'tools/art-sources/presentation-crops.json').read_text())
    for fighter, entry in crops.items():
        source = Image.open(ROOT / entry['source']).convert('RGB')
        rgb = np.asarray(source.crop(entry['crop']))
        pixels = sheet.chroma_alpha(rgb)
        if fighter == 'goose':
            # Detached sketch grass is scenery, not part of the canonical silhouette.
            from scipy.ndimage import label, binary_dilation
            labels, count = label(pixels[:, :, 3] > 45)
            areas = np.bincount(labels.ravel()); areas[0] = 0
            keep = binary_dilation(labels == areas.argmax(), iterations=2)
            pixels[:, :, 3][~keep] = 0
        if fighter == 'knight':
            # This older sheet uses yellow-green, unlike the pure-green newer sheets.
            r, g, b = rgb.astype(float).transpose(2, 0, 1)
            pixels[:, :, 3][(g > 150) & (g > r * 1.3) & (g > b * 1.6)] = 0
            spill = (g > r * 1.12) & (g > b * 1.12)
            pixels[:, :, 1][spill] = np.maximum(r, b)[spill].astype('uint8')
        rgba = Image.fromarray(pixels)
        # Hand-reviewed crops contain one complete figure and no labels/neighbor poses.
        out = sheet.add_outline(sheet.normalize(rgba, canvas=512, content=464, bottom=entry['bottom']))
        bounds = out.getchannel('A').getbbox()
        assert bounds and min(bounds[:2]) > 0 and max(bounds[2:]) < 512, (fighter, bounds)
        target = ROOT / f'v3/assets/authored/{fighter}/presentation.webp'
        buffer = io.BytesIO()
        out.save(buffer, 'WEBP', lossless=True, method=6)
        target.write_bytes(buffer.getvalue())
        print(f'{fighter}: alpha={bounds}, {target.stat().st_size} bytes')

if __name__ == '__main__':
    main()
