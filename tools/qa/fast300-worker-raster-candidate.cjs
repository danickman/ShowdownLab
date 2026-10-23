'use strict';
const assert=require('node:assert/strict');
// QA-only extreme-density raster trial: preserve unchanged 10x .85 scale, compare 300 1x .75 vs 1.0.
module.exports=function make(source){
const before="const __denseScale=state.units.length>=160?((state.speed||1)>=10?.85:1):Math.min(devicePixelRatio||1,2),__bw=Math.round(view.w*__denseScale),__bh=Math.round(view.h*__denseScale);";
const after="const __denseScale=state.units.length>=160?((state.speed||1)>=10?.85:.75):Math.min(devicePixelRatio||1,2),__bw=Math.round(view.w*__denseScale),__bh=Math.round(view.h*__denseScale);";
assert.equal(source.split(before).length,2,'playable authored canvas scale moved');
const result=source.replace(before,after);
new Function(result);return result;
};
