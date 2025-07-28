/**
 * MOOSH Wallet TypeScript Definitions
 * Main entry point for all type definitions
 */

/// <reference path="./global.d.ts" />
/// <reference path="./modules/index.d.ts" />

declare module 'moosh-wallet' {
  export * from './modules';
  
  /**
   * Main MOOSH Wallet Application
   */
  export interface MOOSHWalletApp {
    // Core properties
    version: string;
    initialized: boolean;
    
    // Core modules
    state: StateManager;
    router: Router;
    apiService: APIService;
    
    // Methods
    init(): Promise<void>;
    showNotification(message: string, type?: NotificationType, duration?: number): void;
    navigate(page: string, params?: Record<string, any>): void;
    
    // Event handling
    on(event: AppEvent, handler: EventHandler): void;
    off(event: AppEvent, handler: EventHandler): void;
    emit(event: AppEvent, data?: any): void;
  }
  
  /**
   * Notification types
   */
  export type NotificationType = 'success' | 'error' | 'warning' | 'info';
  
  /**
   * Application events
   */
  export type AppEvent = 
    | 'initialized'
    | 'wallet:created'
    | 'wallet:imported'
    | 'wallet:locked'
    | 'wallet:unlocked'
    | 'account:switched'
    | 'transaction:sent'
    | 'transaction:received'
    | 'error';
  
  /**
   * Event handler function
   */
  export type EventHandler = (data?: any) => void;
  
  /**
   * Bitcoin network types
   */
  export type BitcoinNetwork = 'mainnet' | 'testnet' | 'regtest';
  
  /**
   * Transaction types
   */
  export type TransactionType = 'send' | 'receive' | 'self';
  
  /**
   * Address types
   */
  export type AddressType = 'legacy' | 'p2sh' | 'segwit' | 'taproot';
}