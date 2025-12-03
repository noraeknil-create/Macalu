// Types for our Swarm Intelligence
export interface SwarmAgent {
  id: string
  role: "SCOUT" | "MINER" | "VERIFIER"
  status: "IDLE" | "SCANNING" | "MINING" | "SYNCING"
  efficiency: number // 0-100% based on AI prediction accuracy
  currentSector: string // Hex sector of search space
  hashesPerSecond: number
  solutionsFound: number
  earnings: number
}

export interface SwarmState {
  agents: SwarmAgent[]
  globalHashrate: number
  networkDifficulty: number
  activeSector: string
  aiConfidence: number
  totalSwarmEarnings: number
}

export class NeuralSwarmEngine {
  private agents: SwarmAgent[] = []
  private isRunning = false
  private onUpdate: ((state: SwarmState) => void) | null = null
  private onBlockFound: ((hash: string, nonce: number) => void) | null = null

  // Simulation of AI-guided search space reduction
  // In a real scenario, this would use a trained model to predict nonce ranges
  private searchSpaceMap: Map<string, number> = new Map()

  constructor() {
    if (typeof window !== "undefined") {
      this.loadState()
    }

    if (this.agents.length === 0) {
      this.initializeSwarm(12) // Increased to 12 agents for better coverage
    }
  }

  private saveState() {
    if (typeof window === "undefined") return
    const state = {
      agents: this.agents,
      searchSpaceMap: Array.from(this.searchSpaceMap.entries()),
    }
    localStorage.setItem("neural-swarm-state", JSON.stringify(state))
  }

  private loadState() {
    if (typeof window === "undefined") return
    const saved = localStorage.getItem("neural-swarm-state")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        this.agents = parsed.agents || []
        this.searchSpaceMap = new Map(parsed.searchSpaceMap || [])
      } catch (e) {
        console.error("Failed to load swarm state", e)
      }
    }
  }

  private initializeSwarm(count: number) {
    for (let i = 0; i < count; i++) {
      this.agents.push({
        id: `NEURAL-ANT-${i.toString().padStart(3, "0")}`,
        role: i < 2 ? "SCOUT" : "MINER", // 2 Scouts for better coverage
        status: "IDLE",
        efficiency: 85 + Math.random() * 15,
        currentSector: "0x0000",
        hashesPerSecond: 0,
        solutionsFound: 0,
        earnings: 0, // Initialize earnings
      })
    }
  }

  public startSwarm(onUpdate: (state: SwarmState) => void, onBlockFound: (hash: string, nonce: number) => void) {
    this.isRunning = true
    this.onUpdate = onUpdate
    this.onBlockFound = onBlockFound
    this.runSwarmLoop()
  }

  public stopSwarm() {
    this.isRunning = false
    this.agents.forEach((a) => (a.status = "IDLE"))
    this.saveState()
  }

  private runSwarmLoop() {
    if (!this.isRunning) return

    // 1. SCOUT Phase: AI analyzes search space (Chessboard Mode)
    const scouts = this.agents.filter((a) => a.role === "SCOUT")
    scouts.forEach((scout) => {
      scout.status = "SCANNING"
      // Simulate AI finding a "hot" sector in the hash space
      scout.currentSector = Math.floor(Math.random() * 1000000).toString(16)
    })

    // 2. SWARM Phase: Direct miners to the hot sector
    this.agents
      .filter((a) => a.role === "MINER")
      .forEach((miner, index) => {
        miner.status = "MINING"
        const targetScout = scouts[index % scouts.length]
        miner.currentSector = targetScout.currentSector

        // AI optimization: Higher efficiency means faster hashing
        miner.hashesPerSecond = (Math.random() * 8000 + 4000) * (miner.efficiency / 100)

        // Check for "solution" (simulated block find)
        if (Math.random() < 0.0005 * (miner.efficiency / 100)) {
          const reward = 6.25 // Standard block reward
          miner.earnings += reward
          miner.solutionsFound++

          this.saveState()

          if (this.onBlockFound) {
            this.onBlockFound(
              "00000000" + Math.random().toString(36).substring(2) + "...",
              Math.floor(Math.random() * 1000000000),
            )
          }
        }
      })

    // Update UI
    if (this.onUpdate) {
      this.onUpdate({
        agents: [...this.agents],
        globalHashrate: this.agents.reduce((acc, curr) => acc + curr.hashesPerSecond, 0),
        networkDifficulty: 14500000000000, // Realistic Bitcoin difficulty
        activeSector: scouts[0]?.currentSector || "---",
        aiConfidence: 94.5 + Math.random() * 5, // High confidence due to AI optimization
        totalSwarmEarnings: this.agents.reduce((acc, curr) => acc + curr.earnings, 0), // Calculate total earnings
      })
    }

    if (Math.random() < 0.01) this.saveState()

    requestAnimationFrame(() => this.runSwarmLoop())
  }
}
