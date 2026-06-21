// server/src/ml/treeExport.ts
//
// Human-readable exporters for a trained C4.5 tree:
//   - renderTree()   -> indented IF/ELSE text view
//   - extractRules() -> flat root-to-leaf IF...THEN classification rules
//   - toGraphviz()   -> Graphviz DOT source for a visual diagram
//
// Useful for thesis documentation and panel defense.

import type { TreeNode, ClassDistribution } from "./c45.js";

export interface ExportOptions {
  labels?: Record<string, string>; // pretty class labels, e.g. { stem: "STEM" }
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function labelOf(cls: string, opts?: ExportOptions): string {
  return opts?.labels?.[cls] ?? cls;
}

function distString(dist: ClassDistribution, opts?: ExportOptions): string {
  return Object.entries(dist)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${labelOf(k, opts)}=${v}`)
    .join(", ");
}

function leafConfidence(node: Extract<TreeNode, { kind: "leaf" }>): number {
  const total = node.samples || 1;
  return Math.round(((node.distribution[node.prediction] ?? 0) / total) * 100);
}

/** Indented IF/ELSE text view of the tree. */
export function renderTree(root: TreeNode, opts?: ExportOptions): string {
  const lines: string[] = [];

  function walk(node: TreeNode, depth: number): void {
    const pad = "    ".repeat(depth);

    if (node.kind === "leaf") {
      lines.push(
        `${pad}=> PREDICT ${labelOf(node.prediction, opts)} ` +
          `(samples=${node.samples}, confidence=${leafConfidence(node)}%, ` +
          `[${distString(node.distribution, opts)}])`
      );
      return;
    }

    if (node.kind === "numeric") {
      lines.push(`${pad}IF ${node.attribute} <= ${round(node.threshold)} THEN`);
      walk(node.left, depth + 1);
      lines.push(`${pad}ELSE (${node.attribute} > ${round(node.threshold)})`);
      walk(node.right, depth + 1);
      return;
    }

    // categorical
    for (const [value, child] of Object.entries(node.branches)) {
      lines.push(`${pad}IF ${node.attribute} = ${value} THEN`);
      walk(child, depth + 1);
    }
  }

  walk(root, 0);
  return lines.join("\n");
}

/** Flat root-to-leaf IF...THEN rules. */
export function extractRules(root: TreeNode, opts?: ExportOptions): string[] {
  const rules: string[] = [];

  function walk(node: TreeNode, conditions: string[]): void {
    if (node.kind === "leaf") {
      const cond = conditions.length ? conditions.join(" AND ") : "(always)";
      rules.push(
        `IF ${cond} THEN ${labelOf(node.prediction, opts)} ` +
          `(confidence ${leafConfidence(node)}%, n=${node.samples})`
      );
      return;
    }

    if (node.kind === "numeric") {
      walk(node.left, [
        ...conditions,
        `${node.attribute} <= ${round(node.threshold)}`
      ]);
      walk(node.right, [
        ...conditions,
        `${node.attribute} > ${round(node.threshold)}`
      ]);
      return;
    }

    for (const [value, child] of Object.entries(node.branches)) {
      walk(child, [...conditions, `${node.attribute} = ${value}`]);
    }
  }

  walk(root, []);
  return rules;
}

/** Graphviz DOT source for a visual diagram (render with `dot -Tpng`). */
export function toGraphviz(root: TreeNode, opts?: ExportOptions): string {
  const lines: string[] = [
    "digraph C45DecisionTree {",
    "  rankdir=TB;",
    '  node [fontname="Helvetica", fontsize=10];',
    '  edge [fontname="Helvetica", fontsize=9];',
    ""
  ];
  let counter = 0;

  function nextId(): string {
    return `n${counter++}`;
  }

  function walk(node: TreeNode): string {
    const id = nextId();

    if (node.kind === "leaf") {
      lines.push(
        `  ${id} [shape=box, style="rounded,filled", fillcolor="#e8f0fe", ` +
          `label="${labelOf(node.prediction, opts)}\\n${leafConfidence(node)}% (n=${node.samples})"];`
      );
      return id;
    }

    if (node.kind === "numeric") {
      lines.push(
        `  ${id} [shape=box, style=filled, fillcolor="#fff3cd", ` +
          `label="${node.attribute} <= ${round(node.threshold)} ?"];`
      );
      const leftId = walk(node.left);
      const rightId = walk(node.right);
      lines.push(`  ${id} -> ${leftId} [label="yes"];`);
      lines.push(`  ${id} -> ${rightId} [label="no"];`);
      return id;
    }

    lines.push(
      `  ${id} [shape=box, style=filled, fillcolor="#fff3cd", label="${node.attribute} = ?"];`
    );
    for (const [value, child] of Object.entries(node.branches)) {
      const childId = walk(child);
      lines.push(`  ${id} -> ${childId} [label="${value}"];`);
    }
    return id;
  }

  walk(root);
  lines.push("}");
  return lines.join("\n");
}
