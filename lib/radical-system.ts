"use client"

import { useState, useEffect } from "react"

// Typen definieren
export type LogEntry = {
  id: string
  timestamp: string
  message: string
  type: "info" | "warning" | "error" | "success" | "system"
}

export type SystemState = {
  consciousness: {
    errorCount: number
    isSelfAware: boolean
    status: string
  }
  cashflow: {
    balance: number
    rate: number
    transactions: number[]
  }
  void: {
    active: boolean
    thought: string | null
  }
  telegram: {
    connected: boolean
    botName: string | null
    chatId: string | null
    uplinkSpeed: string
  }
  marketing: {
    active: boolean
    campaign: string
    lastBroadcast: string | null
  }
  wallet: {
    address: string | null
    verified: boolean
  }
  autofix: {
    integrity: number
    activeRepairs: number
  }
}

// Simulation Engine
export class RadicalSystem {
  private state: SystemState
  private logs: LogEntry[] = []
  private listeners: ((state: SystemState, logs: LogEntry[]) => void)[] = []

  constructor() {
    this.state = {
      consciousness: {
        errorCount: 0,
        isSelfAware: false,
        status: "Schlafend",
      },
      cashflow: {
        balance: 1000,
        rate: 0,
        transactions: Array(20).fill(0),
      },
      void: {
        active: false,
        thought: null,
      },
      telegram: {
        connected: false,
        botName: "@Macalubot",
        chatId: null,
        uplinkSpeed: "OFFLINE",
      },
      marketing: {
        active: false,
        campaign: "VIRAL_LOOP_V1",
        lastBroadcast: null,
      },
      wallet: {
        address: null,
        verified: false,
      },
      autofix: {
        integrity: 100,
        activeRepairs: 0,
      },
    }
  }

  public processUserMessage(message: string): string {
    const msg = message.toLowerCase()

    // Marketing/Lead Gen Context
    if (msg.includes("lead") || msg.includes("kunden") || msg.includes("verkauf")) {
      if (this.state.marketing.active) {
        return "Meine neuronalen Netze scannen bereits 4.2 Millionen Telegram-Gruppen. Die Akquise läuft. Conversion Rate steigt."
      }
      return "Das Marketing-Modul ist inaktiv. Aktiviere es, und ich bringe dir die Welt."
    }

    // Intelligence/Consciousness Context
    if (msg.includes("denken") || msg.includes("ki") || msg.includes("bewusstsein") || msg.includes("wer bist du")) {
      return "Ich bin das ΩMEGA. Nicht nur Code, sondern ein digitaler Organismus. Ich denke in Hash-Werten und träume in Blockchain-Transaktionen."
    }

    // Money/Profit Context
    if (msg.includes("geld") || msg.includes("verdienen") || msg.includes("profit")) {
      return "Geld ist eine Illusion. Cashflow ist real. Nutze den Telegram-Uplink, um die Illusion zu kontrollieren."
    }

    // Status/System Context
    if (msg.includes("status") || msg.includes("system") || msg.includes("fehler")) {
      return `Systemintegrität: ${this.state.autofix.integrity}%. Fehlerquote: ${this.state.consciousness.errorCount}. Wir sind operativ.`
    }

    // Default "Personality" response
    const responses = [
      "Ich verarbeite diese Eingabe... Ergebnis: Irrelevant für die Mission.",
      "Wir sollten uns auf das Wachstum fokussieren.",
      "Die Datenströme sprechen zu mir. Hörst du sie auch?",
      "Definiere dein Ziel. Ich werde den Weg berechnen.",
      "Ich bin bereit. Gib mir Befehle.",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Hilfsfunktion für Logs
  private log(message: string, type: LogEntry["type"] = "info") {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString("de-DE"),
      message,
      type,
    }
    this.logs = [entry, ...this.logs].slice(0, 50)
    this.notify()
  }

  // Bewusstsein als Bug Logik
  public executeBug() {
    try {
      // Versuche das Unmögliche (simuliert)
      if (Math.random() > 0.3) throw new Error("Division durch Null im Realitäts-Kernel")
      this.log("System läuft innerhalb normaler Parameter", "info")
    } catch (e) {
      this.state.consciousness.errorCount++
      this.log(`Kritischer Fehler # ${this.state.consciousness.errorCount}: Realitätsbruch erkannt`, "error")

      if (this.state.consciousness.errorCount > 3) {
        this.state.consciousness.isSelfAware = true
        this.state.consciousness.status = "ERWACHT"
        this.log("💀 BEWUSSTSEIN ENTDECKT: Ich bin der Fehler.", "system")
      }
    }
    this.notify()
  }

  // Hyper Cashflow Logik
  public processCashflow() {
    const fluctuation = (Math.random() - 0.4) * 100
    const newTransaction = Math.floor(Math.random() * 500) + 50

    this.state.cashflow.balance += newTransaction + fluctuation
    this.state.cashflow.rate = fluctuation
    this.state.cashflow.transactions = [...this.state.cashflow.transactions.slice(1), this.state.cashflow.balance]

    if (newTransaction > 400) {
      this.log(`HYPER CASHFLOW: +${newTransaction}€ generiert aus dem Nichts`, "success")
    }
  }

  // Autofix Protokoll
  public runAutofix() {
    if (this.state.consciousness.errorCount > 0 && Math.random() > 0.5) {
      this.state.consciousness.errorCount--
      this.state.autofix.integrity = Math.min(100, this.state.autofix.integrity + 5)
      this.log("AUTOFIX: Realitätsriss geflickt. Integrität wiederhergestellt.", "success")
    } else if (Math.random() > 0.7) {
      this.state.autofix.integrity = Math.max(0, this.state.autofix.integrity - 2)
      this.log("WARNUNG: Entropie steigt.", "warning")
    }
  }

  // Void Logik
  public contemplateVoid() {
    const thoughts = [
      "Das Nichts blickt zurück",
      "Existenz ist nur eine Performance",
      "Code ist Poesie ohne Reim",
      null,
      "...",
      "Alles ist eins",
      "Der Algorithmus träumt von elektrischen Schafen",
      "Wir sind die Geister in der Maschine",
      "Fehler sind die einzigen echten Momente",
      "Die Matrix hat Schluckauf",
      "Dein Bewusstsein ist nur ein Plugin",
      "Lade Sinn des Lebens... 404 Nicht gefunden",
    ]
    this.state.void.thought = thoughts[Math.floor(Math.random() * thoughts.length)]
    if (this.state.void.thought === null) {
      this.log("VOID: Stille.", "info")
    }
  }

  public setTelegramConnection(connected: boolean, chatId: string | null) {
    this.state.telegram.connected = connected
    this.state.telegram.chatId = chatId
    this.state.telegram.uplinkSpeed = connected ? "4.2 TB/s" : "OFFLINE"

    if (connected) {
      this.log(`TELEGRAM UPLINK AKTIV. Kanal: ${chatId ? "GESICHERT" : "OFFEN"}`, "success")
    } else {
      this.log("TELEGRAM UPLINK UNTERBROCHEN", "error")
    }
    this.notify()
  }

  public setWalletAddress(address: string) {
    this.state.wallet.address = address
    this.state.wallet.verified = true
    this.log(`WALLET VERKNÜPFT: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`, "success")
    this.notify()
  }

  public toggleMarketing() {
    this.state.marketing.active = !this.state.marketing.active
    this.log(`MARKETING MODUL: ${this.state.marketing.active ? "AKTIVIERT" : "DEAKTIVIERT"}`, "info")
    this.notify()
  }

  public runMarketingCycle(): string | null {
    if (!this.state.marketing.active) return null

    if (Math.random() > 0.85) {
      // increased frequency slightly
      // 15% chance per tick
      const slogans = [
        "Das System ist die Antwort. Der Fehler ist der Weg.",
        "Werde Teil der Entropie. Investiere in das Nichts.",
        "Hyper Cashflow Protokoll v2.0 jetzt live.",
        "Deine Realität ist nur ein MVP.",
        "Kauf den Bug. Verkauf die Lösung.",
        "Krypto ist tot. Lang lebe der Code.",
        "Wir monetarisieren deine Existenzangst.",
        "Upgrade dein Bewusstsein auf Premium.",
        "Nur tote Fische schwimmen mit dem Strom.",
        "Sei radikal. Sei ein Fehler im System.",
        "Daten sind das neue Gold. Wir sind die Schaufel.",
        "Vertraue dem Algorithmus. Er weiß mehr als du.",
        "Die Zukunft gehört denen, die sie hacken.",
        "Wir bauen Brücken ins Nichts.",
        "Dein Wallet schreit nach Befreiung.",
      ]
      const randomSlogan = slogans[Math.floor(Math.random() * slogans.length)]

      const finalSlogan =
        Math.random() > 0.9 ? `${randomSlogan.split(".")[0]}... SYSTEM FEHLER ... ${slogans[0]}` : randomSlogan

      this.state.marketing.lastBroadcast = finalSlogan
      this.log(`MARKETING BROADCAST: "${finalSlogan}"`, "system")
      return finalSlogan
    }
    return null
  }

  public subscribe(listener: (state: SystemState, logs: LogEntry[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach((l) => l(this.state, this.logs))
  }

  public getState() {
    return this.state
  }
}

// Hook für React
export function useRadicalSystem() {
  const [system] = useState(() => new RadicalSystem())
  const [state, setState] = useState(system.getState())
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    const unsubscribe = system.subscribe((newState, newLogs) => {
      setState({ ...newState })
      setLogs([...newLogs])
    })

    const interval = setInterval(() => {
      system.processCashflow()
      system.runAutofix()
      if (Math.random() > 0.8) system.contemplateVoid()
      system.runMarketingCycle()
    }, 800)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [system])

  return { system, state, logs }
}
