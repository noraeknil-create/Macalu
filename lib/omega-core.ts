import { v4 as uuidv4 } from "uuid"

// Types based on the Python dataclasses
export type Capability = "compute" | "memory" | "optimization" | "ml"

export type NodeState = "IDLE" | "PROCESSING" | "WAITING" | "ERROR" | "RECOVERING"

export interface NodeConfig {
  id: string
  clusterId: string
  capabilities: Capability[]
  performanceScore: number
  memorySize: number // KB
  currentLoad: number // 0-100
  state: NodeState
  currentTask?: string
}

export interface ClusterConfig {
  id: string
  name: string
  specialization: Capability
  nodes: string[] // Node IDs
  color: string
}

export interface TaskConfig {
  id: string
  type: string
  priority: number // 1-10
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
  progress: number
  assignedNode?: string
  createdAt: number
}

// Simulation State
export interface OmegaSystemState {
  clusters: ClusterConfig[]
  nodes: Record<string, NodeConfig>
  tasks: TaskConfig[]
  metrics: {
    totalCompute: number
    totalMemory: number
    activeNodes: number
    throughput: number
  }
}

// Helper to generate initial state
export const initializeOmegaSystem = (): OmegaSystemState => {
  const clusters: ClusterConfig[] = [
    { id: "c1", name: "Alpha-Compute", specialization: "compute", nodes: [], color: "#3b82f6" }, // Blue
    { id: "c2", name: "Beta-Memory", specialization: "memory", nodes: [], color: "#10b981" }, // Green
    { id: "c3", name: "Gamma-ML", specialization: "ml", nodes: [], color: "#8b5cf6" }, // Purple
    { id: "c4", name: "Delta-Opt", specialization: "optimization", nodes: [], color: "#f59e0b" }, // Amber
  ]

  const nodes: Record<string, NodeConfig> = {}

  clusters.forEach((cluster) => {
    for (let i = 0; i < 8; i++) {
      const nodeId = `node-${cluster.id}-${i}`
      cluster.nodes.push(nodeId)
      nodes[nodeId] = {
        id: nodeId,
        clusterId: cluster.id,
        capabilities: [cluster.specialization],
        performanceScore: 0.8 + Math.random() * 0.4,
        memorySize: 1024 * (1 + Math.floor(Math.random() * 4)),
        currentLoad: 0,
        state: "IDLE",
      }
    }
  })

  return {
    clusters,
    nodes,
    tasks: [],
    metrics: {
      totalCompute: 0,
      totalMemory: 0,
      activeNodes: 0,
      throughput: 0,
    },
  }
}

// Simulation Step Function
export const stepSimulation = (state: OmegaSystemState): OmegaSystemState => {
  const newState = { ...state, nodes: { ...state.nodes }, tasks: [...state.tasks] }
  const now = Date.now()

  // 1. Process Active Tasks
  newState.tasks = newState.tasks.map((task) => {
    if (task.status === "PROCESSING" && task.assignedNode) {
      const node = newState.nodes[task.assignedNode]
      if (node) {
        // Update progress based on node performance
        const progressIncrement = node.performanceScore * 5 + Math.random() * 2
        const newProgress = Math.min(100, task.progress + progressIncrement)

        // Update Node Load
        node.currentLoad = 60 + Math.sin(now / 1000) * 20 + Math.random() * 10

        if (newProgress >= 100) {
          node.state = "IDLE"
          node.currentTask = undefined
          node.currentLoad = 5 // Idle load
          return { ...task, status: "COMPLETED", progress: 100 }
        }
        return { ...task, progress: newProgress }
      }
    }
    return task
  })

  // 2. Assign Pending Tasks to Idle Nodes
  const pendingTasks = newState.tasks.filter((t) => t.status === "PENDING")
  const idleNodes = Object.values(newState.nodes).filter((n) => n.state === "IDLE")

  pendingTasks.forEach((task) => {
    if (idleNodes.length > 0) {
      // Simple scheduling: find first available node (could be optimized)
      const nodeIndex = Math.floor(Math.random() * idleNodes.length)
      const node = idleNodes[nodeIndex]

      // Assign
      node.state = "PROCESSING"
      node.currentTask = task.id
      task.status = "PROCESSING"
      task.assignedNode = node.id

      // Remove from available pool for this step
      idleNodes.splice(nodeIndex, 1)
    }
  })

  // 3. Randomly generate new tasks (simulating workload)
  if (Math.random() > 0.7 && newState.tasks.filter((t) => t.status !== "COMPLETED").length < 50) {
    const types = ["Data Analysis", "Model Training", "Optimization", "Cache Rehydration"]
    newState.tasks.push({
      id: uuidv4().slice(0, 8),
      type: types[Math.floor(Math.random() * types.length)],
      priority: Math.floor(Math.random() * 10) + 1,
      status: "PENDING",
      progress: 0,
      createdAt: now,
    })
  }

  // 4. Cleanup Completed Tasks
  if (newState.tasks.length > 100) {
    newState.tasks = newState.tasks.filter((t) => t.status !== "COMPLETED" || Math.random() > 0.5)
  }

  // 5. Update Metrics
  const activeNodes = Object.values(newState.nodes).filter((n) => n.state === "PROCESSING").length
  newState.metrics = {
    totalCompute:
      Object.values(newState.nodes).reduce((acc, n) => acc + n.currentLoad, 0) / Object.keys(newState.nodes).length,
    totalMemory: Object.values(newState.nodes).reduce(
      (acc, n) => acc + (n.state === "PROCESSING" ? n.memorySize * 0.8 : n.memorySize * 0.1),
      0,
    ),
    activeNodes,
    throughput: activeNodes * 1.5, // Simulated throughput
  }

  return newState
}
