/**
 * UI component type definitions
 */

import { Component, ElementAttributes } from './core';

/**
 * Header component
 */
export interface Header extends Component {
  updateBalance(): Promise<void>;
  showAccountDropdown(): void;
  hideAccountDropdown(): void;
  toggleAccountDropdown(): void;
}

/**
 * Terminal component
 */
export interface Terminal extends Component {
  history: string[];
  historyIndex: number;
  commands: Map<string, TerminalCommand>;
  
  addOutput(content: string, type?: 'info' | 'error' | 'success' | 'warning'): void;
  clearOutput(): void;
  
  registerCommand(name: string, handler: TerminalCommand): void;
  executeCommand(input: string): Promise<void>;
  
  addToHistory(command: string): void;
  navigateHistory(direction: 'up' | 'down'): void;
}

export type TerminalCommand = (args: string[]) => Promise<string> | string;

/**
 * Button component
 */
export interface Button extends Component {
  props: ButtonProps;
  
  onClick(handler: (event: MouseEvent) => void): void;
  setLoading(loading: boolean): void;
  setDisabled(disabled: boolean): void;
  setText(text: string): void;
}

export interface ButtonProps {
  text: string;
  onClick?: (event: MouseEvent) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  className?: string;
}

/**
 * Notification Manager
 */
export interface NotificationManager {
  notifications: Map<string, NotificationItem>;
  container: HTMLElement | null;
  
  show(message: string, type?: NotificationType, duration?: number): string;
  hide(id: string): void;
  hideAll(): void;
  
  success(message: string, duration?: number): string;
  error(message: string, duration?: number): string;
  warning(message: string, duration?: number): string;
  info(message: string, duration?: number): string;
}

export interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: number;
  duration: number;
  element: HTMLElement;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Loading Spinner
 */
export interface LoadingSpinner extends Component {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  
  show(): void;
  hide(): void;
  setMessage(message: string): void;
}

/**
 * QR Code component
 */
export interface QRCode extends Component {
  data: string;
  size: number;
  
  generateQR(data: string): void;
  download(filename?: string): void;
  copyToClipboard(): Promise<void>;
}

/**
 * Transaction History component
 */
export interface TransactionHistory extends Component {
  transactions: Transaction[];
  loading: boolean;
  
  loadTransactions(address: string): Promise<void>;
  refreshTransactions(): Promise<void>;
  
  filterTransactions(filter: TransactionFilter): Transaction[];
  sortTransactions(sortBy: 'date' | 'amount' | 'type'): void;
  
  onTransactionClick(handler: (tx: Transaction) => void): void;
}

export interface Transaction {
  txid: string;
  type: 'send' | 'receive' | 'self';
  amount: number;
  fee?: number;
  confirmations: number;
  timestamp: number;
  from: string[];
  to: string[];
  memo?: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface TransactionFilter {
  type?: 'send' | 'receive' | 'self';
  status?: 'pending' | 'confirmed' | 'failed';
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

/**
 * Address Book component
 */
export interface AddressBook extends Component {
  contacts: Contact[];
  
  addContact(contact: Omit<Contact, 'id'>): void;
  updateContact(id: string, updates: Partial<Contact>): void;
  deleteContact(id: string): void;
  
  searchContacts(query: string): Contact[];
  getContact(addressOrId: string): Contact | undefined;
  
  importContacts(data: string): void;
  exportContacts(): string;
}

export interface Contact {
  id: string;
  name: string;
  address: string;
  type: 'bitcoin' | 'spark' | 'lightning';
  notes?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Style Manager
 */
export interface StyleManager {
  styles: Map<string, string>;
  styleElement: HTMLStyleElement | null;
  
  injectStyles(): void;
  addStyles(id: string, css: string): void;
  removeStyles(id: string): void;
  
  setTheme(theme: 'light' | 'dark'): void;
  getTheme(): 'light' | 'dark';
  
  setCSSVariable(name: string, value: string): void;
  getCSSVariable(name: string): string;
}