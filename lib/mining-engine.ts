export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  nonce: number;
  hash: string;
  previousHash: string;
  difficulty: number;
  miner: string;
}

export interface Transaction {
  from: string;
  to: string;
  amount: number;
  timestamp: number;
}

export interface MiningStats {
  hashrate: number;
  blocksFound: number;
  totalHashes: number;
  startTime: number;
  balance: number;
  difficulty: number;
  estimatedTime: number;
}

export class MiningEngine {
  private blockchain: Block[] = [];
  private stats: MiningStats;
  private isMining: boolean = false;
  private walletAddress: string;

  constructor(walletAddress?: string) {
    this.walletAddress = walletAddress || this.generateWalletAddress();
    this.stats = {
      hashrate: 0,
      blocksFound: 0,
      totalHashes: 0,
      startTime: Date.now(),
      balance: 0,
      difficulty: 4,
      estimatedTime: 0
    };
    this.initBlockchain();
    this.loadFromStorage();
  }

  private generateWalletAddress(): string {
    const chars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
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
        difficulty: this.stats.difficulty,
        miner: 'GENESIS'
      };
      this.blockchain.push(genesisBlock);
    }
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem('mining_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.blockchain = data.blockchain || this.blockchain;
        this.stats = { ...this.stats, ...data.stats };
        this.walletAddress = data.walletAddress || this.walletAddress;
      } catch (e) {
        console.error('Failed to load mining data:', e);
      }
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('mining_data', JSON.stringify({
      blockchain: this.blockchain,
      stats: this.stats,
      walletAddress: this.walletAddress
    }));
  }

  async sha256(message: string): Promise<string> {
    if (typeof window === 'undefined') return '';
    
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async calculateBlockHash(block: Partial<Block>): Promise<string> {
    const data = `${block.index}${block.timestamp}${JSON.stringify(block.transactions)}${block.nonce}${block.previousHash}${block.difficulty}`;
    return await this.sha256(data);
  }

  private async mineBlockWorker(
    block: Partial<Block>, 
    onProgress: (hashrate: number, nonce: number) => void
  ): Promise<{ hash: string; nonce: number; hashes: number }> {
    const target = '0'.repeat(this.stats.difficulty);
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
        onProgress(hashrate, nonce);
      }
    }
    
    const totalTime = (Date.now() - startTime) / 1000;
    const finalHashrate = nonce / totalTime;
    
    return { hash, nonce, hashes: nonce };
  }

  async startMining(
    onUpdate: (stats: MiningStats) => void, 
    onBlockFound: (block: Block) => void
  ): Promise<void> {
    if (this.isMining) return;
    
    this.isMining = true;
    this.stats.startTime = Date.now();
    
    const mineLoop = async () => {
      while (this.isMining) {
        const previousBlock = this.blockchain[this.blockchain.length - 1];
        
        const newBlock: Partial<Block> = {
          index: previousBlock.index + 1,
          timestamp: Date.now(),
          transactions: [{
            from: 'NETWORK',
            to: this.walletAddress,
            amount: 6.25,
            timestamp: Date.now()
          }],
          previousHash: previousBlock.hash,
          difficulty: this.stats.difficulty,
          miner: this.walletAddress
        };
        
        const result = await this.mineBlockWorker(newBlock, (hashrate, nonce) => {
          this.stats.hashrate = Math.round(hashrate);
          this.stats.totalHashes += 1000;
          this.stats.estimatedTime = Math.round((Math.pow(16, this.stats.difficulty) / hashrate) / 60);
          onUpdate({ ...this.stats });
        });
        
        if (!this.isMining) break;
        
        const minedBlock: Block = {
          ...newBlock as Block,
          hash: result.hash,
          nonce: result.nonce
        };
        
        this.blockchain.push(minedBlock);
        this.stats.blocksFound++;
        this.stats.balance += 6.25;
        this.stats.totalHashes += result.hashes;
        
        if (this.stats.blocksFound % 10 === 0) {
          this.stats.difficulty++;
        }
        
        this.saveToStorage();
        onBlockFound(minedBlock);
        onUpdate({ ...this.stats });
      }
    };
    
    mineLoop();
  }

  stopMining(): void {
    this.isMining = false;
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

  resetBlockchain(): void {
    this.blockchain = [];
    this.stats = {
      hashrate: 0,
      blocksFound: 0,
      totalHashes: 0,
      startTime: Date.now(),
      balance: 0,
      difficulty: 4,
      estimatedTime: 0
    };
    this.initBlockchain();
    this.saveToStorage();
  }
}
