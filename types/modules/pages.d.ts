/**
 * Page component type definitions
 */

import { Component } from './core';

/**
 * Base Page interface
 */
export interface Page extends Component {
  title: string;
  requiresAuth: boolean;
  
  onEnter?(): void | Promise<void>;
  onLeave?(): void | Promise<void>;
}

/**
 * Home Page
 */
export interface HomePage extends Page {
  showWelcome: boolean;
  features: Feature[];
  
  handleCreateWallet(): void;
  handleImportWallet(): void;
  handleConnectWallet(): void;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

/**
 * Dashboard Page
 */
export interface DashboardPage extends Page {
  stats: DashboardStats;
  recentTransactions: any[];
  
  loadDashboardData(): Promise<void>;
  refreshStats(): Promise<void>;
  
  handleSend(): void;
  handleReceive(): void;
  handleSwap(): void;
}

export interface DashboardStats {
  totalBalance: number;
  btcBalance: number;
  sparkBalance: number;
  pendingBalance: number;
  transactionCount: number;
  channelCount: number;
}

/**
 * Generate Seed Page
 */
export interface GenerateSeedPage extends Page {
  mnemonic: string | null;
  strength: 128 | 256;
  generating: boolean;
  
  generateSeed(): Promise<void>;
  copySeed(): void;
  downloadSeed(): void;
  
  handleContinue(): void;
  handleBack(): void;
}

/**
 * Confirm Seed Page
 */
export interface ConfirmSeedPage extends Page {
  mnemonic: string;
  shuffledWords: string[];
  selectedWords: string[];
  
  selectWord(word: string): void;
  removeWord(index: number): void;
  
  validateSeed(): boolean;
  handleConfirm(): void;
  handleBack(): void;
}

/**
 * Import Seed Page
 */
export interface ImportSeedPage extends Page {
  seedInput: string;
  validating: boolean;
  errors: string[];
  
  validateSeed(seed: string): boolean;
  handleImport(): Promise<void>;
  handleBack(): void;
}

/**
 * Wallet Created Page
 */
export interface WalletCreatedPage extends Page {
  walletData: WalletCreationResult;
  
  downloadWalletData(): void;
  printWalletData(): void;
  
  handleContinue(): void;
}

export interface WalletCreationResult {
  addresses: {
    bitcoin: string;
    spark: string;
  };
  publicKeys?: {
    bitcoin: string;
    spark: string;
  };
  timestamp: number;
}

/**
 * Wallet Imported Page
 */
export interface WalletImportedPage extends Page {
  importResult: WalletImportResult;
  
  handleContinue(): void;
}

export interface WalletImportResult {
  addresses: {
    bitcoin: string;
    spark: string;
  };
  balance?: {
    bitcoin: number;
    spark: number;
  };
  transactionCount?: number;
}

/**
 * Wallet Details Page
 */
export interface WalletDetailsPage extends Page {
  walletId: string;
  walletDetails: WalletDetails | null;
  activeTab: 'overview' | 'transactions' | 'addresses' | 'settings';
  
  loadWalletDetails(): Promise<void>;
  switchTab(tab: string): void;
  
  handleExport(): void;
  handleDelete(): void;
  handleRename(): void;
}

export interface WalletDetails {
  id: string;
  name: string;
  type: 'bitcoin' | 'spark' | 'multisig';
  addresses: WalletAddress[];
  balance: {
    total: number;
    available: number;
    pending: number;
  };
  transactions: any[];
  createdAt: number;
  lastSync: number;
}

export interface WalletAddress {
  address: string;
  type: 'receive' | 'change';
  index: number;
  balance: number;
  used: boolean;
}

/**
 * Send Page
 */
export interface SendPage extends Page {
  recipient: string;
  amount: string;
  fee: 'slow' | 'medium' | 'fast' | 'custom';
  customFee?: number;
  memo?: string;
  
  validateAddress(address: string): boolean;
  calculateFee(): Promise<number>;
  
  handleSend(): Promise<void>;
  handleMaxAmount(): void;
  handleScanQR(): void;
}

/**
 * Receive Page
 */
export interface ReceivePage extends Page {
  address: string;
  amount?: string;
  label?: string;
  qrData: string;
  
  generateNewAddress(): Promise<void>;
  copyAddress(): void;
  shareAddress(): void;
  
  generateInvoice(): string;
}

/**
 * Settings Page
 */
export interface SettingsPage extends Page {
  activeSection: 'general' | 'security' | 'network' | 'advanced';
  
  switchSection(section: string): void;
  
  handleThemeChange(theme: string): void;
  handleLanguageChange(language: string): void;
  handleNetworkChange(network: string): void;
  
  exportSettings(): void;
  importSettings(): void;
  resetSettings(): void;
}

/**
 * Backup Page
 */
export interface BackupPage extends Page {
  backupMethod: 'seed' | 'file' | 'qr';
  backupData: string | null;
  
  generateBackup(): Promise<void>;
  downloadBackup(): void;
  printBackup(): void;
  
  verifyBackup(): boolean;
}