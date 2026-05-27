/**
 * Constrained force-directed refinement for layered graph layouts.
 * Nodes' Y positions are locked to their assigned swimlane / sub-layer.
 * Only X positions are adjusted by the force simulation, allowing nodes
 * in the same layer to cluster organically based on edge connections.
 */

export interface ForceNode {
  id: string;
  x: number;
  y: number;
  /** Fixed Y — the node is pinned to this vertical position */
  assignedY: number;
}

export interface ForceEdge {
  source: string;
  target: string;
}

export interface ConstrainedForceOptions {
  repulsionStrength?: number;
  attractionStrength?: number;
  gravity?: number;
  maxIterations?: number;
  minMovement?: number;
}

export function constrainedForceLayout(
  nodes: ForceNode[],
  edges: ForceEdge[],
  layerCenterX: number,
  options: ConstrainedForceOptions = {}
): void {
  var repulsionStrength = options.repulsionStrength ?? 5000;
  var attractionStrength = options.attractionStrength ?? 0.01;
  var gravity = options.gravity ?? 0.05;
  var maxIterations = options.maxIterations ?? 100;
  var minMovement = options.minMovement ?? 0.1;

  var nodeMap = new Map<string, ForceNode>();
  nodes.forEach(function (n) { nodeMap.set(n.id, n); });

  var edgePairs: { source: ForceNode; target: ForceNode }[] = [];
  edges.forEach(function (e) {
    var src = nodeMap.get(e.source);
    var tgt = nodeMap.get(e.target);
    if (src && tgt) {
      edgePairs.push({ source: src, target: tgt });
    }
  });

  for (var iter = 0; iter < maxIterations; iter++) {
    var totalMovement = 0;

    // N-body repulsion (O(n^2) — acceptable for < 200 nodes)
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var dx = nodes[j].x - nodes[i].x;
        var dy = nodes[j].assignedY - nodes[i].assignedY;
        var dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        var force = repulsionStrength / (dist * dist);
        var fx = (dx / dist) * force;
        nodes[i].x -= fx;
        nodes[j].x += fx;
      }
    }

    // Spring attraction along edges
    edgePairs.forEach(function (pair) {
      var dx = pair.target.x - pair.source.x;
      var dist = Math.max(Math.abs(dx), 1);
      var force = dist * attractionStrength;
      pair.source.x += force * Math.sign(dx);
      pair.target.x -= force * Math.sign(dx);
    });

    // Y constraint + center gravity
    nodes.forEach(function (n) {
      n.y = n.assignedY;
      var dx = layerCenterX - n.x;
      n.x += dx * gravity;
      totalMovement += Math.abs(dx * gravity);
    });

    if (totalMovement / nodes.length < minMovement) break;
  }
}
