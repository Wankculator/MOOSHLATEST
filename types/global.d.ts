/**
 * Global type definitions for MOOSH Wallet
 */

declare global {
  interface Window {
    app: import('./index').MOOSHWalletApp;
    bitcoin: any; // Bitcoin library
    spark: any; // Spark Protocol library
    
    // Crypto extensions
    crypto: Crypto;
    
    // Custom events
    addEventListener(type: 'wallet:created', listener: (event: CustomEvent) => void): void;
    addEventListener(type: 'wallet:imported', listener: (event: CustomEvent) => void): void;
    addEventListener(type: 'transaction:sent', listener: (event: CustomEvent) => void): void;
    addEventListener(type: 'transaction:received', listener: (event: CustomEvent) => void): void;
  }
  
  // Extend crypto for our needs
  interface Crypto {
    randomBytes(size: number): Uint8Array;
  }
}

// Module declarations for libraries without types
declare module 'bip39' {
  export function generateMnemonic(strength?: number): string;
  export function validateMnemonic(mnemonic: string): boolean;
  export function mnemonicToSeed(mnemonic: string): Buffer;
  export function mnemonicToSeedSync(mnemonic: string): Buffer;
}

declare module 'bip32' {
  export interface BIP32Interface {
    privateKey?: Buffer;
    publicKey: Buffer;
    chainCode: Buffer;
    derivePath(path: string): BIP32Interface;
    toWIF(): string;
  }
  
  export function fromSeed(seed: Buffer): BIP32Interface;
}

declare module 'bitcoinjs-lib' {
  export namespace networks {
    export const bitcoin: any;
    export const testnet: any;
  }
  
  export namespace payments {
    export function p2pkh(options: any): any;
    export function p2sh(options: any): any;
    export function p2wpkh(options: any): any;
    export function p2tr(options: any): any;
  }
  
  export const ECPair: any;
  export const Psbt: any;
  export const Transaction: any;
}

export {};