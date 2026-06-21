// server/src/scripts/export-tree.ts
//
// Regenerates the human-readable C4.5 decision-tree artifacts under /docs.
// Run with:  npm run export:tree
//
// Outputs:
//   docs/c45-decision-tree.txt  -> model summary, indented tree, IF/THEN rules
//   docs/c45-decision-tree.dot  -> Graphviz diagram source (render: dot -Tpng)

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import {
  buildTree,
  accuracy,
  countLeaves,
  treeDepth,
  type Example
} from "../ml/c45.js";
import { renderTree, extractRules, toGraphviz } from "../ml/treeExport.js";
import { trainingExamples, FEATURE_ATTRIBUTES } from "../data/trainingData.js";

const LABELS = { stem: "STEM", abm: "ABM", humss: "HUMSS", gas: "GAS" };
const TREE_OPTIONS = { maxDepth: 6, minSamplesSplit: 8 };

// Build the production tree (full dataset) + an 80/20 holdout accuracy estimate.
function shuffled(arr: Example[], seed: number): Example[] {
  let a = seed >>> 0;
  const rng = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const x = copy[i];
    const y = copy[j];
    if (x !== undefined && y !== undefined) {
      copy[i] = y;
      copy[j] = x;
    }
  }
  return copy;
}

const tree = buildTree(trainingExamples, FEATURE_ATTRIBUTES, TREE_OPTIONS);

const data = shuffled(trainingExamples, 12345);
const split = Math.floor(data.length * 0.8);
const holdoutTree = buildTree(data.slice(0, split), FEATURE_ATTRIBUTES, TREE_OPTIONS);
const acc = accuracy(holdoutTree, data.slice(split));

const treeText = renderTree(tree, { labels: LABELS });
const rules = extractRules(tree, { labels: LABELS });
const dot = toGraphviz(tree, { labels: LABELS });

const summary = [
  "C4.5 DECISION TREE — TRAINED MODEL EXPORT",
  "=========================================",
  "",
  "Algorithm:           C4.5 (gain-ratio attribute selection, threshold splits)",
  `Training examples:   ${trainingExamples.length}`,
  `Features (inputs):   ${FEATURE_ATTRIBUTES.map((a) => a.name).join(", ")}`,
  `Classes (outputs):   ${Object.values(LABELS).join(", ")}`,
  `Tree leaves:         ${countLeaves(tree)}`,
  `Tree depth:          ${treeDepth(tree)}`,
  `Holdout accuracy:    ${(acc * 100).toFixed(1)}% (80% train / 20% test split)`,
  "",
  "DECISION TREE (indented IF / ELSE form)",
  "---------------------------------------",
  treeText,
  "",
  "CLASSIFICATION RULES (root-to-leaf)",
  "-----------------------------------",
  ...rules.map((r, i) => `${i + 1}. ${r}`),
  ""
].join("\n");

const here = dirname(fileURLToPath(import.meta.url)); // server/src/scripts
const docsDir = resolve(here, "..", "..", "..", "docs"); // repo-root/docs
mkdirSync(docsDir, { recursive: true });

const txtPath = resolve(docsDir, "c45-decision-tree.txt");
const dotPath = resolve(docsDir, "c45-decision-tree.dot");
writeFileSync(txtPath, summary, "utf8");
writeFileSync(dotPath, dot, "utf8");

// eslint-disable-next-line no-console
console.log(summary);
// eslint-disable-next-line no-console
console.log(`\nWrote:\n  ${txtPath}\n  ${dotPath}`);
