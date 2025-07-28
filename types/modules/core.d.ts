/**
 * Core module type definitions
 */

import { AppEvent, EventHandler } from '../index';

/**
 * State Manager for application state
 */
export interface StateManager {
  data: Map<string, any>;
  listeners: Map<string, Set<StateListener>>;
  
  get(key: string): any;
  set(key: string, value: any): void;
  delete(key: string): void;
  has(key: string): boolean;
  clear(): void;
  
  subscribe(key: string, callback: StateListener): () => void;
  notify(key: string, value: any): void;
  
  getState(): Record<string, any>;
  setState(newState: Record<string, any>): void;
}

export type StateListener = (value: any) => void;

/**
 * Router for navigation
 */
export interface Router {
  routes: Map<string, RouteHandler>;
  currentRoute: string | null;
  
  register(path: string, handler: RouteHandler): void;
  navigate(path: string, params?: Record<string, any>): void;
  back(): void;
  forward(): void;
  
  onRouteChange(callback: RouteChangeHandler): () => void;
}

export type RouteHandler = (params?: Record<string, any>) => void;
export type RouteChangeHandler = (route: string, params?: Record<string, any>) => void;

/**
 * API Service for backend communication
 */
export interface APIService {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  
  request(endpoint: string, options?: RequestOptions): Promise<any>;
  get(endpoint: string, params?: Record<string, any>): Promise<any>;
  post(endpoint: string, data?: any): Promise<any>;
  put(endpoint: string, data?: any): Promise<any>;
  delete(endpoint: string): Promise<any>;
  
  setHeader(name: string, value: string): void;
  removeHeader(name: string): void;
  
  interceptRequest(interceptor: RequestInterceptor): void;
  interceptResponse(interceptor: ResponseInterceptor): void;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
  timeout?: number;
}

export type RequestInterceptor = (config: RequestOptions) => RequestOptions | Promise<RequestOptions>;
export type ResponseInterceptor = (response: any) => any | Promise<any>;

/**
 * Component base class
 */
export interface Component {
  id: string;
  element: HTMLElement | null;
  app: any; // Circular reference to MOOSHWalletApp
  
  render(): HTMLElement;
  mount(container: HTMLElement): void;
  unmount(): void;
  destroy(): void;
  
  setState(newState: Partial<any>): void;
  forceUpdate(): void;
}

/**
 * Element Factory for DOM creation
 */
export interface ElementFactory {
  (tag: string, attributes?: ElementAttributes, ...children: (string | HTMLElement)[]): HTMLElement;
  
  // Convenience methods
  div: (attributes?: ElementAttributes, ...children: (string | HTMLElement)[]) => HTMLElement;
  span: (attributes?: ElementAttributes, ...children: (string | HTMLElement)[]) => HTMLElement;
  button: (attributes?: ElementAttributes, ...children: (string | HTMLElement)[]) => HTMLElement;
  input: (attributes?: ElementAttributes) => HTMLInputElement;
  textarea: (attributes?: ElementAttributes) => HTMLTextAreaElement;
  select: (attributes?: ElementAttributes, ...children: (string | HTMLElement)[]) => HTMLSelectElement;
  form: (attributes?: ElementAttributes, ...children: (string | HTMLElement)[]) => HTMLFormElement;
  label: (attributes?: ElementAttributes, ...children: (string | HTMLElement)[]) => HTMLLabelElement;
  h1: (attributes?: ElementAttributes, ...children: (string | HTMLElement)[]) => HTMLHeadingElement;
  h2: (attributes?: ElementAttributes, ...children: (string | HTMLElement)[]) => HTMLHeadingElement;
  h3: (attributes?: ElementAttributes, ...children: (string | HTMLElement)[]) => HTMLHeadingElement;
  p: (attributes?: ElementAttributes, ...children: (string | HTMLElement)[]) => HTMLParagraphElement;
  a: (attributes?: ElementAttributes, ...children: (string | HTMLElement)[]) => HTMLAnchorElement;
  img: (attributes?: ElementAttributes) => HTMLImageElement;
}

export interface ElementAttributes {
  id?: string;
  className?: string;
  style?: Partial<CSSStyleDeclaration> | string;
  dataset?: Record<string, string>;
  [key: string]: any;
}

/**
 * Wallet Detector
 */
export interface WalletDetector {
  isMetaMaskInstalled(): boolean;
  isTrustWalletInstalled(): boolean;
  isPhantomInstalled(): boolean;
  
  detectInstalledWallets(): DetectedWallet[];
  
  connectMetaMask(): Promise<string[]>;
  connectTrustWallet(): Promise<string[]>;
  connectPhantom(): Promise<string[]>;
}

export interface DetectedWallet {
  name: string;
  icon: string;
  installed: boolean;
  connect: () => Promise<string[]>;
}

/**
 * Lazy Loader for dynamic imports
 */
export interface LazyLoader {
  loadedModules: Map<string, any>;
  loadingPromises: Map<string, Promise<any>>;
  
  loadModule(moduleName: string): Promise<any>;
  loadScript(src: string): Promise<void>;
  loadCSS(href: string): Promise<void>;
  
  preload(moduleNames: string[]): Promise<void>;
  isLoaded(moduleName: string): boolean;
}

/**
 * Encrypted Storage
 */
export interface EncryptedStorage {
  algorithm: string;
  keyDerivationAlgorithm: string;
  iterations: number;
  saltLength: number;
  ivLength: number;
  tagLength: number;
  
  deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey>;
  encrypt(data: string, password: string): Promise<EncryptedData>;
  decrypt(encryptedData: EncryptedData, password: string): Promise<string>;
  
  setItem(key: string, value: any, password: string): Promise<void>;
  getItem(key: string, password: string): Promise<any>;
  removeItem(key: string): void;
  clear(): void;
}

export interface EncryptedData {
  iv: string;
  salt: string;
  ciphertext: string;
  tag?: string;
}

/**
 * Secure State Persistence
 */
export interface SecureStatePersistence {
  stateManager: StateManager;
  encryptedStorage: EncryptedStorage;
  password: string | null;
  blacklistedKeys: Set<string>;
  
  initialize(password: string): Promise<void>;
  save(): Promise<void>;
  load(): Promise<void>;
  clear(): Promise<void>;
  
  changePassword(oldPassword: string, newPassword: string): Promise<void>;
  isInitialized(): boolean;
}