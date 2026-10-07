#!/usr/bin/env python3
"""Prepare Showdown Lab authored sprite sheets for runtime.

Input sheets are chroma-green JPEG/PNG references. This utility:
- isolates the largest figure in each configured cell
- converts #39FF14-style green to true alpha
- reduces green spill on antialiased edges
- normalizes each pose to a 96x96 transparent WebP canvas
- preserves a common bottom/ground anchor

This is intentionally asset-only. It does not modify combat logic.
"""
from __future__ import annotations
import argparse
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

POSES_7 = ("idle","move","attack","guard","signature","hit","defeat")
POSES_6 = ("idle","move","attack","guard","signature","hit")

def chroma_alpha(rgb: np.ndarray) -> np.ndarray:
    px=rgb.astype(np.float32)
    r,g,b=px[:,:,0],px[:,:,1],px[:,:,2]
    excess=g-np.maximum(r,b)
    alpha=np.clip((95.0-excess)/55.0,0,1)
    keyable=(g>100)&(g>r*1.12)&(g>b*1.12)
    alpha=np.where(keyable,alpha,1.0)
    edge=alpha<0.98
    maxrb=np.maximum(r,b)
    px[:,:,1]=np.where(edge,np.minimum(g,maxrb+18),g)
    return np.dstack([px,alpha*255]).astype(np.uint8)

def extract_main(rgb: np.ndarray) -> Image.Image:
    rgba=chroma_alpha(rgb)
    mask=(rgba[:,:,3]>45).astype(np.uint8)*255
    mask=cv2.morphologyEx(mask,cv2.MORPH_OPEN,np.ones((2,2),np.uint8))
    n,_,stats,_=cv2.connectedComponentsWithStats(mask,8)
    comps=[]
    for i in range(1,n):
        x,y,w,h,area=stats[i]
        if area>250 and h>20 and w>20:
            comps.append((area,x,y,w,h))
    if not comps:
        raise RuntimeError("No usable foreground component found")
    _,x,y,w,h=max(comps)
    pad=max(4,round(max(w,h)*0.04))
    x0=max(0,x-pad); y0=max(0,y-pad)
    x1=min(mask.shape[1],x+w+pad); y1=min(mask.shape[0],y+h+pad)
    return Image.fromarray(rgba,"RGBA").crop((x0,y0,x1,y1))

def normalize(im: Image.Image, canvas: int=96, content: int=88, bottom: int=91) -> Image.Image:
    a=np.asarray(im)[:,:,3]
    ys,xs=np.where(a>30)
    if not len(xs):
        raise RuntimeError("Pose became empty after chroma cleanup")
    im=im.crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1))
    w,h=im.size
    scale=min(content/w,content/h)
    nw=max(1,round(w*scale)); nh=max(1,round(h*scale))
    im=im.resize((nw,nh),Image.Resampling.LANCZOS)
    out=Image.new("RGBA",(canvas,canvas),(0,0,0,0))
    x=(canvas-nw)//2
    y=max(0,min(canvas-nh,bottom-nh))
    out.alpha_composite(im,(x,y))
    return out

def default_cells(width: int, height: int, layout: str):
    if layout=="4+3":
        x4=[round(i*width/4) for i in range(5)]
        x3=[round(i*width/3) for i in range(4)]
        top=[(x4[i],0,x4[i+1],round(height*.53)) for i in range(4)]
        bot=[(x3[i],round(height*.52),x3[i+1],height) for i in range(3)]
        return top+bot
    if layout=="3+3":
        x3=[round(i*width/3) for i in range(4)]
        top=[(x3[i],0,x3[i+1],round(height*.52)) for i in range(3)]
        bot=[(x3[i],round(height*.48),x3[i+1],height) for i in range(3)]
        return top+bot
    raise ValueError(layout)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("sheet",type=Path)
    ap.add_argument("output",type=Path)
    ap.add_argument("--layout",choices=("4+3","3+3"),default="4+3")
    ap.add_argument("--duplicate-hit-as-defeat",action="store_true")
    args=ap.parse_args()

    src=Image.open(args.sheet).convert("RGB")
    cells=default_cells(*src.size,args.layout)
    poses=POSES_7 if args.layout=="4+3" else POSES_6
    args.output.mkdir(parents=True,exist_ok=True)

    for pose,box in zip(poses,cells):
        crop=np.asarray(src.crop(box))
        out=normalize(extract_main(crop))
        out.save(args.output/f"{pose}.webp","WEBP",lossless=True,method=6)

    if args.duplicate_hit_as_defeat:
        Image.open(args.output/"hit.webp").save(
            args.output/"defeat.webp","WEBP",lossless=True,method=6
        )

if __name__=="__main__":
    main()
