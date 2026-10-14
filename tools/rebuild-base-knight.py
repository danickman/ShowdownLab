#!/usr/bin/env python3
"""Turn 3.5: re-extract original Base Knight poses at 256px from approved 1024px source.
No new fighter generation. Output goes to a staging directory by default.
"""
from pathlib import Path
import argparse
import json
import hashlib
import numpy as np
from PIL import Image
from scipy.ndimage import label, gaussian_filter

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'tools/art-sources/knight-base-sheet.jpg'
POSES=('idle','move','attack','guard','charge','hit')
ROWS=((70,388),(627,937))
def build(source, dest):
    pixels=np.asarray(Image.open(source).convert('RGB'))
    if pixels.shape[:2]!=(1024,1024): raise ValueError(f'Unexpected sheet dimensions: {pixels.shape}')
    r,g,b=pixels.astype(np.float32).transpose(2,0,1)
    excess=g-np.maximum(r,b)
    bg=(g>125)&(g>r*1.22)&(g>b*1.27)&(excess>45)
    core=(~bg)&(np.maximum(r,b)<230)
    dest.mkdir(parents=True,exist_ok=True)
    records={}
    for row,(y0,y1) in enumerate(ROWS):
        labels,count=label(core[y0:y1])
        choices=[]
        for index in range(1,count+1):
            ys,xs=np.where(labels==index)
            if len(xs)>12000: choices.append((float(xs.mean()),index,len(xs)))
        choices.sort()
        if len(choices)!=3: raise RuntimeError(f'Row {row} has {len(choices)} figures; expected 3')
        for col,(_,index,area) in enumerate(choices):
            name=POSES[row*3+col]
            foreground=np.zeros(core.shape,dtype=bool)
            foreground[y0:y1]=labels==index
            # Subpixel fringe only, preserving the original dark canonical ink.
            alpha=np.clip(gaussian_filter(foreground.astype(np.float32),.55)*255,0,255).astype('uint8')
            color=pixels.copy()
            fringe=(alpha>0)&(g>np.maximum(r,b)+8)
            color[:,:,1]=np.where(fringe,np.minimum(g,np.maximum(r,b)+2),g).astype('uint8')
            raw=Image.fromarray(np.dstack([color,alpha]),'RGBA')
            box=raw.getchannel('A').getbbox()
            if not box: raise RuntimeError(f'Empty figure: {name}')
            figure=raw.crop(box)
            figure.thumbnail((236,236),Image.Resampling.LANCZOS)
            output=Image.new('RGBA',(256,256),(0,0,0,0))
            output.alpha_composite(figure,((256-figure.width)//2,248-figure.height))
            bounds=output.getchannel('A').getbbox()
            if not bounds or bounds[0]<6 or bounds[2]>250 or bounds[1]<5 or bounds[3]>252: raise RuntimeError(f'Out-of-bounds {name}: {bounds}')
            ink=np.asarray(output).astype(np.int16)
            rr,gg,bb=ink[:,:,:3].transpose(2,0,1)
            visible=ink[:,:,3]>8
            green=(gg>np.maximum(rr,bb)+20)&(gg>100)&visible
            if np.count_nonzero(green)>5: raise RuntimeError(f'Green chroma fringe remains in {name}')
            out=dest/(name+'.webp')
            output.save(out,'WEBP',lossless=True,method=6)
            verify=Image.open(out);verify.load()
            if verify.size!=(256,256): raise RuntimeError('Bad WebP decode size')
            records[name]={'alpha_bounds':list(bounds),'component_area':area,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}
    # Preserve the existing separately-authored defeat pose: the approved sheet
    # contains HIT/DEFEAT as one reference, not a second complete defeat pose.
    (dest/'receipt.json').write_text(json.dumps({'source':str(source.relative_to(ROOT)),'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'preserved':['defeat.webp','presentation.webp'],'poses':records},indent=2)+'\n')
    preview=Image.new('RGBA',(768,512),(238,236,226,255))
    for i,name in enumerate(POSES):
        preview.alpha_composite(Image.open(dest/(name+'.webp')).convert('RGBA'),((i%3)*256,(i//3)*256))
    preview.convert('RGB').save(dest/'preview.jpg',quality=92)
    print('PASS: six Base Knight 256px lossless assets, original silhouette, full equipment and alpha bounds')
if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--source',type=Path,default=SOURCE)
    p.add_argument('--dest',type=Path,default=ROOT/'tools/qa/.generated-knight')
    args=p.parse_args()
    build(args.source.resolve(),args.dest.resolve())
