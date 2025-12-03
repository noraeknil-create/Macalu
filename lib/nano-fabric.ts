import { SHA256 } from './crypto-utils'; // Assuming this exists or we use Web Crypto

// --- 1. Core Interfaces aus dem Bauplan ---

export interface KnowledgeChunk {
  id: string;
  type: 'NONCE_RANGE' | 'SOLUTION' | 'BLOCK_DATA';
  content: any;
  vector?: number[]; // Für Ähnlichkeitssuche (optional)
  createdAt: number;
}

export interface Link {
  target: string;
  weight: number;
  type: "synapse" | "bridge" | "tunnel" | "wormhole";
  bandwidth: number;
}

export interface MicroProgram {
  id: string;
  name: string;
  execute: (bot: NanoBot) => Promise<void>;
}

export interface NanoBotState {
  id: string;
  role: 'SCOUT' | 'MINER' | 'VERIFIER';
  energy: number;
  memory: KnowledgeChunk[];
  links: Link[];
  programs: MicroProgram[];
  efficiency: number;
}

// --- 2. NanoBot (Die intelligente Ameise) ---

export class NanoBot {
  state: NanoBotState;
  private swarm: SwarmController;

  constructor(id: string, role: NanoBotState['role'], swarm: SwarmController) {
    this.swarm = swarm;
    this.state = {
      id,
      role,
      energy: 100,
      memory: [],
      links: [],
      programs: [],
      efficiency: 1.0
    };
  }

  // Speichert Daten (z.B. einen zugewiesenen Suchbereich)
  store(chunk: KnowledgeChunk) {
    this.state.memory.push(chunk);
    // Energieverbrauch für Speicherung
    this.state.energy -= 0.05; 
  }

  addLink(target: string, type: Link["type"], weight = 1, bandwidth = 1) {
    this.state.links.push({ target, type, weight, bandwidth });
  }

  registerProgram(program: MicroProgram) {
    this.state.programs.push(program);
  }

  async runPrograms() {
    if (this.state.energy <= 0) {
        this.state.energy += 5; // Recharge tick
        return;
    }

    for (const p of this.state.programs) {
      await p.execute(this);
      // Energieverbrauch basierend auf Programmkomplexität
      this.state.energy -= 0.1;
    }
  }

  // Sendet Daten an verknüpfte Bots oder Controller
  async transmit(chunk: KnowledgeChunk, targetId?: string) {
      if (targetId) {
          const target = this.swarm.getBot(targetId);
          if (target) target.store(chunk);
      } else {
          // Broadcast an alle verknüpften Nachbarn
          for (const link of this.state.links) {
              const target = this.swarm.getBot(link.target);
              if (target) target.store(chunk);
          }
      }
  }
}

// --- 3. SwarmController (Das Kollektiv-Gehirn) ---

export class SwarmController {
  private bots = new Map<string, NanoBot>();
  private globalMemory = new Map<string, KnowledgeChunk>();
  private onSolutionFound: (solution: any) => void;

  constructor(onSolutionFound: (sol: any) => void) {
      this.onSolutionFound = onSolutionFound;
  }

  register(bot: NanoBot) {
    this.bots.set(bot.state.id, bot);
  }

  getBot(id: string) {
    return this.bots.get(id);
  }

  getAllBots() {
      return Array.from(this.bots.values());
  }

  // Verteilt Arbeit (Nonce-Ranges) an Scouts
  dispatchWork(blockData: string, difficulty: number) {
      const bots = Array.from(this.bots.values());
      const rangeSize = 1000000; // 1M Hashes pro Chunk
      
      let currentNonce = 0;

      bots.forEach(bot => {
          if (bot.state.role === 'SCOUT' || bot.state.role === 'MINER') {
              // Erstelle ein Mikroprogramm für diesen spezifischen Job
              const miningJob: MicroProgram = {
                  id: `mine-${Date.now()}-${currentNonce}`,
                  name: 'SHA256_SEARCH',
                  execute: async (b) => {
                      // Simuliere High-Speed Hashing (in Realität würde hier WebWorker Code laufen)
                      // Wir nutzen hier eine vereinfachte Logik für die Demo der Architektur
                      const start = currentNonce;
                      const end = start + rangeSize;
                      
                      // Hier würde der echte Hash-Loop laufen
                      // Wir simulieren Erfolg basierend auf Wahrscheinlichkeit für die Demo
                      // In der echten App nutzen wir die existierende Mining-Engine Logik hier
                      
                      b.state.energy -= 0.5; // Mining kostet Energie
                      
                      // Wenn Lösung gefunden (simuliert für Architektur-Demo)
                      // b.transmit({ ...solution }, 'CONTROLLER');
                  }
              };
              
              bot.registerProgram(miningJob);
              currentNonce += rangeSize;
          }
      });
  }

  // Empfängt Lösungen von Bots
  receiveSolution(solution: any) {
      this.onSolutionFound(solution);
  }
}

// --- 4. Factory für das System ---

export function createNanoSwarm(size: number, onSolution: (sol: any) => void) {
    const controller = new SwarmController(onSolution);
    
    for (let i = 0; i < size; i++) {
        const role = i < size * 0.2 ? 'SCOUT' : 'MINER'; // 20% Scouts, 80% Miner
        const bot = new NanoBot(`bot-${i}`, role, controller);
        
        // Vernetzung: Jeder Bot kennt 2-3 andere (Small World Network)
        if (i > 0) {
            bot.addLink(`bot-${i-1}`, 'synapse');
        }
        
        controller.register(bot);
    }

    // Wurmlöcher für schnelle Datenübertragung von Scouts zu Minern
    const scouts = controller.getAllBots().filter(b => b.state.role === 'SCOUT');
    const miners = controller.getAllBots().filter(b => b.state.role === 'MINER');
    
    scouts.forEach(scout => {
        // Verbinde jeden Scout mit zufälligen Minern via Wurmloch
        const randomMiner = miners[Math.floor(Math.random() * miners.length)];
        if (randomMiner) {
            scout.addLink(randomMiner.state.id, 'wormhole', 10, 100);
        }
    });

    return controller;
}
