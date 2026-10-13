// Linux x64 fallback when the Chrome download route is unavailable.
// npm install --prefix tools/qa && node tools/qa/setup-browser.cjs
const fs=require('fs'),path=require('path'),z=require('zlib'),cp=require('child_process');
const root=path.join(__dirname,'.runtime'),bin=path.resolve(path.dirname(require.resolve('@sparticuz/chromium')),'../bin');
fs.mkdirSync(root,{recursive:true});
const browser=path.join(root,'chromium');
if(!fs.existsSync(browser)||!fs.statSync(browser).size){fs.writeFileSync(browser,z.brotliDecompressSync(fs.readFileSync(path.join(bin,'chromium.br'))));fs.chmodSync(browser,0o755)}
for(const name of ['fonts','swiftshader']){const dir=path.join(root,name);fs.mkdirSync(dir,{recursive:true});cp.execFileSync('tar',['xf','-','--no-same-owner','-C',dir],{input:z.brotliDecompressSync(fs.readFileSync(path.join(bin,name+'.tar.br')))})}
console.log('Browser prepared:',browser);
console.log('Run: NODE_PATH=tools/qa/node_modules QA_BROWSER_PATH='+browser+' QA_ENFORCE_OPENING=1 node tools/check-phone-browser.cjs local ../phone-review');
