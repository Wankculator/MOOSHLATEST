/**
 * Utility type definitions
 */

/**
 * Validation utilities
 */
export interface ValidationUtils {
  isValidBitcoinAddress(address: string, network?: 'mainnet' | 'testnet'): boolean;
  isValidSparkAddress(address: string): boolean;
  isValidLightningInvoice(invoice: string): boolean;
  isValidMnemonic(mnemonic: string): boolean;
  isValidPrivateKey(key: string): boolean;
  
  validateAmount(amount: string, max?: number): ValidationResult;
  validateFee(fee: number): ValidationResult;
  validatePassword(password: string): ValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Format utilities
 */
export interface FormatUtils {
  formatBTC(satoshis: number, options?: FormatOptions): string;
  formatFiat(amount: number, currency: string): string;
  formatAddress(address: string, length?: number): string;
  formatDate(timestamp: number | Date): string;
  formatTime(timestamp: number | Date): string;
  formatFileSize(bytes: number): string;
  
  satoshisToBTC(satoshis: number): number;
  btcToSatoshis(btc: number): number;
}

export interface FormatOptions {
  decimals?: number;
  unit?: 'BTC' | 'mBTC' | 'μBTC' | 'sat';
  symbol?: boolean;
  commas?: boolean;
}

/**
 * Storage utilities
 */
export interface StorageUtils {
  setItem(key: string, value: any): void;
  getItem<T = any>(key: string): T | null;
  removeItem(key: string): void;
  clear(): void;
  
  setSecure(key: string, value: any, password: string): Promise<void>;
  getSecure<T = any>(key: string, password: string): Promise<T | null>;
  
  hasItem(key: string): boolean;
  getKeys(): string[];
  getSize(): number;
}

/**
 * Crypto utilities
 */
export interface CryptoUtils {
  generateRandomBytes(length: number): Uint8Array;
  generateUUID(): string;
  
  hash(data: string | Uint8Array, algorithm?: 'SHA-256' | 'SHA-512'): Promise<string>;
  hmac(key: string, data: string): Promise<string>;
  
  encrypt(plaintext: string, password: string): Promise<string>;
  decrypt(ciphertext: string, password: string): Promise<string>;
  
  deriveKey(password: string, salt: Uint8Array, iterations?: number): Promise<CryptoKey>;
  generateSalt(): Uint8Array;
}

/**
 * Network utilities
 */
export interface NetworkUtils {
  isOnline(): boolean;
  onOnline(callback: () => void): () => void;
  onOffline(callback: () => void): () => void;
  
  fetchWithTimeout(url: string, options?: RequestInit, timeout?: number): Promise<Response>;
  retryFetch(url: string, options?: RequestInit, retries?: number): Promise<Response>;
  
  getNetworkType(): 'fast' | 'slow' | 'offline';
  estimateRequestTime(bytes: number): number;
}

/**
 * Clipboard utilities
 */
export interface ClipboardUtils {
  copy(text: string): Promise<void>;
  paste(): Promise<string>;
  
  copyJSON(data: any): Promise<void>;
  pasteJSON<T = any>(): Promise<T>;
  
  isSupported(): boolean;
}

/**
 * File utilities
 */
export interface FileUtils {
  readFile(file: File): Promise<string>;
  readFileAsDataURL(file: File): Promise<string>;
  readFileAsArrayBuffer(file: File): Promise<ArrayBuffer>;
  
  downloadFile(content: string | Blob, filename: string, type?: string): void;
  downloadJSON(data: any, filename: string): void;
  
  selectFile(options?: FileSelectOptions): Promise<File>;
  selectFiles(options?: FileSelectOptions): Promise<File[]>;
}

export interface FileSelectOptions {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
}

/**
 * Animation utilities
 */
export interface AnimationUtils {
  fadeIn(element: HTMLElement, duration?: number): Promise<void>;
  fadeOut(element: HTMLElement, duration?: number): Promise<void>;
  
  slideIn(element: HTMLElement, direction?: 'left' | 'right' | 'up' | 'down'): Promise<void>;
  slideOut(element: HTMLElement, direction?: 'left' | 'right' | 'up' | 'down'): Promise<void>;
  
  animate(element: HTMLElement, keyframes: Keyframe[], options?: KeyframeAnimationOptions): Animation;
  
  requestAnimationFrame(callback: FrameRequestCallback): number;
  cancelAnimationFrame(id: number): void;
}

/**
 * Debounce and throttle utilities
 */
export interface TimingUtils {
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    options?: DebounceOptions
  ): T & { cancel(): void; flush(): void };
  
  throttle<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    options?: ThrottleOptions
  ): T & { cancel(): void };
  
  delay(ms: number): Promise<void>;
  timeout<T>(promise: Promise<T>, ms: number): Promise<T>;
}

export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

/**
 * Event utilities
 */
export interface EventUtils {
  on(element: Element, event: string, handler: EventListener, options?: AddEventListenerOptions): () => void;
  off(element: Element, event: string, handler: EventListener): void;
  once(element: Element, event: string, handler: EventListener): void;
  
  delegate(
    element: Element,
    selector: string,
    event: string,
    handler: (event: Event, target: Element) => void
  ): () => void;
  
  emit(element: Element, event: string, detail?: any): void;
}

/**
 * Logger utilities
 */
export interface LoggerUtils {
  log(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, error?: Error): void;
  debug(message: string, ...args: any[]): void;
  
  group(label: string): void;
  groupEnd(): void;
  
  time(label: string): void;
  timeEnd(label: string): void;
  
  setLevel(level: 'debug' | 'info' | 'warn' | 'error' | 'none'): void;
  getLevel(): string;
}