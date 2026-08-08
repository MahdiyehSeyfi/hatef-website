import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcRoot = path.join(root, "src");

const publicSpecialExceptions = [
  "about-journey__navigation-item",
  "about-statistics-section__item",
  "partner-statistic",
  "__overlay",
  "__view-button",
  "submenu",
  "site-header__menu-link::after",
  "documents-quick-access__card:hover::",
  "about-organization__link:hover::before",
  "documents-quick-access__icon",
  "partner-logos",
  "call-overlay-content",
  "current-fields-page__call-overlay-content",
];

const visualProps = new Set([
  "color",
  "background",
  "background-color",
  "border-color",
  "box-shadow",
  "transform",
  "filter",
]);

function walk(dir, ext) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...walk(full, ext));
    else if (full.endsWith(ext)) result.push(full);
  }
  return result;
}
function rel(file) { return path.relative(root, file).replaceAll("\\", "/"); }
function parseDeclarations(body) {
  return body.split(";").map((part)=>part.trim()).filter(Boolean).map((part)=>{
    const index=part.indexOf(":");
    if(index===-1) return null;
    return {prop:part.slice(0,index).trim(),value:part.slice(index+1).trim()};
  }).filter(Boolean);
}
function hasRawVisualValue(prop,value){
  if(!visualProps.has(prop)) return false;
  if(prop==="box-shadow"||prop==="filter") return !value.startsWith("var(")&&value!=="none";
  return /#[0-9a-fA-F]{3,8}/.test(value)||/rgba?\(/.test(value)||/hsla?\(/.test(value)||
    /translate[XY]?\(\s*-?\d/.test(value)||/scale\(\s*\d/.test(value);
}
const cssFiles=walk(srcRoot,".css");
const raw=[]; const family=[];
let publicHover=0,dashboardHover=0,exceptions=0;
for(const file of cssFiles){
  const relative=rel(file);
  const dashboard=relative.includes("/pages/dashboard/");
  const shared=relative.includes("/components/ui/");
  const utility=relative.endsWith("/styles/interactions.css");
  const text=fs.readFileSync(file,"utf8");
  const ruleRe=/([^{}]+)\{([^{}]*)\}/g;
  for(const match of text.matchAll(ruleRe)){
    const selector=match[1].replace(/\s+/g," ").trim();
    if(!selector.includes(":hover")) continue;
    if(dashboard){ dashboardHover+=1; continue; }
    publicHover+=1;
    const body=match[2];
    const declarations=parseDeclarations(body);
    const special=publicSpecialExceptions.some((token)=>selector.includes(token));
    if(special){ exceptions+=1; continue; }
    if(!shared&&!utility){
      if(declarations.some(({prop,value})=>hasRawVisualValue(prop,value))) raw.push({file:relative,selector});
      for(const {prop,value} of declarations){
        if(!visualProps.has(prop)) continue;
        const mutation=prop==="color"||prop==="background"||prop==="background-color"||prop==="border-color"||
          prop==="box-shadow"||prop==="filter"||value.includes("translate")||value.includes("scale");
        if(mutation&&!value.includes("var(--interaction-")&&!value.includes("var(--text-inverse)")&&
          !value.includes("var(--color-white)")&&!value.includes("var(--color-brand-950)")&&value!=="none"){
          family.push({file:relative,selector,prop,value});
        }
      }
    }
  }
}
console.log("Hatef Interaction Audit");
console.log("=======================");
console.log(`Public :hover blocks: ${publicHover}`);
console.log(`Dashboard :hover blocks (deferred Phase 12): ${dashboardHover}`);
console.log(`Documented specialized public hover blocks: ${exceptions}`);
console.log(`Raw visual hover violations: ${raw.length}`);
console.log(`Non-semantic interaction-token violations: ${family.length}`);
if(raw.length){ console.log("\nRaw visual hover values:"); for(const x of raw) console.log(`- ${x.file} :: ${x.selector.slice(0,150)}`); }
if(family.length){ console.log("\nNon-semantic hover declarations:"); for(const x of family) console.log(`- ${x.file} :: ${x.selector.slice(0,110)} :: ${x.prop}: ${x.value}`); }
process.exit(raw.length||family.length?1:0);
