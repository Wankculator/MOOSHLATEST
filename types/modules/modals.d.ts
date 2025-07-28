/**
 * Modal component type definitions
 */

import { Component } from './core';

/**
 * Base Modal interface
 */
export interface Modal extends Component {
  isOpen: boolean;
  title: string;
  closable: boolean;
  
  open(): void;
  close(): void;
  toggle(): void;
  
  onOpen?(data?: any): void;
  onClose?(): void;
  
  setTitle(title: string): void;
  setContent(content: HTMLElement | string): void;
}

/**
 * Spark Dashboard Modal
 */
export interface SparkDashboardModal extends Modal {
  sparkData: SparkDashboardData | null;
  activeTab: 'overview' | 'channels' | 'transactions' | 'settings';
  
  loadDashboardData(): Promise<void>;
  refreshData(): Promise<void>;
  
  switchTab(tab: string): void;
  
  handleOpenChannel(): void;
  handleCloseChannel(channelId: string): void;
  handleSendPayment(): void;
  handleCreateInvoice(): void;
}

export interface SparkDashboardData {
  wallet: {
    address: string;
    nodeId: string;
    alias?: string;
  };
  balance: {
    onchain: number;
    lightning: number;
    total: number;
  };
  channels: SparkChannelData[];
  transactions: SparkTransactionData[];
  stats: {
    totalReceived: number;
    totalSent: number;
    totalFees: number;
    activeChannels: number;
  };
}

export interface SparkChannelData {
  id: string;
  peerId: string;
  peerAlias?: string;
  capacity: number;
  localBalance: number;
  remoteBalance: number;
  state: string;
  opened: number;
  lastUpdate: number;
}

export interface SparkTransactionData {
  id: string;
  type: 'payment' | 'invoice' | 'channel_open' | 'channel_close';
  amount: number;
  fee?: number;
  timestamp: number;
  status: string;
  description?: string;
}

/**
 * Spark Deposit Modal
 */
export interface SparkDepositModal extends Modal {
  depositAddress: string | null;
  amount: string;
  generating: boolean;
  
  generateDepositAddress(): Promise<void>;
  copyAddress(): void;
  
  handleDeposit(): Promise<void>;
  checkDepositStatus(): Promise<void>;
}

/**
 * Lightning Channel Modal
 */
export interface LightningChannelModal extends Modal {
  mode: 'open' | 'close' | 'manage';
  channelData: LightningChannelInfo | null;
  
  // Open channel
  peerId: string;
  amount: string;
  pushAmount: string;
  
  validatePeerId(peerId: string): boolean;
  calculateFees(): Promise<number>;
  
  handleOpenChannel(): Promise<void>;
  handleCloseChannel(): Promise<void>;
  
  // Channel management
  loadChannelInfo(channelId: string): Promise<void>;
  updateChannelFees(baseFee: number, feeRate: number): Promise<void>;
}

export interface LightningChannelInfo {
  id: string;
  peerId: string;
  peerAlias?: string;
  capacity: number;
  localBalance: number;
  remoteBalance: number;
  reserve: number;
  
  state: 'pending' | 'active' | 'closing' | 'closed';
  
  fees: {
    baseFee: number;
    feeRate: number;
  };
  
  stats: {
    totalSent: number;
    totalReceived: number;
    totalFees: number;
    forwardCount: number;
  };
}

/**
 * Send Modal
 */
export interface SendModal extends Modal {
  recipient: string;
  amount: string;
  fee: 'slow' | 'medium' | 'fast' | 'custom';
  customFee?: number;
  memo?: string;
  
  sending: boolean;
  txResult: TransactionResult | null;
  
  validateForm(): boolean;
  calculateFee(): Promise<number>;
  
  handleSend(): Promise<void>;
  handleMaxAmount(): void;
  handleScanQR(): void;
}

export interface TransactionResult {
  txid: string;
  fee: number;
  size: number;
  confirmations: number;
}

/**
 * Receive Modal
 */
export interface ReceiveModal extends Modal {
  address: string;
  amount?: string;
  label?: string;
  invoice?: string;
  
  addressType: 'legacy' | 'segwit' | 'taproot';
  
  generateNewAddress(): Promise<void>;
  generateInvoice(): Promise<void>;
  
  copyAddress(): void;
  copyInvoice(): void;
  shareData(): void;
}

/**
 * Settings Modal
 */
export interface SettingsModal extends Modal {
  settings: AppSettingsData;
  activeSection: string;
  
  loadSettings(): void;
  saveSettings(): Promise<void>;
  
  updateSetting<K extends keyof AppSettingsData>(key: K, value: AppSettingsData[K]): void;
  resetSettings(): void;
  
  exportSettings(): void;
  importSettings(data: string): void;
}

export interface AppSettingsData {
  general: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    currency: string;
    unit: 'BTC' | 'mBTC' | 'μBTC' | 'sat';
  };
  
  network: {
    network: 'mainnet' | 'testnet';
    electrumServer?: string;
    torEnabled: boolean;
    customNodes: string[];
  };
  
  security: {
    autoLockTimeout: number;
    requirePasswordOnSend: boolean;
    hideBalances: boolean;
    enableBiometrics: boolean;
  };
  
  advanced: {
    feeRate: 'slow' | 'medium' | 'fast' | 'custom';
    customFeeRate?: number;
    utxoConsolidation: boolean;
    rbf: boolean;
    dustLimit: number;
  };
}

/**
 * Backup Modal
 */
export interface BackupModal extends Modal {
  backupType: 'seed' | 'wallet' | 'full';
  backupData: BackupData | null;
  password?: string;
  
  generateBackup(): Promise<void>;
  encryptBackup(password: string): Promise<void>;
  
  downloadBackup(): void;
  printBackup(): void;
  copyBackup(): void;
  
  verifyBackup(): boolean;
}

export interface BackupData {
  version: string;
  timestamp: number;
  type: 'seed' | 'wallet' | 'full';
  encrypted: boolean;
  data: string;
  checksum: string;
}

/**
 * Import Modal
 */
export interface ImportModal extends Modal {
  importType: 'seed' | 'backup' | 'watch';
  importData: string;
  password?: string;
  
  validating: boolean;
  errors: string[];
  
  validateImportData(): boolean;
  decryptData(password: string): Promise<string>;
  
  handleImport(): Promise<void>;
  handleFileSelect(): void;
}

/**
 * Confirmation Modal
 */
export interface ConfirmationModal extends Modal {
  message: string;
  confirmText: string;
  cancelText: string;
  danger: boolean;
  
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  
  show(options: ConfirmationOptions): Promise<boolean>;
}

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}