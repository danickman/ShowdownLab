'use strict';
const assert=require('node:assert/strict');
// QA-only: 300-fighter 1x .70 CSS-pixel backing while 10x remains .85 and <160 remains original.
module.exports=function make(source){
const old="const __denseScale=state.units.length>=160?((state.speed||1)>=10?.85:1):Math.min(devicePixelRatio||1,2),__bw=Math.round(view.w*__denseScale),__bh=Math.round(view.h*__denseScale);";
const changed="const __denseScale=state.units.length>=160?((state.speed||1)>=10?.85:.70):Math.min(devicePixelRatio||1,2),__bw=Math.round(view.w*__denseScale),__bh=Math.round(view.h*__denseScale);";
assert.equal(source.split(old).length,2,'current live density scale changed');
const result=source.replace(old,changed);new Function(result);return result;
};
