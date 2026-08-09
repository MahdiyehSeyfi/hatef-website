import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dashboardPagesDir = path.join(root, "src", "pages", "dashboard");
const dashboardComponentsDir = path.join(root, "src", "components", "dashboard");

function walk(dir, extensions) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath, extensions);
    return extensions.some((extension) => entry.name.endsWith(extension)) ? [fullPath] : [];
  });
}

function countMatches(text, regex) {
  return [...text.matchAll(regex)].length;
}

function declarationValues(text, property) {
  const regex = new RegExp(`^\\s*${property}\\s*:\\s*([^;]+);`, "gm");
  return [...text.matchAll(regex)].map((match) => match[1].trim());
}

function standardNativeInputs(text) {
  const tags = [...text.matchAll(/<input\b[^>]*>/gs)].map((match) => match[0]);
  return tags.filter((tag) => {
    const type = tag.match(/type="([^"]+)"/)?.[1] || "text";
    return ["text", "email", "password", "number", "search", "tel", "url"].includes(type);
  }).length;
}

const jsxFiles = walk(dashboardPagesDir, [".jsx"]);
const cssFiles = walk(dashboardPagesDir, [".css"]);
const sharedCssFiles = walk(dashboardComponentsDir, [".css"]);

const jsxText = jsxFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
const cssText = cssFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");

const nativeButtons = countMatches(jsxText, /<button\b/g);
const selects = countMatches(jsxText, /<select\b/g);
const hoverBlocks = countMatches(cssText, /[^{}]+:hover[^{}]*\{/g);
const importantCount = countMatches(cssText, /!important/g);
const rawHexValues = new Set(cssText.match(/#[0-9a-fA-F]{3,8}\b/g) || []);

const sharedViolations = [];
for (const file of sharedCssFiles) {
  const text = fs.readFileSync(file, "utf8");
  const relative = path.relative(root, file);

  if (/#[0-9a-fA-F]{3,8}\b/.test(text)) {
    sharedViolations.push(`${relative}: raw hex color`);
  }

  for (const value of declarationValues(text, "box-shadow")) {
    if (!value.includes("var(") && value !== "none") {
      sharedViolations.push(`${relative}: literal box-shadow`);
    }
  }

  for (const value of declarationValues(text, "border-radius")) {
    if (!value.includes("var(") && !value.includes("calc(")) {
      sharedViolations.push(`${relative}: literal border-radius`);
    }
  }
}

const reviewerVisualViolations = [];
const reviewerCssPath = path.join(dashboardPagesDir, "ReviewerDashboardPage.css");
if (fs.existsSync(reviewerCssPath)) {
  const reviewerCss = fs.readFileSync(reviewerCssPath, "utf8");

  if (/#[0-9a-fA-F]{3,8}\b/.test(reviewerCss)) {
    reviewerVisualViolations.push("Reviewer: raw hex color remains in page CSS");
  }

  if (/!important/.test(reviewerCss)) {
    reviewerVisualViolations.push("Reviewer: !important remains in page CSS");
  }

  for (const value of declarationValues(reviewerCss, "box-shadow")) {
    reviewerVisualViolations.push(`Reviewer: page-owned box-shadow (${value})`);
  }

  for (const value of declarationValues(reviewerCss, "border-radius")) {
    if (!value.includes("var(")) {
      reviewerVisualViolations.push(`Reviewer: literal border-radius (${value})`);
    }
  }

  const forbiddenReviewerVisualSelectors = [
    ".reviewer-dashboard__panel",
    ".reviewer-dashboard__stat-card",
    ".reviewer-dashboard__status--",
    ".reviewer-dashboard__profile-card",
    ".reviewer-dashboard__search input",
    ".reviewer-dashboard__page-size select",
    ".reviewer-dashboard__folder-tag--",
  ];

  for (const selector of forbiddenReviewerVisualSelectors) {
    if (reviewerCss.includes(selector)) {
      reviewerVisualViolations.push(`Reviewer: legacy shared-role selector remains (${selector})`);
    }
  }
}


const canonicalFeatureViolations = [];
const innovatorPath = path.join(dashboardPagesDir, "InnovatorDashboardPage.jsx");
if (fs.existsSync(innovatorPath)) {
  const innovatorText = fs.readFileSync(innovatorPath, "utf8");

  const requiredSharedFeatures = [
    "DashboardShell",
    "DashboardNotificationMenu",
    "DashboardProfileMenu",
    "DashboardProfileView",
    "DashboardProfileEdit",
    "DashboardSupportRequests",
    "DashboardMessages",
    "DashboardFAQ",
  ];

  for (const feature of requiredSharedFeatures) {
    if (!innovatorText.includes(`<${feature}`)) {
      canonicalFeatureViolations.push(`Innovator reference no longer consumes ${feature}`);
    }
  }

  const forbiddenLocalFeatureFunctions = [
    "function SupportRequestsPanel",
    "function MessagesPanel",
    "function FaqPanel",
    "function ProfilePanel",
    "function ProfileEditPanel",
    "function DashboardDateTime",
  ];

  for (const marker of forbiddenLocalFeatureFunctions) {
    if (innovatorText.includes(marker)) {
      canonicalFeatureViolations.push(`Innovator still owns extracted feature implementation: ${marker}`);
    }
  }
}


const reviewerCanonicalFeatureViolations = [];
const reviewerPath = path.join(dashboardPagesDir, "ReviewerDashboardPage.jsx");
if (fs.existsSync(reviewerPath)) {
  const reviewerText = fs.readFileSync(reviewerPath, "utf8");
  const reviewerRequiredFeatures = [
    "DashboardShell",
    "DashboardNotificationMenu",
    "DashboardProfileMenu",
    "DashboardProfileView",
    "DashboardProfileEdit",
    "DashboardSupportRequests",
    "DashboardMessages",
    "DashboardFAQ",
    "DashboardReviewFolderCard",
    "DashboardReviewFolderBadge",
  ];

  for (const feature of reviewerRequiredFeatures) {
    if (!reviewerText.includes(`<${feature}`)) {
      reviewerCanonicalFeatureViolations.push(`Reviewer no longer consumes ${feature}`);
    }
  }

  const reviewerForbiddenLocalFeatures = [
    "function TicketsPanel",
    "function MessagesPanel",
    "function FaqPanel",
    "function ProfilePanel",
    "function EditProfilePanel",
    "function DashboardDateTime",
    "DashboardChoiceCard",
  ];

  for (const marker of reviewerForbiddenLocalFeatures) {
    if (reviewerText.includes(marker)) {
      reviewerCanonicalFeatureViolations.push(`Reviewer still owns canonical feature implementation: ${marker}`);
    }
  }
}

const migratedPageViolations = [];
const migratedDashboardNames = [
  "InnovatorDashboardPage.jsx",
  "InstructorDashboardPage.jsx",
  "ReviewerDashboardPage.jsx",
];

for (const dashboardName of migratedDashboardNames) {
  const file = jsxFiles.find((candidate) => candidate.endsWith(dashboardName));
  if (!file) continue;

  const text = fs.readFileSync(file, "utf8");
  const label = dashboardName.replace("DashboardPage.jsx", "");
  const previewDocumentButtonCount = dashboardName === "InstructorDashboardPage.jsx" ? 3 : 0;
  const rawButtonCount = Math.max(
    0,
    countMatches(text, /<button\b/g) - previewDocumentButtonCount,
  );
  const rawSelectCount = countMatches(text, /<select\b/g);
  const rawTextareaCount = countMatches(text, /<textarea\b/g);
  const rawStandardInputCount = standardNativeInputs(text);

  if (rawButtonCount > 0) migratedPageViolations.push(`${label}: ${rawButtonCount} native button(s)`);
  if (rawSelectCount > 0) migratedPageViolations.push(`${label}: ${rawSelectCount} native select(s)`);
  if (rawTextareaCount > 0) migratedPageViolations.push(`${label}: ${rawTextareaCount} native textarea(s)`);
  if (rawStandardInputCount > 0) migratedPageViolations.push(`${label}: ${rawStandardInputCount} standard native input(s)`);
}

console.log("# Hatef Dashboard UI Audit\n");
console.log(`Dashboard pages: ${jsxFiles.length}`);
console.log(`Native dashboard buttons (migration debt): ${nativeButtons}`);
console.log(`Dashboard selects (migration debt): ${selects}`);
console.log(`Dashboard :hover blocks (migration debt): ${hoverBlocks}`);
console.log(`Dashboard !important occurrences (migration debt): ${importantCount}`);
console.log(`Unique raw dashboard hex colors (migration debt): ${rawHexValues.size}`);
console.log(`Shared dashboard foundation token violations: ${sharedViolations.length}`);
console.log(`Migrated dashboard control violations: ${migratedPageViolations.length}`);
console.log(`Reviewer visual-equivalence violations: ${reviewerVisualViolations.length}`);
console.log(`Canonical dashboard feature extraction violations: ${canonicalFeatureViolations.length}`);
console.log(`Reviewer canonical-feature violations: ${reviewerCanonicalFeatureViolations.length}`);

console.log("\nPer-page migration snapshot:");
for (const file of jsxFiles.sort()) {
  const text = fs.readFileSync(file, "utf8");
  const name = path.basename(file, ".jsx");
  const previewDocumentButtonCount = name === "InstructorDashboardPage" ? 3 : 0;
  const visibleNativeButtons = Math.max(
    0,
    countMatches(text, /<button\b/g) - previewDocumentButtonCount,
  );
  console.log(
    `- ${name}: native buttons=${visibleNativeButtons}, selects=${countMatches(text, /<select\b/g)}, shared Button=${countMatches(text, /<Button\b/g)}, DashboardPanel=${countMatches(text, /<(?:DashboardPanel|SharedDashboardPanel)\b/g)}, DashboardStatusBadge=${countMatches(text, /<DashboardStatusBadge\b/g)}`,
  );
}

const violations = [
  ...sharedViolations,
  ...migratedPageViolations,
  ...reviewerVisualViolations,
  ...canonicalFeatureViolations,
  ...reviewerCanonicalFeatureViolations,
];
if (violations.length > 0) {
  console.log("\nViolations:");
  for (const violation of violations) console.log(`- ${violation}`);
  process.exitCode = 1;
}
