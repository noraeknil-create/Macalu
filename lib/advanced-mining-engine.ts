export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  nonce: number;
  hash: string;
  previousHash: string;
  difficulty: number;
  miner: string;
  merkleRoot: string;
  size: number;
  reward: number;
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  fee: number;
  signature?: string;
}

export interface MiningStats {
  hashrate: number;
  blocksFound: number;
  totalHashes: number;
  startTime: number;
  balance: number;
  difficulty: number;
  estimatedTime: number;
  powerConsumption: number;
  efficiency: number;
  rejectedBlocks: number;
  poolHashrate: number;
  networkDifficulty: number;
  marketPrice: number;
  hardwareCount: number;
  virtualHashrate: number;
}

export interface PoolConnection {
  connected: boolean;
  poolUrl: string;
  shareAccepted: number;
  shareRejected: number;
  lastShareTime: number;
}

export interface WorkerStats {
  id: number;
  hashrate: number;
  shares: number;
  uptime: number;
  temperature: number;
}

export interface Hardware {
  id: string;
  name: string;
  hashrate: number;
  power: number;
  cost: number;
  icon: string;
  owned: number;
}

export class AdvancedMiningEngine {
  private blockchain: Block[] = [];
  private stats: MiningStats;
  private isMining: boolean = false;
  private walletAddress: string;
  private workers: WorkerStats[] = [];
  private poolConnection: PoolConnection;
  private mempool: Transaction[] = [];
  private difficulty: number = 4;
  private targetBlockTime: number = 600000; // 10 minutes in ms
  private readonly BLOCK_REWARD: number = 6.25;
  private readonly HALVING_INTERVAL: number = 210000;
  private marketPrice: number = 64000;
  private hardwareInventory: Hardware[] = [
    { id: 'gpu_std', name: 'NVIDIA RTX 3080', hashrate: 100000000, power: 320, cost: 0.005, icon: 'Cpu', owned: 0 },
    { id: 'asic_s19', name: 'Antminer S19 Pro', hashrate: 110000000000, power: 3250, cost: 0.05, icon: 'Server', owned: 0 },
    { id: 'quantum_v1', name: 'Q-Bit Processor', hashrate: 5000000000000, power: 5000, cost: 0.5, icon: 'Zap', owned: 0 },
    { id: 'neural_cluster', name: 'Neural Cluster', hashrate: 100000000000000, power: 15000, cost: 5.0, icon: 'Brain', owned: 0 }
  ];
  private lastPayoutTime: number = Date.now();

  constructor(walletAddress?: string) {
    this.walletAddress = walletAddress || this.generateWalletAddress();
    this.stats = {
      hashrate: 0,
      blocksFound: 0,
      totalHashes: 0,
      startTime: Date.now(),
      balance: 0,
      difficulty: this.difficulty,
      estimatedTime: 0,
      powerConsumption: 0,
      efficiency: 0,
      rejectedBlocks: 0,
      poolHashrate: 0,
      networkDifficulty: 0,
      marketPrice: 64000,
      hardwareCount: 0,
      virtualHashrate: 0
    };
    this.poolConnection = {
      connected: false,
      poolUrl: 'simulated-pool.local',
      shareAccepted: 0,
      shareRejected: 0,
      lastShareTime: 0
    };
    this.initializeWorkers();
    this.initBlockchain();
    this.loadFromStorage();
    this.startMarketSimulation();
  }

  private initializeWorkers(): void {
    const cpuCores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
    this.workers = Array.from({ length: cpuCores }, (_, i) => ({
      id: i + 1,
      hashrate: 0,
      shares: 0,
      uptime: 0,
      temperature: 45 + Math.random() * 10
    }));
  }

  private generateWalletAddress(): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let address = '1';
    for (let i = 0; i < 33; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
  }

  private initBlockchain(): void {
    if (this.blockchain.length === 0) {
      const genesisBlock: Block = {
        index: 0,
        timestamp: Date.now(),
        transactions: [],
        nonce: 0,
        hash: '0000000000000000000000000000000000000000000000000000000000000000',
        previousHash: '0',
        difficulty: this.difficulty,
        miner: 'SATOSHI_NAKAMOTO',
        merkleRoot: this.calculateMerkleRoot([]),
        size: 285,
        reward: 50
      };
      this.blockchain.push(genesisBlock);
    }
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem('advanced_mining_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.blockchain = data.blockchain || this.blockchain;
        this.stats = { ...this.stats, ...data.stats };
        this.walletAddress = data.walletAddress || this.walletAddress;
        this.mempool = data.mempool || [];
        this.difficulty = data.difficulty || this.difficulty;
        if (data.inventory) {
          this.hardwareInventory = this.hardwareInventory.map(item => {
            const savedItem = data.inventory.find((i: Hardware) => i.id === item.id);
            return savedItem ? { ...item, owned: savedItem.owned } : item;
          });
        }
      } catch (e) {
        console.error('[Mining Engine] Failed to load data:', e);
      }
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('advanced_mining_data', JSON.stringify({
        blockchain: this.blockchain,
        stats: this.stats,
        walletAddress: this.walletAddress,
        mempool: this.mempool,
        difficulty: this.difficulty,
        inventory: this.hardwareInventory
      }));
    } catch (e) {
      console.error('[Mining Engine] Failed to save data:', e);
    }
  }

  private calculateMerkleRoot(transactions: Transaction[]): string {
    if (transactions.length === 0) return '0'.repeat(64);
    
    const hashes = transactions.map(tx => this.hashTransaction(tx));
    let level = hashes;
    
    while (level.length > 1) {
      const newLevel: string[] = [];
      for (let i = 0; i < level.length; i += 2) {
        const left = level[i];
        const right = i + 1 < level.length ? level[i + 1] : left;
        newLevel.push(this.simpleHash(left + right));
      }
      level = newLevel;
    }
    
    return level[0];
  }

  private hashTransaction(tx: Transaction): string {
    const data = `${tx.from}${tx.to}${tx.amount}${tx.timestamp}${tx.fee}`;
    return this.simpleHash(data);
  }

  private simpleHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }

  async sha256(message: string): Promise<string> {
    if (typeof window === 'undefined') return this.simpleHash(message);
    
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      return this.simpleHash(message);
    }
  }

  private async calculateBlockHash(block: Partial<Block>): Promise<string> {
    const data = `${block.index}${block.timestamp}${block.merkleRoot}${block.nonce}${block.previousHash}${block.difficulty}`;
    return await this.sha256(data);
  }

  private adjustDifficulty(): void {
    if (this.blockchain.length < 11) return;
    
    const last10Blocks = this.blockchain.slice(-10);
    const timeSpan = last10Blocks[9].timestamp - last10Blocks[0].timestamp;
    const expectedTime = this.targetBlockTime * 10;
    
    if (timeSpan < expectedTime * 0.5) {
      this.difficulty = Math.min(this.difficulty + 1, 10);
    } else if (timeSpan > expectedTime * 2) {
      this.difficulty = Math.max(this.difficulty - 1, 1);
    }
    
    this.stats.difficulty = this.difficulty;
  }

  private calculateBlockReward(blockIndex: number): number {
    const halvings = Math.floor(blockIndex / this.HALVING_INTERVAL);
    return this.BLOCK_REWARD / Math.pow(2, halvings);
  }

  private createCoinbaseTransaction(blockIndex: number): Transaction {
    return {
      id: `coinbase_${blockIndex}_${Date.now()}`,
      from: 'COINBASE',
      to: this.walletAddress,
      amount: this.calculateBlockReward(blockIndex),
      timestamp: Date.now(),
      fee: 0
    };
  }

  private selectTransactionsFromMempool(): Transaction[] {
    const maxTransactions = 2000;
    return this.mempool
      .sort((a, b) => b.fee - a.fee)
      .slice(0, maxTransactions);
  }

  private async mineBlockWorker(
    block: Partial<Block>, 
    onProgress: (stats: Partial<MiningStats>) => void
  ): Promise<{ hash: string; nonce: number; hashes: number }> {
    const target = '0'.repeat(this.difficulty);
    let nonce = 0;
    let hash = '';
    const startTime = Date.now();
    const checkInterval = 1000;
    
    while (!hash.startsWith(target) && this.isMining) {
      nonce++;
      hash = await this.calculateBlockHash({ ...block, nonce });
      
      if (nonce % checkInterval === 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        const hashrate = nonce / elapsed;
        
        this.workers.forEach((worker, i) => {
          worker.hashrate = hashrate / this.workers.length;
          worker.temperature = 45 + Math.random() * 30 + (hashrate / 10000);
          worker.shares += Math.floor(Math.random() * 3);
        });
        
        const powerConsumption = (hashrate / 1000) * 1.5;
        const efficiency = hashrate / Math.max(powerConsumption, 1);
        
        onProgress({
          hashrate: Math.round(hashrate),
          totalHashes: this.stats.totalHashes + nonce,
          powerConsumption: Math.round(powerConsumption),
          efficiency: Math.round(efficiency * 100) / 100,
          estimatedTime: Math.round((Math.pow(16, this.difficulty) / hashrate) / 60)
        });
      }
    }
    
    return { hash, nonce, hashes: nonce };
  }

  async startMining(
    onUpdate: (stats: MiningStats) => void, 
    onBlockFound: (block: Block) => void,
    onWorkerUpdate?: (workers: WorkerStats[]) => void
  ): Promise<void> {
    if (this.isMining) return;
    
    this.isMining = true;
    this.stats.startTime = Date.now();
    this.lastPayoutTime = Date.now();
    
    const mineLoop = async () => {
      while (this.isMining) {
        this.processPoolPayouts();
        
        const previousBlock = this.blockchain[this.blockchain.length - 1];
        const selectedTransactions = this.selectTransactionsFromMempool();
        const coinbase = this.createCoinbaseTransaction(previousBlock.index + 1);
        const allTransactions = [coinbase, ...selectedTransactions];
        
        const newBlock: Partial<Block> = {
          index: previousBlock.index + 1,
          timestamp: Date.now(),
          transactions: allTransactions,
          previousHash: previousBlock.hash,
          difficulty: this.difficulty,
          miner: this.walletAddress,
          merkleRoot: this.calculateMerkleRoot(allTransactions),
          size: 80 + allTransactions.length * 250,
          reward: this.calculateBlockReward(previousBlock.index + 1)
        };
        
        const result = await this.mineBlockWorker(newBlock, (partialStats) => {
          const virtualHashrate = this.getVirtualHashrate();
          this.stats = { 
            ...this.stats, 
            ...partialStats,
            hashrate: partialStats.hashrate! + virtualHashrate,
            virtualHashrate: virtualHashrate,
            marketPrice: this.marketPrice
          };
          onUpdate({ ...this.stats });
          if (onWorkerUpdate) onWorkerUpdate([...this.workers]);
        });
        
        if (!this.isMining) break;
        
        const minedBlock: Block = {
          ...newBlock as Block,
          hash: result.hash,
          nonce: result.nonce
        };
        
        const isValid = await this.validateBlock(minedBlock);
        
        if (isValid) {
          this.blockchain.push(minedBlock);
          this.stats.blocksFound++;
          this.stats.balance += minedBlock.reward;
          this.stats.totalHashes += result.hashes;
          
          this.mempool = this.mempool.filter(
            tx => !selectedTransactions.some(st => st.id === tx.id)
          );
          
          this.adjustDifficulty();
          
          this.poolConnection.shareAccepted++;
          this.poolConnection.lastShareTime = Date.now();
          
          this.saveToStorage();
          onBlockFound(minedBlock);
        } else {
          this.stats.rejectedBlocks++;
          this.poolConnection.shareRejected++;
        }
        
        onUpdate({ ...this.stats });
      }
    };
    
    mineLoop();
  }

  private async validateBlock(block: Block): Promise<boolean> {
    const target = '0'.repeat(block.difficulty);
    if (!block.hash.startsWith(target)) return false;
    
    const recalculatedHash = await this.calculateBlockHash(block);
    if (recalculatedHash !== block.hash) return false;
    
    if (block.index > 0) {
      const previousBlock = this.blockchain[block.index - 1];
      if (block.previousHash !== previousBlock.hash) return false;
    }
    
    return true;
  }

  stopMining(): void {
    this.isMining = false;
    this.saveToStorage();
  }

  addTransaction(from: string, to: string, amount: number, fee: number = 0.0001): void {
    const tx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from,
      to,
      amount,
      timestamp: Date.now(),
      fee
    };
    this.mempool.push(tx);
    this.saveToStorage();
  }

  getStats(): MiningStats {
    return { ...this.stats };
  }

  getBlockchain(): Block[] {
    return [...this.blockchain];
  }

  getWalletAddress(): string {
    return this.walletAddress;
  }

  getMiningStatus(): boolean {
    return this.isMining;
  }

  getWorkers(): WorkerStats[] {
    return [...this.workers];
  }

  getPoolConnection(): PoolConnection {
    return { ...this.poolConnection };
  }

  getMempool(): Transaction[] {
    return [...this.mempool];
  }

  resetBlockchain(): void {
    this.blockchain = [];
    this.mempool = [];
    this.difficulty = 4;
    this.stats = {
      hashrate: 0,
      blocksFound: 0,
      totalHashes: 0,
      startTime: Date.now(),
      balance: 0,
      difficulty: this.difficulty,
      estimatedTime: 0,
      powerConsumption: 0,
      efficiency: 0,
      rejectedBlocks: 0,
      poolHashrate: 0,
      networkDifficulty: 0,
      marketPrice: 64000,
      hardwareCount: 0,
      virtualHashrate: 0
    };
    this.poolConnection = {
      connected: false,
      poolUrl: 'simulated-pool.local',
      shareAccepted: 0,
      shareRejected: 0,
      lastShareTime: 0
    };
    this.initBlockchain();
    this.saveToStorage();
  }

  exportToJSON(): string {
    return JSON.stringify({
      blockchain: this.blockchain,
      stats: this.stats,
      wallet: this.walletAddress,
      mempool: this.mempool,
      workers: this.workers,
      poolConnection: this.poolConnection,
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  private startMarketSimulation() {
    if (typeof window === 'undefined') return;
    setInterval(() => {
      const change = (Math.random() - 0.5) * 200;
      this.marketPrice = Math.max(1000, this.marketPrice + change);
      this.stats.marketPrice = this.marketPrice;
    }, 5000);
  }

  private processPoolPayouts() {
    const now = Date.now();
    if (now - this.lastPayoutTime > 1000) { // Every second
      const virtualHashrate = this.getVirtualHashrate();
      if (virtualHashrate > 0) {
        const payout = (virtualHashrate / 1000000000000) * 0.0000001;
        this.stats.balance += payout;
        this.stats.poolHashrate = virtualHashrate;
      }
      this.lastPayoutTime = now;
    }
  }

  private getVirtualHashrate(): number {
    return this.hardwareInventory.reduce((sum, item) => sum + (item.hashrate * item.owned), 0);
  }

  buyHardware(hardwareId: string, bypassCost: boolean = false): boolean {
    const item = this.hardwareInventory.find(i => i.id === hardwareId);
    if (!item) return false;
    
    if (bypassCost || this.stats.balance >= item.cost) {
      if (!bypassCost) {
        this.stats.balance -= item.cost;
      }
      item.owned++;
      this.stats.hardwareCount++;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  getInventory(): Hardware[] {
    return [...this.hardwareInventory];
  }

  withdraw(amount: number, address: string): boolean {
    if (this.stats.balance >= amount) {
      this.stats.balance -= amount;
      this.addTransaction(this.walletAddress, address, amount, 0.0005);
      this.saveToStorage();
      return true;
    }
    return false;
  }
}
