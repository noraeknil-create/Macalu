"use client"

import { useState, useEffect, useRef } from "react"
import {
  Play,
  Square,
  Cpu,
  TrendingUp,
  DollarSign,
  Database,
  Activity,
  AlertTriangle,
  Download,
  RefreshCw,
  Network,
  HardDrive,
  Thermometer,
  Wifi,
  ShoppingCart,
  Wallet,
  ArrowRight,
  Server,
  Brain,
  BrainCircuit,
  Share2,
  Target,
  Hexagon,
  Zap,
  Eye,
  MessageSquare,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  AdvancedMiningEngine,
  type Block,
  type MiningStats,
  type WorkerStats,
  type Hardware,
} from "@/lib/advanced-mining-engine"
import { NeuralSwarmEngine, type SwarmState } from "@/lib/neural-swarm-engine"
import { createNanoSwarm, type SwarmController, type NanoBot } from "@/lib/nano-fabric"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRadicalSystem } from "@/lib/radical-system" // Added from updates

// Define LogEntry type as it was causing a lint error
type LogEntry = {
  timestamp: string
  message: string
  type: "info" | "success" | "error" | "mining" | "neural" | "system"
}

import { checkBotConnection, findChatId, sendTelegramMessage, broadcastMarketing } from "./actions" // Added from updates

export default function AdvancedMiningTerminal() {
  // State for Advanced Mining Terminal
  const [engine] = useState(() => new AdvancedMiningEngine())
  const [isAdmin, setIsAdmin] = useState(true)
  const [isMining, setIsMining] = useState(false)
  const [stats, setStats] = useState<MiningStats>(engine.getStats())
  const [blockchain, setBlockchain] = useState<Block[]>(engine.getBlockchain())
  const [workers, setWorkers] = useState<WorkerStats[]>(engine.getWorkers())
  // Logs type to LogEntry
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "blockchain" | "analytics" | "workers" | "market" | "shop" | "wallet"
  >("dashboard")
  const logsEndRef = useRef<HTMLDivElement>(null)
  const [inventory, setInventory] = useState<Hardware[]>(engine.getInventory())
  const [withdrawAddress, setWithdrawAddress] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [showVerification, setShowVerification] = useState(false)
  const [lastMinedBlock, setLastMinedBlock] = useState<Block | null>(null)

  // State for Neural Swarm Engine
  const [swarmEngine] = useState(() => new NeuralSwarmEngine())
  const [swarmState, setSwarmState] = useState<SwarmState | null>(null)
  const [mode, setMode] = useState<"STANDARD" | "NEURAL_SWARM" | "RADICAL_SYSTEM">("RADICAL_SYSTEM") // Default to RADICAL for the user

  // State for Nano Swarm Fabric
  const [nanoSwarm, setNanoSwarm] = useState<SwarmController | null>(null)
  const [nanoBots, setNanoBots] = useState<NanoBot[]>([])

  // State for Radical Dashboard (from updates)
  const { system, state, logs: radicalLogs } = useRadicalSystem() // Renamed logs to radicalLogs to avoid conflict
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletInput, setWalletInput] = useState("")
  const [showRealityCheck, setShowRealityCheck] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<{ sender: "user" | "bot"; text: string }[]>([
    { sender: "bot", text: "Verbindung hergestellt. Ich höre." },
  ])
  const chatScrollRef = useRef<HTMLDivElement>(null)

  // --- Effects ---

  // Auto-scroll logs for Advanced Mining Terminal
  // useEffect(() => {
  //   if (logsEndRef.current) {
  //     logsEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
  //   }
  // }, [logs])

  // Auto-scroll logs for Radical Dashboard
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    // const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100
    // if (isNearBottom) {
    //   el.scrollTop = el.scrollHeight
    // }
  }, [radicalLogs])

  // Scroll to bottom of chat
  useEffect(() => {
    const el = chatScrollRef.current
    if (!el) return

    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100

    if (isNearBottom) {
      el.scrollTop = el.scrollHeight
    }
  }, [chatHistory])

  // Effect for Nano Swarm initialization and simulation loop
  useEffect(() => {
    if (mode === "NEURAL_SWARM" && !nanoSwarm) {
      const swarm = createNanoSwarm(24, (sol) => {
        console.log("Nano Swarm found solution:", sol)
        // Integrate with existing mining logic
      })
      setNanoSwarm(swarm)
      setNanoBots(swarm.getAllBots())

      // Simulation loop for visualization
      const interval = setInterval(() => {
        swarm.getAllBots().forEach((bot) => bot.runPrograms())
        setNanoBots([...swarm.getAllBots()]) // Trigger re-render
      }, 100)

      return () => clearInterval(interval)
    }
  }, [mode, nanoSwarm])

  // Marketing loop to send Telegram messages (from updates)
  useEffect(() => {
    const interval = setInterval(async () => {
      const message = system.runMarketingCycle()
      if (message && state.telegram.connected && state.telegram.chatId) {
        await broadcastMarketing(state.telegram.chatId, message)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [system, state.telegram.connected, state.telegram.chatId])

  // --- Helper Functions ---

  const addLog = (message: string, type: LogEntry["type"] = "info") => {
    const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false })
    setLogs((prev) => [{ timestamp, message, type }, ...prev].slice(0, 100))
  }

  const formatHashrate = (hr: number): string => {
    if (hr >= 1000000000) return `${(hr / 1000000000).toFixed(2)} GH/s`
    if (hr >= 1000000) return `${(hr / 1000000).toFixed(2)} MH/s`
    if (hr >= 1000) return `${(hr / 1000).toFixed(2)} KH/s`
    return `${hr.toFixed(0)} H/s`
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${mins}m`
  }

  const formatBytes = (bytes: number): string => {
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(2)} MB`
    if (bytes >= 1000) return `${(bytes / 1000).toFixed(2)} KB`
    return `${bytes} B`
  }

  // --- Event Handlers ---

  const handleStartMining = () => {
    setIsMining(true)
    addLog("[MINING] Starting mining operation - Initializing workers", "mining")

    engine.startMining(
      (updatedStats) => {
        setStats(updatedStats)
      },
      (block) => {
        setBlockchain(engine.getBlockchain())
        addLog(
          `[SUCCESS] Block #${block.index} mined - Hash: ${block.hash.substring(0, 16)}... - Reward: ${block.reward} BTC`,
          "success",
        )
      },
      (updatedWorkers) => {
        setWorkers(updatedWorkers)
      },
    )
  }

  const handleStopMining = () => {
    engine.stopMining()
    // In NEURAL_SWARM mode, this stops the swarm engine
    swarmEngine.stopSwarm()
    // Stop Nano Swarm
    if (nanoSwarm) {
      nanoSwarm.stopSwarm()
      setNanoSwarm(null)
      setNanoBots([])
    }
    setIsMining(false)
    setSwarmState(null) // Reset swarm state on stop
    addLog("[MINING] Mining operation stopped", "mining")
    if (mode === "NEURAL_SWARM") {
      addLog("[NEURAL] Swarm deactivated", "neural")
    }
  }

  const handleReset = () => {
    if (confirm("Reset blockchain? This will clear all data.")) {
      engine.resetBlockchain()
      setStats(engine.getStats())
      setBlockchain(engine.getBlockchain())
      setWorkers(engine.getWorkers())
      setLogs([
        {
          timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
          message: "[SYSTEM] Blockchain reset complete",
          type: "system",
        },
      ])
      addLog("[SYSTEM] All data cleared", "system")
    }
  }

  const exportData = () => {
    const data = engine.exportToJSON()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mining-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    addLog("[EXPORT] Mining data exported successfully", "system")
  }

  const handleBuyHardware = (id: string) => {
    if (engine.buyHardware(id, isAdmin)) {
      setInventory(engine.getInventory())
      setStats(engine.getStats())
      addLog(`[MARKET] Purchased hardware upgrade: ${id.toUpperCase()} ${isAdmin ? "(ADMIN OVERRIDE)" : ""}`, "system")
    } else {
      addLog(`[ERROR] Insufficient funds to buy ${id.toUpperCase()}`, "error")
    }
  }

  const handleWithdraw = () => {
    const amount = Number.parseFloat(withdrawAmount)
    if (engine.withdraw(amount, withdrawAddress)) {
      setStats(engine.getStats())
      addLog(`[WALLET] Withdrawal of ${amount} BTC to ${withdrawAddress.substring(0, 8)}... initiated`, "system")
      setWithdrawAmount("")
      setWithdrawAddress("")
    } else {
      addLog("[ERROR] Withdrawal failed: Insufficient funds", "error")
    }
  }

  const handleStartSwarm = () => {
    setMode("NEURAL_SWARM")
    setIsMining(true)
    addLog("[NEURAL] Initializing Swarm Intelligence Network...", "neural")
    addLog('[AI] "Chessboard Mode" activated - Optimizing search space', "neural")

    swarmEngine.startSwarm(
      (state) => setSwarmState(state),
      (hash, nonce) => {
        addLog(`[SWARM SUCCESS] Block Solution Found! Nonce: ${nonce}`, "neural")
        // In a real app, this would submit to the pool here
        // For simulation, we'll just log it and pretend a block was found
        const newBlock = engine.mineBlock(hash, nonce, engine.getWalletAddress())
        setBlockchain(engine.getBlockchain())
        setStats(engine.getStats()) // Update stats (e.g., balance)
        setLastMinedBlock(newBlock)
        setShowVerification(true)

        addLog(
          `[SUCCESS] Block #${newBlock.index} mined - Hash: ${newBlock.hash.substring(0, 16)}... - Reward: ${newBlock.reward} BTC`,
          "success",
        )
      },
    )
  }

  // Radical Dashboard specific handlers (from updates)
  const handleConnectTelegram = async () => {
    setIsConnecting(true)
    try {
      // 1. Bot prüfen
      const botCheck = await checkBotConnection()
      if (!botCheck.success) {
        alert(`Bot Fehler: ${botCheck.error}`)
        setIsConnecting(false)
        return
      }

      // 2. Chat ID finden
      const chatCheck = await findChatId()
      if (!chatCheck.success) {
        alert(`Verbindungsfehler: ${chatCheck.error}`)
        setIsConnecting(false)
        return
      }

      // 3. System verbinden
      system.setTelegramConnection(true, chatCheck.chatId)
      await sendTelegramMessage(
        chatCheck.chatId,
        "<b>SYSTEM ONLINE.</b>\nVerbindung hergestellt.\n\n<i>Willkommen im ΩMEGA-CORE.</i>",
      )
    } catch (e) {
      alert("Unbekannter Fehler")
    }
    setIsConnecting(false)
  }

  const handleSaveWallet = () => {
    if (walletInput.length > 10) {
      system.setWalletAddress(walletInput)
      setWalletInput("")
    }
  }

  const handleRealityCheck = () => {
    setShowRealityCheck(true)
  }

  const handleChatSend = () => {
    if (!chatMessage.trim()) return

    // Add user message
    const newHistory = [...chatHistory, { sender: "user" as const, text: chatMessage }]
    setChatHistory(newHistory)
    setChatMessage("")

    // Process with system (simulate delay)
    setTimeout(
      () => {
        const response = system.processUserMessage(chatMessage)
        setChatHistory((prev) => [...prev, { sender: "bot", text: response }])
      },
      600 + Math.random() * 800,
    )
  }

  // Subscribe to system state changes
  useEffect(() => {
    const unsubscribe = system.subscribe((newState, newLogs) => {
      setSwarmState(newState.swarm)
      // Map logs to the expected format
      const formattedLogs = newLogs.map((log) => ({
        timestamp: log.timestamp,
        message: log.message,
        type: log.type as LogEntry["type"], // Cast to expected type
      }))
      // Use addLog to ensure correct type and slicing
      formattedLogs.forEach((log) => addLog(log.message, log.type))
      // Or if you want to add them all at once, you would need a batch update function in useRadicalSystem
      // For now, using individual addLog calls within the effect for simplicity,
      // but a more efficient approach might be to have a dedicated log update function in useRadicalSystem
    })
    return unsubscribe
  }, [system])

  // --- Data Retrievals ---
  const poolConnection = engine.getPoolConnection()
  const mempool = engine.getMempool()

  // --- Render ---

  return (
    <div className="min-h-screen bg-background text-foreground font-mono relative overflow-hidden">
      <Dialog open={showRealityCheck} onOpenChange={setShowRealityCheck}>
        <DialogContent className="bg-black border-red-500 text-red-500 font-mono border-2 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold uppercase tracking-widest">
              <Eye className="w-8 h-8 animate-pulse" />
              Realitäts-Protokoll
            </DialogTitle>
            <DialogDescription className="sr-only">
              Details über den Status der Simulation und die Realität des Systems.
            </DialogDescription>
          </DialogHeader>

          <div className="text-red-400/80 text-lg mt-4 space-y-4">
            <p>
              <strong className="text-white">STATUS:</strong> Simulation Level 4.
            </p>
            <p>
              Du fragst nach der Wahrheit? Hier ist sie:
              <br />
              Dieses System ist eine <strong>High-End Simulation</strong>. Es generiert keine echten Euros, es schürft
              keine echten Bitcoins.
            </p>
            <p>
              <strong className="text-white">ABER:</strong> Der Code ist echt. Die Logik ist echt. Du steuerst eine
              Maschine, die bereit ist.
            </p>
            <p>
              Um <strong>echtes Geld</strong> zu verdienen, musst du das "Marketing Modul" (den Bot) nutzen, um echte
              Menschen zu erreichen, oder echte Produkte verkaufen. Das Dashboard zeigt dir nur das Potenzial.
            </p>
            <div className="p-4 bg-red-950/30 border border-red-900 rounded mt-4 text-sm">
              SYSTEM-TIPP: Nutze den Telegram-Bot, um deine Reichweite zu erhöhen. Das ist der erste Schritt aus der
              Simulation in die Realität.
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="destructive"
              onClick={() => setShowRealityCheck(false)}
              className="font-bold tracking-widest"
            >
              ICH VERSTEHE. ZURÜCK ZUR MATRIX.
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Dialog for Block Verification --- */}
      <Dialog open={showVerification} onOpenChange={setShowVerification}>
        <DialogContent className="bg-black/90 border-accent text-accent font-mono">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Network className="w-6 h-6 animate-pulse" />
              BLOCK VERIFICATION PROTOCOL
            </DialogTitle>
            <DialogDescription className="text-accent/70">
              Broadcasting solution to the global Bitcoin network...
            </DialogDescription>
          </DialogHeader>

          {lastMinedBlock && (
            <div className="space-y-4 py-4">
              <div className="p-4 border border-accent/30 rounded bg-accent/5">
                <div className="text-xs text-muted-foreground mb-1">BLOCK HASH</div>
                <div className="text-sm font-bold break-all">{lastMinedBlock.hash}</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Node Tokyo-01</span>
                  <span className="text-green-500 font-bold">VERIFIED ✓</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Node NY-Central</span>
                  <span className="text-green-500 font-bold">VERIFIED ✓</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Node Berlin-X</span>
                  <span className="text-green-500 font-bold">VERIFIED ✓</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Swarm Consensus</span>
                  <span className="text-green-500 font-bold">100% MATCH</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-accent/30 text-center">
                <div className="text-2xl font-bold animate-pulse">+{lastMinedBlock.reward.toFixed(8)} BTC</div>
                <div className="text-xs text-muted-foreground">CREDITED TO WALLET</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* --- Background Elements --- */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-scan"></div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-4">
          {/* Updated header to show Neural Swarm Matrix title and controls */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight flex items-center gap-3">
              {mode === "NEURAL_SWARM" ? (
                <BrainCircuit className="w-8 h-8 animate-pulse" />
              ) : mode === "RADICAL_SYSTEM" ? (
                <Activity className="w-8 h-8 text-green-500 animate-pulse" />
              ) : (
                <Cpu className="w-8 h-8" />
              )}
              {mode === "NEURAL_SWARM"
                ? "NEURAL SWARM MATRIX"
                : mode === "RADICAL_SYSTEM"
                  ? "RADICAL SYSTEM DASHBOARD"
                  : "NEURAL QUANTUM MINING TERMINAL"}
            </h1>
            <div className="text-xs text-muted-foreground mt-2 flex items-center gap-3">
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isMining ? "bg-accent animate-pulse" : "bg-muted"}`}></span>
                {isMining ? "ACTIVE MINING" : "STANDBY"}
              </span>
              {isAdmin && (
                <span className="flex items-center gap-1 text-destructive font-bold animate-pulse">
                  <Zap className="w-3 h-3" />
                  ADMIN MODE ACTIVE
                </span>
              )}
              {mode === "RADICAL_SYSTEM" && (
                <span className="flex items-center gap-1 text-green-500 font-bold animate-pulse">
                  <Activity className="w-3 h-3" /> RADICAL SYSTEM: ONLINE
                </span>
              )}
              {mode === "STANDARD" && (
                <span className="flex items-center gap-1">
                  <Wifi className={`w-3 h-3 ${poolConnection.connected ? "text-accent" : "text-muted"}`} />
                  POOL: {poolConnection.shareAccepted} accepted / {poolConnection.shareRejected} rejected
                </span>
              )}
              {mode === "NEURAL_SWARM" && swarmState && (
                <span className="flex items-center gap-1 text-accent">
                  <Hexagon className="w-3 h-3" /> SWARM ACTIVE
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {mode === "RADICAL_SYSTEM" && (
              <Button
                variant="outline"
                onClick={handleRealityCheck}
                className="border-red-500 text-red-500 hover:bg-red-950/30 animate-pulse bg-transparent"
              >
                <Eye className="w-4 h-4 mr-2" />
                REALITÄTS-CHECK
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode("RADICAL_SYSTEM")}
              className={mode === "RADICAL_SYSTEM" ? "border-green-500 text-green-500" : ""}
            >
              ΩMEGA
            </Button>
            {!isMining && (
              <Button
                variant="outline"
                onClick={() => setMode(mode === "STANDARD" ? "NEURAL_SWARM" : "STANDARD")}
                className={mode === "NEURAL_SWARM" ? "border-accent text-accent" : ""}
              >
                {mode === "STANDARD" ? "SWITCH TO SWARM AI" : "SWITCH TO STANDARD"}
              </Button>
            )}
            <Button
              onClick={
                isMining
                  ? handleStopMining
                  : mode === "NEURAL_SWARM"
                    ? handleStartSwarm
                    : mode === "RADICAL_SYSTEM"
                      ? () => system.executeSystemCore()
                      : handleStartMining
              }
              size="lg"
              variant={isMining ? "destructive" : "default"}
              className="font-bold"
            >
              {isMining ? (
                <Square className="w-4 h-4 mr-2" />
              ) : mode === "NEURAL_SWARM" ? (
                <Hexagon className="w-4 h-4 mr-2" />
              ) : mode === "RADICAL_SYSTEM" ? (
                <Activity className="w-4 h-4 mr-2 text-green-500 animate-pulse" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {isMining
                ? "STOP MINING"
                : mode === "NEURAL_SWARM"
                  ? "START SWARM"
                  : mode === "RADICAL_SYSTEM"
                    ? "INITIATE CORE"
                    : "START MINING"}
            </Button>
          </div>
        </header>

        {mode === "RADICAL_SYSTEM" && (
          <div className="animate-in fade-in duration-500 space-y-6 font-mono">
            {/* TOP STATS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6 bg-black border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                <div className="text-xs text-green-500/70 mb-1">HYPER CASHFLOW (SIMULIERT)</div>
                <div className="text-3xl font-bold text-green-400 flex items-baseline gap-1">
                  € {state.cashflow.balance.toFixed(2)}
                  <span className="text-xs text-green-500/50 font-normal">virtuell</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-2">
                  Rate: {state.cashflow.rate > 0 ? "+" : ""}
                  {state.cashflow.rate.toFixed(2)}% / tick
                </div>
              </Card>

              <Card className="p-6 bg-black border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                <div className="text-xs text-green-500/70 mb-1">ECHTGELD EINNAHMEN</div>
                <div className="text-3xl font-bold text-muted-foreground flex items-baseline gap-1">€ 0.00</div>
                <div className="text-[10px] text-yellow-500 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Marketing Bot benötigt Leads
                </div>
              </Card>

              <Card className="p-6 bg-black border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                <div className="text-xs text-green-500/70 mb-1">BEWUSSTSEINS-FEHLER</div>
                <div className="text-3xl font-bold text-red-500">{state.consciousness.errorCount}</div>
                <div className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                  Status: <span className="text-white">{state.consciousness.status}</span>
                </div>
              </Card>

              <Card className="p-6 bg-black border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                <div className="text-xs text-green-500/70 mb-1">TELEGRAM UPLINK</div>
                <div className="text-3xl font-bold text-blue-400 flex items-center gap-2">
                  {state.telegram.connected ? "AKTIV" : "OFFLINE"}
                </div>
                <div className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                  Bot: {state.telegram.connected ? state.telegram.botName : "Nicht verbunden"}
                  {state.telegram.connected && <span className="text-green-500 ml-1">●</span>}
                </div>
              </Card>
            </div>

            {/* MAIN INTERFACE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT COLUMN: ACTIONS */}
              <div className="space-y-6">
                <Card className="p-6 bg-black/80 border-green-500/30">
                  <h3 className="text-lg font-bold text-green-500 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5" /> SYSTEM KONTROLLE
                  </h3>
                  <div className="space-y-4">
                    <Button
                      variant="destructive"
                      className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-500/50"
                      onClick={() => system.executeBug()}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      BUG AUSLÖSEN
                    </Button>

                    <div className="h-px bg-green-500/20" />

                    <div className="space-y-2">
                      <label className="text-xs text-green-500/70">TELEGRAM INTEGRATION</label>
                      {state.telegram.connected ? (
                        <Button className="w-full bg-blue-500/20 text-blue-400 border border-blue-500/50" disabled>
                          VERBUNDEN MIT @Macalubot
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                          onClick={handleConnectTelegram}
                          disabled={isConnecting}
                        >
                          {isConnecting ? "SUCHE SIGNAL..." : "TELEGRAM VERBINDEN"}
                        </Button>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        1. Starte @Macalubot auf Telegram
                        <br />
                        2. Klicke hier auf Verbinden
                      </p>
                    </div>

                    <div className="h-px bg-green-500/20" />

                    <div className="space-y-2">
                      <label className="text-xs text-green-500/70">VIRAL MARKETING BOT</label>
                      <Button
                        className={`w-full border ${state.marketing.active ? "bg-yellow-500/20 border-yellow-500 text-yellow-500" : "bg-transparent border-green-500/30 text-muted-foreground"}`}
                        onClick={() => system.toggleMarketing()}
                      >
                        {state.marketing.active ? "MARKETING AKTIV (STOPPEN)" : "MARKETING STARTEN"}
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-black/80 border-green-500/30">
                  <h3 className="text-lg font-bold text-green-500 mb-4 flex items-center gap-2">
                    <Wallet className="w-5 h-5" /> WALLET KONFIG
                  </h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Wallet Adresse..."
                      className="bg-black border-green-500/30 text-green-500 placeholder:text-green-500/30"
                      value={walletInput}
                      onChange={(e) => setWalletInput(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      className="w-full border-green-500/30 text-green-500 hover:bg-green-500/10 bg-transparent"
                      onClick={handleSaveWallet}
                    >
                      ADRESSE SPEICHERN
                    </Button>
                    {state.wallet.verified && (
                      <div className="text-xs text-green-500 flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Verifiziert & Bereit für Auszahlung
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-4 bg-black/80 border-blue-500/30 flex flex-col h-[300px]">
                  <h3 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> TELEGRAM KI UPLINK
                  </h3>

                  <div
                    ref={chatScrollRef}
                    className="flex-1 overflow-y-auto space-y-3 mb-3 pr-2 scrollbar-thin scrollbar-thumb-blue-900"
                  >
                    {chatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] p-2 rounded text-xs ${
                            msg.sender === "user"
                              ? "bg-blue-900/20 text-blue-200 border border-blue-500/30"
                              : "bg-green-900/10 text-green-300 border border-green-500/20"
                          }`}
                        >
                          {msg.sender === "bot" && (
                            <span className="text-[10px] text-green-500 block mb-1">@Macalubot</span>
                          )}
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      className="bg-black border-blue-500/30 text-blue-400 text-xs h-8 focus-visible:ring-blue-500"
                      placeholder="Nachricht an das System..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                    />
                    <Button size="sm" className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-500" onClick={handleChatSend}>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </div>

              {/* CENTER/RIGHT COLUMN: LOGS & VISUALIZATION */}
              <Card className="lg:col-span-2 p-0 bg-black border-green-500/30 flex flex-col h-[600px] overflow-hidden font-mono text-sm relative">
                <div className="p-3 border-b border-green-500/30 bg-green-900/10 flex justify-between items-center">
                  <span className="text-green-500 font-bold">SYSTEM_LOG_V.4.0.2</span>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                </div>

                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-black"
                >
                  {(radicalLogs || []).map((log) => (
                    <div key={log.id} className="flex gap-3 animate-in slide-in-from-left-2 duration-300">
                      <span className="text-green-500/50 shrink-0">[{log.timestamp}]</span>
                      <span
                        className={`
                        ${log.type === "error" ? "text-red-500 font-bold" : ""}
                        ${log.type === "warning" ? "text-yellow-500" : ""}
                        ${log.type === "success" ? "text-green-400" : ""}
                        ${log.type === "system" ? "text-blue-400 font-bold" : ""}
                        ${log.type === "info" ? "text-green-500/80" : ""}
                      `}
                      >
                        {log.type === "system" && "> "}
                        {log.message}
                      </span>
                    </div>
                  ))}
                  {(!radicalLogs || radicalLogs.length === 0) && (
                    <div className="text-green-900 text-center mt-20">WARTE AUF INPUT...</div>
                  )}
                  <div className="h-4" />
                </div>

                {/* Input Simulation Line */}
                <div className="p-3 border-t border-green-500/30 bg-black flex items-center gap-2 text-green-500">
                  <span className="animate-pulse">_</span>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* --- Neural Swarm Specific UI --- */}
        {mode === "NEURAL_SWARM" && isMining && (
          <div className="mb-6 grid grid-cols-1 lg:grid-cols-12 gap-4 animate-in fade-in duration-500">
            <Card className="lg:col-span-8 p-6 bg-card/50 backdrop-blur border-accent/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-accent">
                <Share2 className="w-6 h-6" />
                Nano Swarm Fabric ("Wormhole Mode")
              </h3>

              <div className="grid grid-cols-12 gap-1 h-64 opacity-80">
                {nanoBots.map((bot) => (
                  <div
                    key={bot.state.id}
                    className={`aspect-square rounded-sm flex items-center justify-center text-[10px] border transition-all duration-300
                        ${bot.state.role === "SCOUT" ? "border-yellow-500/50 text-yellow-500" : "border-blue-500/50 text-blue-500"}
                        ${bot.state.energy > 80 ? "bg-opacity-20 bg-current" : "bg-transparent"}
                      `}
                    title={`${bot.state.id} (${bot.state.role})\nEnergy: ${bot.state.energy.toFixed(1)}%`}
                  >
                    {bot.state.role === "SCOUT" ? "S" : "M"}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                <span>Active Nano-Agents: {nanoBots.length}</span>
                <span>Fabric Integrity: 100%</span>
                <span className="flex items-center gap-1 text-chart-3 font-bold">
                  <Zap className="w-3 h-3" />
                  Swarm Energy: {nanoBots.reduce((acc, bot) => acc + bot.state.energy, 0).toFixed(0)}
                </span>
              </div>
            </Card>

            <Card className="lg:col-span-4 p-4 space-y-4">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <Target className="w-4 h-4" /> Neural Agents
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {swarmState?.agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-2 bg-muted/20 rounded border border-border flex justify-between items-center text-xs"
                  >
                    <div>
                      <div className="font-bold text-accent">{agent.id}</div>
                      <div className="text-muted-foreground">
                        {agent.role} • {agent.status}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono">{agent.hashesPerSecond.toFixed(0)} H/s</div>
                      <div className="text-[10px] text-primary">Eff: {agent.efficiency.toFixed(1)}%</div>
                      {agent.earnings > 0 && (
                        <div className="text-[10px] text-chart-3 font-bold">+{agent.earnings.toFixed(4)} BTC</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* --- Tab Navigation --- */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <Button
            variant={activeTab === "dashboard" ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveTab("dashboard")}
          >
            <Activity className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === "workers" ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveTab("workers")}
          >
            <Cpu className="w-4 h-4 mr-2" />
            Workers
          </Button>
          <Button
            variant={activeTab === "blockchain" ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveTab("blockchain")}
          >
            <Database className="w-4 h-4 mr-2" />
            Blockchain
          </Button>
          <Button
            variant={activeTab === "analytics" ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveTab("analytics")}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button
            variant={activeTab === "market" ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveTab("market")}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Market
          </Button>
          <Button
            variant={activeTab === "shop" ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveTab("shop")}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Shop
          </Button>
          <Button
            variant={activeTab === "wallet" ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveTab("wallet")}
          >
            <Wallet className="w-4 h-4 mr-2" />
            Wallet
          </Button>
        </div>

        {/* --- Tab Content --- */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Dashboard Stats Cards */}
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <Badge variant="outline" className="text-xs">
                    LIVE
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-primary">{formatHashrate(stats.hashrate)}</div>
                <div className="text-xs text-muted-foreground mt-1">Hashrate</div>
              </Card>

              <Card className="p-4 bg-card/50 backdrop-blur border-border hover:border-accent/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <Database className="w-5 h-5 text-accent" />
                  <Badge variant="outline" className="text-xs">
                    BLOCKS
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-accent">{stats.blocksFound}</div>
                <div className="text-xs text-muted-foreground mt-1">Mined</div>
              </Card>

              <Card className="p-4 bg-card/50 backdrop-blur border-border hover:border-chart-3/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <DollarSign className="w-5 h-5 text-chart-3" />
                  <Badge variant="outline" className="text-xs">
                    BTC
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-chart-3">{stats.balance.toFixed(6)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  ≈ ${(stats.balance * stats.marketPrice).toLocaleString("en-US", { maximumFractionDigits: 2 })}
                </div>
              </Card>

              <Card className="p-4 bg-card/50 backdrop-blur border-border hover:border-chart-4/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <AlertTriangle className="w-5 h-5 text-chart-4" />
                  <Badge variant="outline" className="text-xs">
                    DIFF
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-chart-4">{stats.difficulty}</div>
                <div className="text-xs text-muted-foreground mt-1">Difficulty</div>
              </Card>

              <Card className="p-4 bg-card/50 backdrop-blur border-border hover:border-destructive/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <Zap className="w-5 h-5 text-destructive" />
                  <Badge variant="outline" className="text-xs">
                    POWER
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-destructive">{stats.powerConsumption.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground mt-1">Watts</div>
              </Card>

              <Card className="p-4 bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <Badge variant="outline" className="text-xs">
                    EFF
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-primary">{stats.efficiency.toFixed(2)} H/s per W</div>
                <div className="text-xs text-muted-foreground mt-1">Efficiency</div>
              </Card>

              <Card className="p-4 bg-card/50 backdrop-blur border-border hover:border-accent/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <Network className="w-5 h-5 text-accent" />
                  <Badge variant="outline" className="text-xs">
                    POOL
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-accent">{poolConnection.shareAccepted}</div>
                <div className="text-xs text-muted-foreground mt-1">Shares</div>
              </Card>

              <Card className="p-4 bg-card/50 backdrop-blur border-border hover:border-chart-5/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <HardDrive className="w-5 h-5 text-chart-5" />
                  <Badge variant="outline" className="text-xs">
                    MEMPOOL
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-chart-5">{mempool.length}</div>
                <div className="text-xs text-muted-foreground mt-1">Pending TX</div>
              </Card>
            </div>

            {/* Dashboard Wallet Summary */}
            <Card className="lg:col-span-4 p-4 bg-card/50 backdrop-blur border-border">
              <div className="text-xs text-muted-foreground mb-2">WALLET ADDRESS</div>
              <div className="text-xs font-mono text-primary break-all bg-muted/30 p-2 rounded mb-3">
                {engine.getWalletAddress()}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Est. Next Block</span>
                  <span className="text-foreground font-bold">
                    {stats.estimatedTime > 0 ? formatTime(stats.estimatedTime * 60) : "--"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Hashes</span>
                  <span className="text-foreground font-bold">{stats.totalHashes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Rejected Blocks</span>
                  <span className="text-destructive font-bold">{stats.rejectedBlocks}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">USD Value</span>
                  <span className="text-chart-3 font-bold">
                    ${(stats.balance * stats.marketPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </Card>

            {/* Worker Activity */}
            <Card className="lg:col-span-8 p-4 bg-card/50 backdrop-blur border-border h-[300px]">
              <div className="text-xs text-muted-foreground mb-4 flex justify-between items-center">
                <span>REAL-TIME HASH COMPUTATION</span>
                <Badge variant="outline">{workers.length} Workers Active</Badge>
              </div>
              <div className="h-full flex items-center justify-center relative overflow-hidden">
                {isMining ? (
                  <div className="w-full h-full flex flex-col gap-2">
                    {workers.map((worker) => (
                      <div key={worker.id} className="flex items-center gap-2 h-full">
                        <div className="text-xs text-muted-foreground w-20">WORKER {worker.id}</div>
                        <div className="flex-1 bg-muted/20 rounded-sm h-full relative overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary/50 to-accent/50 animate-data-flow"
                            style={{ animationDelay: `${worker.id * 0.2}s` }}
                          ></div>
                        </div>
                        <div className="text-xs text-primary w-28 text-right">{formatHashrate(worker.hashrate)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center">
                    <Cpu className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <div className="text-sm">Workers idle. Start mining to activate.</div>
                  </div>
                )}
              </div>
            </Card>

            {/* System Logs */}
            <Card className="lg:col-span-4 p-4 bg-card/50 backdrop-blur border-border h-[300px] flex flex-col">
              <div className="text-xs text-muted-foreground mb-4 flex justify-between items-center">
                <span>SYSTEM LOGS</span>
                <Button variant="ghost" size="sm" onClick={() => setLogs([])}>
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className={`transition-colors ${
                      log.type === "success"
                        ? "text-accent"
                        : log.type === "error"
                          ? "text-destructive"
                          : log.type === "mining"
                            ? "text-primary"
                            : log.type === "neural"
                              ? "text-purple-500"
                              : log.type === "system"
                                ? "text-blue-400 font-bold"
                                : "text-muted-foreground"
                    }`}
                  >
                    {log.type === "system" && "> "}[{log.timestamp}] {log.message}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </Card>
          </div>
        )}

        {/* --- Workers Tab --- */}
        {activeTab === "workers" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {workers.map((worker) => (
              <Card
                key={worker.id}
                className="p-4 bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-primary" />
                    <span className="font-bold text-foreground">WORKER #{worker.id}</span>
                  </div>
                  <Badge variant={isMining ? "default" : "secondary"} className="text-xs">
                    {isMining ? "ACTIVE" : "IDLE"}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Hashrate
                    </span>
                    <span className="text-primary font-bold">{formatHashrate(worker.hashrate)}</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Thermometer className="w-3 h-3" />
                      Temperature
                    </span>
                    <span
                      className={`font-bold ${
                        worker.temperature > 80
                          ? "text-destructive"
                          : worker.temperature > 70
                            ? "text-chart-4"
                            : "text-accent"
                      }`}
                    >
                      {worker.temperature.toFixed(1)}°C
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Network className="w-3 h-3" />
                      Shares
                    </span>
                    <span className="text-foreground font-bold">{worker.shares}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      Uptime
                    </span>
                    <span className="text-foreground font-bold">
                      {stats.startTime > 0 ? formatTime(Math.floor((Date.now() - stats.startTime) / 1000)) : "0s"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 h-2 bg-muted/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${Math.min((worker.hashrate / stats.hashrate) * 100 * workers.length, 100)}%` }}
                  ></div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* --- Blockchain Tab --- */}
        {activeTab === "blockchain" && (
          <div className="grid grid-cols-1 gap-4">
            <Card className="p-4 bg-card/50 backdrop-blur border-border">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-muted-foreground">
                  BLOCKCHAIN EXPLORER - {blockchain.length} Blocks -{" "}
                  {formatBytes(blockchain.reduce((sum, b) => sum + b.size, 0))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportData}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleReset}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {[...blockchain].reverse().map((block) => (
                  <Card
                    key={block.index}
                    className="p-4 bg-muted/20 border-border hover:border-primary/50 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <Badge variant="outline" className="font-mono">
                            BLOCK #{block.index}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(block.timestamp).toLocaleString()}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {formatBytes(block.size)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {block.transactions.length} TX
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1">
                            <div>
                              <span className="text-muted-foreground">Hash: </span>
                              <span className="text-primary font-mono break-all text-[10px]">{block.hash}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Prev Hash: </span>
                              <span className="text-muted font-mono break-all text-[10px]">{block.previousHash}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Merkle Root: </span>
                              <span className="text-chart-3 font-mono break-all text-[10px]">{block.merkleRoot}</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div>
                              <span className="text-muted-foreground">Nonce: </span>
                              <span className="text-foreground font-mono">{block.nonce.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Difficulty: </span>
                              <span className="text-chart-4 font-mono">{block.difficulty}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Miner: </span>
                              <span className="text-primary font-mono text-[10px] break-all">{block.miner}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center items-end gap-1">
                        <div className="text-xs text-muted-foreground">Block Reward</div>
                        <div className="text-2xl font-bold text-accent">{block.reward.toFixed(2)} BTC</div>
                        <div className="text-xs text-chart-3">
                          ${(block.reward * stats.marketPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* --- Analytics Tab --- */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-6 bg-card/50 backdrop-blur border-border">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Performance Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Current Hashrate</span>
                  <span className="text-sm font-bold text-primary">{formatHashrate(stats.hashrate)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Blocks/Hour</span>
                  <span className="text-sm font-bold text-accent">
                    {stats.blocksFound > 0 && stats.startTime > 0
                      ? (stats.blocksFound / ((Date.now() - stats.startTime) / 3600000)).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Avg Block Time</span>
                  <span className="text-sm font-bold text-foreground">
                    {stats.blocksFound > 1
                      ? formatTime(Math.floor((Date.now() - stats.startTime) / 1000 / stats.blocksFound))
                      : "--"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <span className="text-sm font-bold text-chart-3">
                    {stats.totalHashes > 0 ? ((stats.blocksFound / stats.totalHashes) * 100).toFixed(8) : "0.00000000"}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Efficiency</span>
                  <span className="text-sm font-bold text-primary">{stats.efficiency.toFixed(2)} H/W</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-border">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-chart-3" />
                Economic Analysis
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">BTC Balance</span>
                  <span className="text-sm font-bold text-chart-3">{stats.balance.toFixed(8)} BTC</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">USD Value</span>
                  <span className="text-sm font-bold text-accent">
                    ${(stats.balance * stats.marketPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Power Cost (est.)</span>
                  <span className="text-sm font-bold text-destructive">
                    ${((stats.powerConsumption / 1000) * 0.12 * ((Date.now() - stats.startTime) / 3600000)).toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Net Profit</span>
                  <span className="text-sm font-bold text-chart-3">
                    $
                    {(
                      stats.balance * stats.marketPrice -
                      (stats.powerConsumption / 1000) * 0.12 * ((Date.now() - stats.startTime) / 3600000)
                    ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ROI</span>
                  <span className="text-sm font-bold text-primary">
                    {stats.blocksFound > 0 ? "+" : ""}
                    {(
                      ((stats.balance * stats.marketPrice) /
                        Math.max(
                          (stats.powerConsumption / 1000) * 0.12 * ((Date.now() - stats.startTime) / 3600000),
                          0.01,
                        )) *
                        100 -
                      100
                    ).toFixed(2)}
                    %
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-border md:col-span-2 lg:col-span-3">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Network className="w-5 h-5 text-accent" />
                Pool Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Pool Status</span>
                  <Badge variant={poolConnection.connected ? "default" : "secondary"}>
                    {poolConnection.connected ? "CONNECTED" : "SIMULATED"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Shares Accepted</span>
                  <span className="text-sm font-bold text-accent">{poolConnection.shareAccepted}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Shares Rejected</span>
                  <span className="text-sm font-bold text-destructive">{poolConnection.shareRejected}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Acceptance Rate</span>
                  <span className="text-sm font-bold text-chart-3">
                    {poolConnection.shareAccepted + poolConnection.shareRejected > 0
                      ? (
                          (poolConnection.shareAccepted /
                            (poolConnection.shareAccepted + poolConnection.shareRejected)) *
                          100
                        ).toFixed(2)
                      : "0.00"}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Share</span>
                  <span className="text-sm font-bold text-foreground">
                    {poolConnection.lastShareTime > 0
                      ? formatTime(Math.floor((Date.now() - poolConnection.lastShareTime) / 1000)) + " ago"
                      : "Never"}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-border md:col-span-2 lg:col-span-3">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Difficulty Progression
              </h3>
              <div className="flex items-end gap-1 h-40">
                {blockchain.slice(-50).map((block, i) => {
                  const maxDiff = Math.max(...blockchain.map((b) => b.difficulty))
                  const height = (block.difficulty / maxDiff) * 100
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-chart-4/30 hover:bg-chart-4 transition-all rounded-t cursor-pointer group relative"
                      style={{ height: `${height}%`, minHeight: "10%" }}
                      title={`Block ${block.index}: Difficulty ${block.difficulty}`}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        #{block.index}: D{block.difficulty}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
                <span>Last 50 Blocks</span>
                <span>Current Difficulty: {stats.difficulty}</span>
              </div>
            </Card>
          </div>
        )}

        {/* --- Market Tab --- */}
        {activeTab === "market" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 p-6 bg-card/50 backdrop-blur border-border">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="w-6 h-6 text-primary" />
                  BTC/USD Live Market
                </h3>
                <div className="text-2xl font-bold text-accent">
                  ${stats.marketPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="h-[400px] flex items-end gap-1 bg-muted/10 rounded-lg p-4 relative overflow-hidden">
                {Array.from({ length: 40 }).map((_, i) => {
                  const height = 30 + Math.random() * 50
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-primary/20 hover:bg-primary/50 transition-all rounded-t"
                      style={{ height: `${height}%` }}
                    ></div>
                  )
                })}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-gradient-to-t from-background/20 to-transparent"></div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-border">
              <h3 className="text-lg font-bold mb-4">Market Depth</h3>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between text-muted-foreground border-b border-border pb-2">
                  <span>Price (USD)</span>
                  <span>Amount (BTC)</span>
                  <span>Total</span>
                </div>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex justify-between text-destructive">
                    <span>{(stats.marketPrice + i * 10 + 50).toFixed(2)}</span>
                    <span>{(Math.random() * 2).toFixed(4)}</span>
                    <span>{(Math.random() * 100000).toFixed(2)}</span>
                  </div>
                ))}
                <div className="py-2 text-center text-accent font-bold border-y border-border my-2">
                  {stats.marketPrice.toFixed(2)} USD
                </div>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex justify-between text-accent">
                    <span>{(stats.marketPrice - i * 10 - 50).toFixed(2)}</span>
                    <span>{(Math.random() * 2).toFixed(4)}</span>
                    <span>{(Math.random() * 100000).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* --- Shop Tab --- */}
        {activeTab === "shop" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {inventory.map((item) => (
              <Card
                key={item.id}
                className="p-6 bg-card/50 backdrop-blur border-border hover:border-primary transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 bg-muted/50 rounded-bl-lg">
                  <span className="text-xs font-bold">OWNED: {item.owned}</span>
                </div>
                <div className="mb-4 p-4 bg-muted/20 rounded-full w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {item.icon === "Cpu" && <Cpu className="w-8 h-8 text-primary" />}
                  {item.icon === "Server" && <Server className="w-8 h-8 text-accent" />}
                  {item.icon === "Zap" && <Zap className="w-8 h-8 text-chart-3" />}
                  {item.icon === "Brain" && <Brain className="w-8 h-8 text-chart-4" />}
                </div>
                <h3 className="text-lg font-bold mb-1">{item.name}</h3>
                <div className="text-2xl font-bold text-primary mb-4">{formatHashrate(item.hashrate)}</div>
                <div className="space-y-2 text-sm text-muted-foreground mb-6">
                  <div className="flex justify-between">
                    <span>Power Usage</span>
                    <span>{item.power}W</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Efficiency</span>
                    <span>{(item.hashrate / item.power / 1000000).toFixed(2)} MH/W</span>
                  </div>
                </div>
                <Button
                  className="w-full font-bold"
                  variant={stats.balance >= item.cost || isAdmin ? "default" : "outline"}
                  disabled={!isAdmin && stats.balance < item.cost}
                  onClick={() => handleBuyHardware(item.id)}
                >
                  {isAdmin ? "ADMIN BYPASS" : stats.balance >= item.cost ? "BUY NOW" : "INSUFFICIENT FUNDS"}
                  <span className="ml-2 text-xs opacity-80">({item.cost} BTC)</span>
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* --- Wallet Tab --- */}
        {activeTab === "wallet" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-card/50 backdrop-blur border-border">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Wallet className="w-6 h-6 text-primary" />
                Wallet Management
              </h3>
              {isAdmin && (
                <div className="mb-6 p-4 border border-destructive/50 rounded bg-destructive/10">
                  <div className="text-xs font-bold text-destructive mb-2">ADMIN CONTROLS</div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      // Hacky way to add balance since we didn't expose a method,
                      // but we can just buy negative cost items or we can add a method.
                      // Actually, let's just use the buy bypass to get rich via hardware.
                      // Or better, let's just toggle the mode.
                      setIsAdmin(!isAdmin)
                    }}
                  >
                    DISABLE ADMIN MODE
                  </Button>
                </div>
              )}
              <div className="space-y-6">
                <div className="p-4 bg-muted/20 rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Total Balance</div>
                  <div className="text-3xl font-bold text-chart-3 mb-1">{stats.balance.toFixed(8)} BTC</div>
                  <div className="text-sm text-muted-foreground">
                    ≈ ${(stats.balance * stats.marketPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Recipient Address</label>
                    <Input
                      placeholder="bc1q..."
                      value={withdrawAddress}
                      onChange={(e) => setWithdrawAddress(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount (BTC)</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="0.00000000"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="font-mono"
                      />
                      <Button variant="outline" onClick={() => setWithdrawAmount(stats.balance.toString())}>
                        MAX
                      </Button>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleWithdraw}
                    disabled={!withdrawAmount || !withdrawAddress || Number.parseFloat(withdrawAmount) > stats.balance}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    SEND TRANSACTION
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-border">
              <h3 className="text-xl font-bold mb-6">Recent Transactions</h3>
              <div className="space-y-4">
                {engine
                  .getMempool()
                  .slice(0, 5)
                  .map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 bg-muted/10 rounded border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <ArrowRight className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs font-mono text-muted-foreground">{tx.id.substring(0, 12)}...</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-foreground">-{tx.amount.toFixed(8)} BTC</div>
                        <div className="text-xs text-accent">Processing</div>
                      </div>
                    </div>
                  ))}
                {engine.getMempool().length === 0 && (
                  <div className="text-center text-muted-foreground py-8">No recent transactions</div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
