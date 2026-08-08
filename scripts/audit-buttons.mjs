import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcRoot = path.join(root, "src");

const forbiddenButton = new Set([
  "width", "min-width", "max-width",
  "height", "min-height", "padding", "padding-inline", "padding-block",
  "color", "background", "background-color", "border", "border-color",
  "border-radius", "box-shadow", "font-size", "font-weight", "font-family",
  "opacity", "cursor", "transition", "transform"
]);

const forbiddenIconButton = new Set([
  ...forbiddenButton,
  "width", "min-width", "max-width"
]);

const allowedSpecialTokens = [
  "tab", "dot", "faq", "module", "stage", "navigation-item", "framework",
  "report-tab", "pagination", "page--", "roadmap", "accordion", "filter",
  "step", "toggle", "switch", "menu-item", "carousel-dot"
];

function walk(dir, ext) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...walk(full, ext));
    else if (full.endsWith(ext)) result.push(full);
  }
  return result;
}

function rel(file) {
  return path.relative(root, file).replaceAll("\\", "/");
}

function readOpeningTag(text, startIndex) {
  let quote = null;
  let braceDepth = 0;
  for (let i = startIndex; i < text.length; i += 1) {
    const ch = text[i];
    const prev = text[i - 1];

    if (quote) {
      if (ch === quote && prev !== "\\") quote = null;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "{") {
      braceDepth += 1;
      continue;
    }
    if (ch === "}") {
      braceDepth = Math.max(0, braceDepth - 1);
      continue;
    }

    if (ch === ">" && braceDepth === 0) {
      return text.slice(startIndex, i + 1);
    }
  }
  return "";
}

function getSharedLocalClasses(text, componentName) {
  const result = [];
  const needle = `<${componentName}`;
  let cursor = 0;

  while (true) {
    const start = text.indexOf(needle, cursor);
    if (start === -1) break;
    const tag = readOpeningTag(text, start);
    if (!tag) break;

    const match = tag.match(/className\s*=\s*"([^"]+)"/);
    if (match) {
      result.push(...match[1].split(/\s+/).filter(Boolean));
    }

    cursor = start + tag.length;
  }

  return result;
}

function getNativeButtonBlocks(text) {
  const blocks = [];
  const needle = "<button";
  let cursor = 0;

  while (true) {
    const start = text.indexOf(needle, cursor);
    if (start === -1) break;

    const opening = readOpeningTag(text, start);
    if (!opening) break;

    if (opening.trimEnd().endsWith("/>")) {
      blocks.push(opening);
      cursor = start + opening.length;
      continue;
    }

    const closeIndex = text.indexOf("</button>", start + opening.length);
    if (closeIndex === -1) {
      blocks.push(opening);
      cursor = start + opening.length;
      continue;
    }

    const end = closeIndex + "</button>".length;
    blocks.push(text.slice(start, end));
    cursor = end;
  }

  return blocks;
}

function isSpecialNativeControl(block) {
  const lower = block.toLowerCase();
  return (
    lower.includes('role="tab"') ||
    lower.includes("aria-expanded") ||
    lower.includes("aria-pressed") ||
    allowedSpecialTokens.some((token) => lower.includes(token))
  );
}

function parseDeclarations(body) {
  return body
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.match(/^([\w-]+)\s*:/)?.[1])
    .filter(Boolean);
}

const jsxFiles = walk(srcRoot, ".jsx");
const cssFiles = walk(srcRoot, ".css");
const sharedClasses = new Map();
let nativePublic = 0;
let nativeDashboards = 0;
const publicStandardRaw = [];
const publicStyledAnchorActions = [];
let publicSpecialRaw = 0;

for (const file of jsxFiles) {
  const text = fs.readFileSync(file, "utf8");
  const relative = rel(file);
  const isDashboard = relative.includes("/pages/dashboard/");
  const nativeBlocks = getNativeButtonBlocks(text);

  if (isDashboard) nativeDashboards += nativeBlocks.length;
  else nativePublic += nativeBlocks.length;

  if (!relative.includes("/components/ui/")) {
    for (const block of nativeBlocks) {
      if (isDashboard) continue;
      if (isSpecialNativeControl(block)) publicSpecialRaw += 1;
      else {
        const firstLine = block.replace(/\s+/g, " ").slice(0, 190);
        publicStandardRaw.push(`${relative} :: ${firstLine}`);
      }
    }
  }

  if (!isDashboard && !relative.includes("/components/ui/")) {
    const anchorRe = /<a\b[\s\S]*?>/g;
    for (const match of text.matchAll(anchorRe)) {
      const tag = match[0];
      const classMatch = tag.match(/className\s*=\s*(?:"([^"]+)"|\{`([^`]+)`\})/);
      const classText = (classMatch?.[1] || classMatch?.[2] || "").toLowerCase();

      if (
        classText &&
        /(button|\bcta\b|quick-link|download-action|submit-action)/.test(classText)
      ) {
        publicStyledAnchorActions.push(
          `${relative} :: ${tag.replace(/\s+/g, " ").slice(0, 190)}`,
        );
      }
    }
  }

  for (const component of ["Button", "IconButton"]) {
    for (const className of getSharedLocalClasses(text, component)) {
      if (!sharedClasses.has(className)) {
        sharedClasses.set(className, { types: new Set(), jsx: new Set() });
      }
      sharedClasses.get(className).types.add(component);
      sharedClasses.get(className).jsx.add(relative);
    }
  }
}

const violations = [];
const directSharedSelectorViolations = [];
for (const file of cssFiles) {
  const relative = rel(file);
  if (relative.includes("/components/ui/")) continue;

  const text = fs.readFileSync(file, "utf8");
  const blockRe = /([^{}]+)\{([^{}]*)\}/g;

  for (const match of text.matchAll(blockRe)) {
    const selector = match[1].trim();
    const body = match[2];

    const explicitlyExcludesSharedButton =
      selector.includes(":not(.ui-button)") ||
      selector.includes(":not(.ui-icon-button)");

    if (
      /\.ui-(?:button|icon-button)(?:__|--|\b)/.test(selector) &&
      !explicitlyExcludesSharedButton
    ) {
      const badDirect = parseDeclarations(body).filter((prop) =>
        forbiddenIconButton.has(prop) || prop === "line-height"
      );
      if (badDirect.length) {
        directSharedSelectorViolations.push({
          css: relative,
          selector,
          bad: [...new Set(badDirect)],
        });
      }
    }

    for (const [className, meta] of sharedClasses) {
      const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const classRe = new RegExp(`\\.${escaped}(?![\\w-])`);
      if (!classRe.test(selector)) continue;

      const forbidden = meta.types.has("IconButton") ? forbiddenIconButton : forbiddenButton;
      const bad = [...new Set(parseDeclarations(body).filter((prop) => forbidden.has(prop)))];
      if (bad.length) {
        violations.push({
          css: relative,
          className,
          selector,
          bad,
          jsx: [...meta.jsx],
        });
      }
    }
  }
}

console.log("Hatef Button Audit");
console.log("==================");
console.log(`Raw native buttons — public: ${nativePublic}`);
console.log(`Raw native buttons — dashboards: ${nativeDashboards}`);
console.log(`Public specialized raw controls: ${publicSpecialRaw}`);
console.log(`Public standard raw controls requiring review: ${publicStandardRaw.length}`);
console.log(`Public styled-anchor actions requiring Button review: ${publicStyledAnchorActions.length}`);
console.log(`Shared Button/IconButton local CSS violations: ${violations.length}`);
console.log(`Direct shared-primitive CSS override violations: ${directSharedSelectorViolations.length}`);

if (publicStandardRaw.length) {
  console.log("\nPublic raw controls requiring review:");
  for (const item of publicStandardRaw) console.log(`- ${item}`);
}

if (publicStyledAnchorActions.length) {
  console.log("\nStyled anchors that look like ordinary CTA buttons:");
  for (const item of publicStyledAnchorActions) console.log(`- ${item}`);
}

if (violations.length) {
  console.log("\nForbidden page-level visual overrides:");
  for (const v of violations) {
    console.log(`- .${v.className} in ${v.css}: ${v.bad.join(", ")} [${v.selector.replace(/\s+/g, " ").slice(0, 90)}]`);
  }
}

if (directSharedSelectorViolations.length) {
  console.log("\nDirect shared primitive overrides outside src/components/ui:");
  for (const v of directSharedSelectorViolations) {
    console.log(`- ${v.css}: ${v.bad.join(", ")} [${v.selector.replace(/\s+/g, " ").slice(0, 100)}]`);
  }
}

console.log("\nNote: dashboard native-control migration is tracked for Phase 12; public specialized semantic controls are intentionally not forced into Button.");
process.exit(
  violations.length ||
  directSharedSelectorViolations.length ||
  publicStandardRaw.length ||
  publicStyledAnchorActions.length
    ? 1
    : 0,
);
