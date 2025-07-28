/**
 * Feature module type definitions
 */

import { Component } from './core';

/**
 * Spark State Manager
 */
export interface SparkStateManager {
  state: SparkState;
  subscribers: Set<SparkStateSubscriber>;
  
  getState(): SparkState;
  setState(updates: Partial<SparkState>): void;
  
  subscribe(callback: SparkStateSubscriber): () => void;
  notify(): void;
  
  // Convenience methods
  isInitialized(): boolean;
  hasWallet(): boolean;
  getBalance(): SparkBalance;
  getChannels(): SparkChannel[];
}

export interface SparkState {
  initialized: boolean;
  connected: boolean;
  wallet: SparkWallet | null;
  balance: SparkBalance;
  channels: SparkChannel[];
  transactions: SparkTransaction[];
  settings: SparkSettings;
}

export interface SparkWallet {
  address: string;
  publicKey: string;
  nodeId?: string;
  alias?: string;
}

export interface SparkBalance {
  onchain: number;
  lightning: number;
  total: number;
  pending: number;
}

export interface SparkChannel {
  id: string;
  peerId: string;
  capacity: number;
  localBalance: number;
  remoteBalance: number;
  state: 'opening' | 'open' | 'closing' | 'closed';
  isActive: boolean;
}

export interface SparkTransaction {
  id: string;
  type: 'onchain' | 'lightning';
  direction: 'send' | 'receive';
  amount: number;
  fee?: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  description?: string;
}

export interface SparkSettings {
  autoConnect: boolean;
  defaultFeeRate: number;
  maxChannelSize: number;
  minChannelSize: number;
}

export type SparkStateSubscriber = (state: SparkState) => void;

/**
 * Spark SDK Service
 */
export interface SparkSDKService {
  sdk: any; // Actual Spark SDK instance
  initialized: boolean;
  
  initialize(options?: SparkInitOptions): Promise<void>;
  isInitialized(): boolean;
  
  // Wallet operations
  generateWallet(mnemonic: string): Promise<SparkGenerateResult>;
  importWallet(mnemonic: string): Promise<SparkImportResult>;
  getBalance(address: string): Promise<SparkBalance>;
  
  // Transaction operations
  sendTransaction(params: SparkSendParams): Promise<SparkSendResult>;
  getTransactionHistory(address: string): Promise<SparkTransaction[]>;
  
  // Lightning operations
  openChannel(params: SparkChannelParams): Promise<SparkChannel>;
  closeChannel(channelId: string): Promise<void>;
  getChannels(): Promise<SparkChannel[]>;
  
  // Invoice operations
  createInvoice(amount: number, description?: string): Promise<SparkInvoice>;
  payInvoice(invoice: string): Promise<SparkPaymentResult>;
  decodeInvoice(invoice: string): Promise<SparkDecodedInvoice>;
}

export interface SparkInitOptions {
  network?: 'mainnet' | 'testnet';
  apiUrl?: string;
  timeout?: number;
}

export interface SparkGenerateResult {
  mnemonic: string;
  addresses: {
    bitcoin: string;
    spark: string;
  };
  privateKeys: {
    bitcoin: {
      wif: string;
      hex: string;
    };
    spark: {
      hex: string;
    };
  };
}

export interface SparkImportResult extends SparkGenerateResult {}

export interface SparkSendParams {
  to: string;
  amount: number;
  fee?: number;
  memo?: string;
  useChannel?: boolean;
}

export interface SparkSendResult {
  txid: string;
  fee: number;
  timestamp: number;
}

export interface SparkChannelParams {
  peerId: string;
  amount: number;
  pushAmount?: number;
}

export interface SparkInvoice {
  invoice: string;
  paymentHash: string;
  amount: number;
  description?: string;
  expiry: number;
}

export interface SparkPaymentResult {
  paymentHash: string;
  preimage: string;
  fee: number;
  timestamp: number;
}

export interface SparkDecodedInvoice {
  paymentHash: string;
  amount: number;
  description?: string;
  expiry: number;
  route?: string[];
}

/**
 * Ordinals Manager
 */
export interface OrdinalsManager extends Component {
  ordinals: Ordinal[];
  loading: boolean;
  filters: OrdinalFilters;
  
  loadOrdinals(address: string): Promise<void>;
  refreshOrdinals(): Promise<void>;
  
  getOrdinal(inscriptionId: string): Promise<OrdinalDetail>;
  
  filterOrdinals(filters: OrdinalFilters): Ordinal[];
  sortOrdinals(sortBy: 'number' | 'rarity' | 'date'): void;
  
  onOrdinalClick(handler: (ordinal: Ordinal) => void): void;
}

export interface Ordinal {
  inscriptionId: string;
  inscriptionNumber: number;
  owner: string;
  content: string;
  contentType: string;
  timestamp: number;
  genesisHeight: number;
  genesisFee: number;
  genesisTransaction: string;
  location: string;
  output: string;
  offset: number;
}

export interface OrdinalDetail extends Ordinal {
  metadata?: Record<string, any>;
  collection?: string;
  attributes?: OrdinalAttribute[];
  preview?: string;
}

export interface OrdinalAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

export interface OrdinalFilters {
  contentType?: string;
  collection?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

/**
 * Price Ticker
 */
export interface PriceTicker extends Component {
  prices: PriceData;
  updateInterval: number;
  
  startUpdating(): void;
  stopUpdating(): void;
  
  updatePrices(): Promise<void>;
  getPrice(currency: string): number;
  
  formatPrice(amount: number, currency: string): string;
  convertBTC(amount: number, toCurrency: string): number;
}

export interface PriceData {
  BTC: {
    USD: number;
    EUR: number;
    GBP: number;
    JPY: number;
  };
  lastUpdate: number;
}

/**
 * Settings Manager
 */
export interface SettingsManager {
  settings: AppSettings;
  
  get<K extends keyof AppSettings>(key: K): AppSettings[K];
  set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void;
  
  reset(): void;
  export(): string;
  import(data: string): void;
  
  onChange(callback: (settings: AppSettings) => void): () => void;
}

export interface AppSettings {
  // General
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  
  // Network
  network: 'mainnet' | 'testnet';
  customNodes: string[];
  tor: boolean;
  
  // Security
  autoLockTimeout: number;
  requirePasswordOnSend: boolean;
  hideBalances: boolean;
  
  // Advanced
  feeRate: 'slow' | 'medium' | 'fast' | 'custom';
  customFeeRate?: number;
  utxoConsolidation: boolean;
  rbf: boolean;
  
  // Notifications
  enableNotifications: boolean;
  notificationTypes: {
    incoming: boolean;
    outgoing: boolean;
    confirmations: boolean;
    priceAlerts: boolean;
  };
}