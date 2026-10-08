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
import numpy as np
from PIL import Image, ImageFilter

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
    import cv2  # Only component extraction needs OpenCV.
    rgba=chroma_alpha(rgb)
    mask=(rgba[:,:,3]>45).astype(np.uint8)
    mask=cv2.morphologyEx(mask,cv2.MORPH_OPEN,np.ones((2,2),np.uint8))
    n,labels,stats,_=cv2.connectedComponentsWithStats(mask,8)
    comps=[]
    for i in range(1,n):
        x,y,w,h,area=stats[i]
        if area>250 and h>20 and w>20:
            comps.append((area,i,x,y,w,h))
    if not comps:
        raise RuntimeError("No usable foreground component found")
    main=max(comps)
    main_area,main_i,x,y,w,h=main

    # Preserve the main figure plus only materially-sized detached equipment.
    # This rejects pose labels, neighboring-cell fragments and chroma debris.
    keep=np.zeros_like(mask,dtype=np.uint8)
    keep[labels==main_i]=1
    for area,i,cx,cy,cw,ch in comps:
        if i==main_i:
            continue
        if area/main_area>=0.05:
            keep[labels==i]=1
    rgba[:,:,3]=(rgba[:,:,3]*keep).astype(np.uint8)

    ys,xs=np.where(rgba[:,:,3]>20)
    if not len(xs):
        raise RuntimeError("Foreground disappeared during cleanup")
    x0=max(0,int(xs.min())-4); y0=max(0,int(ys.min())-4)
    x1=min(mask.shape[1],int(xs.max())+5); y1=min(mask.shape[0],int(ys.max())+5)
    return Image.fromarray(rgba,"RGBA").crop((x0,y0,x1,y1))

def add_outline(im: Image.Image) -> Image.Image:
    """Add one-pixel dark outer ink so all fighters survive 40–60 px runtime scale."""
    alpha=im.getchannel("A")
    dilated=alpha.filter(ImageFilter.MaxFilter(3))
    a=np.asarray(alpha,dtype=np.int16)
    d=np.asarray(dilated,dtype=np.int16)
    ring=np.clip(d-a,0,225).astype(np.uint8)
    stroke=Image.new("RGBA",im.size,(22,26,29,0))
    stroke.putalpha(Image.fromarray(ring))
    return Image.alpha_composite(stroke,im)

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
        out=add_outline(out)
        out.save(args.output/f"{pose}.webp","WEBP",lossless=True,method=6)

    if args.duplicate_hit_as_defeat:
        Image.open(args.output/"hit.webp").save(
            args.output/"defeat.webp","WEBP",lossless=True,method=6
        )

if __name__=="__main__":
    main()
