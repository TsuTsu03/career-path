// server/src/ml/c45.ts
//
// A genuine C4.5 decision-tree implementation (Quinlan, 1993).
//
// C4.5 builds a decision tree by repeatedly choosing the attribute that yields
// the highest GAIN RATIO (information gain normalised by split information).
// It supports BOTH:
//   - numerical / continuous attributes -> binary threshold splits
//     ("attribute <= threshold"), choosing the threshold with the best gain
//     ratio; and
//   - categorical attributes            -> a branch per distinct value.
//
// The model is trained once (see ./recommender.ts) from a labelled dataset and
// then used to classify each student into an SHS strand.

export type FeatureValue = number | string;
export type Features = Record<string, FeatureValue>;

export interface Example {
  features: Features;
  label: string;
}

export interface AttributeSpec {
  name: string;
  type: "numeric" | "categorical";
}

export type ClassDistribution = Record<string, number>;

interface LeafNode {
  kind: "leaf";
  prediction: string;
  distribution: ClassDistribution; // counts per class at this leaf
  samples: number;
}

interface NumericNode {
  kind: "numeric";
  attribute: string;
  threshold: number;
  left: TreeNode; // attribute <= threshold
  right: TreeNode; // attribute >  threshold
  samples: number;
}

interface CategoricalNode {
  kind: "categorical";
  attribute: string;
  branches: Record<string, TreeNode>;
  fallback: LeafNode; // used for unseen values at predict time
  samples: number;
}

export type TreeNode = LeafNode | NumericNode | CategoricalNode;

const LOG2 = Math.log(2);
function log2(x: number): number {
  return Math.log(x) / LOG2;
}

/** Shannon entropy of the class labels in a set of examples. */
export function entropy(examples: Example[]): number {
  if (examples.length === 0) return 0;
  const counts = classCounts(examples);
  const total = examples.length;
  let h = 0;
  for (const label of Object.keys(counts)) {
    const p = (counts[label] ?? 0) / total;
    if (p > 0) h -= p * log2(p);
  }
  return h;
}

export function classCounts(examples: Example[]): ClassDistribution {
  const counts: ClassDistribution = {};
  for (const ex of examples) {
    counts[ex.label] = (counts[ex.label] ?? 0) + 1;
  }
  return counts;
}

function majorityClass(examples: Example[]): string {
  const counts = classCounts(examples);
  let best = "";
  let bestCount = -1;
  for (const label of Object.keys(counts)) {
    const count = counts[label] ?? 0;
    if (count > bestCount) {
      bestCount = count;
      best = label;
    }
  }
  return best;
}

function makeLeaf(examples: Example[]): LeafNode {
  return {
    kind: "leaf",
    prediction: majorityClass(examples),
    distribution: classCounts(examples),
    samples: examples.length
  };
}

/** Split information (intrinsic value) used to normalise information gain. */
function splitInformation(subsetSizes: number[], total: number): number {
  let si = 0;
  for (const size of subsetSizes) {
    if (size > 0) {
      const p = size / total;
      si -= p * log2(p);
    }
  }
  return si;
}

interface SplitCandidate {
  attribute: string;
  type: "numeric" | "categorical";
  threshold?: number;
  gainRatio: number;
  partition: Example[][];
}

/** Best binary threshold split for a continuous attribute. */
function bestNumericSplit(
  examples: Example[],
  attribute: string,
  baseEntropy: number
): SplitCandidate | null {
  const values = Array.from(
    new Set(examples.map((e) => Number(e.features[attribute])))
  ).sort((a, b) => a - b);

  if (values.length < 2) return null;

  const total = examples.length;
  let best: SplitCandidate | null = null;

  // Candidate thresholds = midpoints between adjacent distinct values.
  for (let i = 0; i < values.length - 1; i++) {
    const lo = values[i];
    const hi = values[i + 1];
    if (lo === undefined || hi === undefined) continue;
    const threshold = (lo + hi) / 2;

    const left = examples.filter(
      (e) => Number(e.features[attribute]) <= threshold
    );
    const right = examples.filter(
      (e) => Number(e.features[attribute]) > threshold
    );

    if (left.length === 0 || right.length === 0) continue;

    const weighted =
      (left.length / total) * entropy(left) +
      (right.length / total) * entropy(right);

    const infoGain = baseEntropy - weighted;
    const si = splitInformation([left.length, right.length], total);
    const gainRatio = si > 0 ? infoGain / si : 0;

    if (infoGain > 0 && (best === null || gainRatio > best.gainRatio)) {
      best = {
        attribute,
        type: "numeric",
        threshold,
        gainRatio,
        partition: [left, right]
      };
    }
  }

  return best;
}

/** Best multi-way split for a categorical attribute. */
function bestCategoricalSplit(
  examples: Example[],
  attribute: string,
  baseEntropy: number
): SplitCandidate | null {
  const groups = new Map<string, Example[]>();
  for (const ex of examples) {
    const key = String(ex.features[attribute]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(ex);
  }

  if (groups.size < 2) return null;

  const total = examples.length;
  const subsets = Array.from(groups.values());

  let weighted = 0;
  for (const subset of subsets) {
    weighted += (subset.length / total) * entropy(subset);
  }

  const infoGain = baseEntropy - weighted;
  const si = splitInformation(
    subsets.map((s) => s.length),
    total
  );
  const gainRatio = si > 0 ? infoGain / si : 0;

  if (infoGain <= 0) return null;

  return {
    attribute,
    type: "categorical",
    gainRatio,
    partition: subsets
  };
}

export interface C45Options {
  maxDepth?: number; // cap tree depth (keeps leaves informative / avoids overfit)
  minSamplesSplit?: number; // do not split nodes smaller than this
}

const DEFAULT_OPTIONS: Required<C45Options> = {
  maxDepth: 6,
  minSamplesSplit: 8
};

/** Train a C4.5 decision tree. */
export function buildTree(
  examples: Example[],
  attributes: AttributeSpec[],
  options: C45Options = {}
): TreeNode {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  return build(examples, attributes, opts, 0);
}

function build(
  examples: Example[],
  attributes: AttributeSpec[],
  opts: Required<C45Options>,
  depth: number
): TreeNode {
  // Stopping conditions
  const counts = classCounts(examples);
  const distinctClasses = Object.keys(counts);

  if (
    distinctClasses.length <= 1 ||
    examples.length < opts.minSamplesSplit ||
    depth >= opts.maxDepth ||
    attributes.length === 0
  ) {
    return makeLeaf(examples);
  }

  const baseEntropy = entropy(examples);

  // Evaluate every attribute, keep the one with the best gain ratio.
  let best: SplitCandidate | null = null;
  for (const attr of attributes) {
    const candidate =
      attr.type === "numeric"
        ? bestNumericSplit(examples, attr.name, baseEntropy)
        : bestCategoricalSplit(examples, attr.name, baseEntropy);

    if (candidate && (best === null || candidate.gainRatio > best.gainRatio)) {
      best = candidate;
    }
  }

  // No attribute provides positive information gain -> make a leaf.
  if (best === null) {
    return makeLeaf(examples);
  }

  const chosen = best;

  if (chosen.type === "numeric") {
    const left = chosen.partition[0] ?? [];
    const right = chosen.partition[1] ?? [];
    return {
      kind: "numeric",
      attribute: chosen.attribute,
      threshold: chosen.threshold ?? 0,
      samples: examples.length,
      // Continuous attributes may be re-used further down the tree.
      left: build(left, attributes, opts, depth + 1),
      right: build(right, attributes, opts, depth + 1)
    };
  }

  // Categorical: one branch per value; the attribute is consumed.
  const remaining = attributes.filter((a) => a.name !== chosen.attribute);
  const branches: Record<string, TreeNode> = {};
  for (const subset of chosen.partition) {
    const first = subset[0];
    if (!first) continue;
    const value = String(first.features[chosen.attribute]);
    branches[value] = build(subset, remaining, opts, depth + 1);
  }

  return {
    kind: "categorical",
    attribute: chosen.attribute,
    branches,
    fallback: makeLeaf(examples),
    samples: examples.length
  };
}

export interface PredictionStep {
  attribute: string;
  test: string; // human-readable condition that was taken
}

export interface Prediction {
  prediction: string;
  distribution: ClassDistribution; // class counts at the reached leaf
  probabilities: ClassDistribution; // normalised 0..1 per class
  path: PredictionStep[];
}

/** Classify a single feature vector, recording the path taken. */
export function predict(tree: TreeNode, features: Features): Prediction {
  const path: PredictionStep[] = [];
  let node: TreeNode = tree;

  while (node.kind !== "leaf") {
    if (node.kind === "numeric") {
      const value = Number(features[node.attribute]);
      if (value <= node.threshold) {
        path.push({
          attribute: node.attribute,
          test: `${node.attribute} (${value}) ≤ ${round(node.threshold)}`
        });
        node = node.left;
      } else {
        path.push({
          attribute: node.attribute,
          test: `${node.attribute} (${value}) > ${round(node.threshold)}`
        });
        node = node.right;
      }
    } else {
      const value = String(features[node.attribute]);
      const next = node.branches[value];
      if (next) {
        path.push({
          attribute: node.attribute,
          test: `${node.attribute} = ${value}`
        });
        node = next;
      } else {
        // Unseen categorical value -> use the fallback majority leaf.
        node = node.fallback;
      }
    }
  }

  const total = node.samples || 1;
  const probabilities: ClassDistribution = {};
  for (const label of Object.keys(node.distribution)) {
    probabilities[label] = (node.distribution[label] ?? 0) / total;
  }

  return {
    prediction: node.prediction,
    distribution: node.distribution,
    probabilities,
    path
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Count the leaves of a tree. */
export function countLeaves(node: TreeNode): number {
  if (node.kind === "leaf") return 1;
  if (node.kind === "numeric")
    return countLeaves(node.left) + countLeaves(node.right);
  return Object.values(node.branches).reduce(
    (sum, child) => sum + countLeaves(child),
    0
  );
}

/** Maximum depth of a tree (root = depth 0). */
export function treeDepth(node: TreeNode): number {
  if (node.kind === "leaf") return 0;
  if (node.kind === "numeric")
    return 1 + Math.max(treeDepth(node.left), treeDepth(node.right));
  const childDepths = Object.values(node.branches).map((c) => treeDepth(c));
  return 1 + (childDepths.length ? Math.max(...childDepths) : 0);
}

/**
 * Classification accuracy of a trained tree over a labelled set.
 * Used to report the model's holdout accuracy for the thesis.
 */
export function accuracy(tree: TreeNode, examples: Example[]): number {
  if (examples.length === 0) return 0;
  let correct = 0;
  for (const ex of examples) {
    if (predict(tree, ex.features).prediction === ex.label) correct++;
  }
  return correct / examples.length;
}
