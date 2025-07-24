/**
 * Proper BIP39 Implementation Example
 * This shows the correct way to generate BIP39 mnemonics using the full 2048-word wordlist
 */

import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { randomBytes } from 'crypto';

/**
 * Generate a proper BIP39 mnemonic with the full 2048-word list
 * @param {number} strength - Entropy strength in bits (128 = 12 words, 256 = 24 words)
 * @returns {string} The generated mnemonic phrase
 */
export function generateProperMnemonic(strength = 128) {
    // Method 1: Using the built-in generateMnemonic function
    const mnemonic = generateMnemonic(wordlist, strength);
    return mnemonic;
}

/**
 * Alternative: Generate mnemonic from custom entropy
 * This gives you more control over the entropy source
 */
export function generateMnemonicFromEntropy(entropy) {
    // Ensure entropy is the right length (16 bytes for 12 words, 32 bytes for 24 words)
    if (entropy.length !== 16 && entropy.length !== 32) {
        throw new Error('Entropy must be 16 or 32 bytes');
    }
    
    // Convert entropy to mnemonic using the BIP39 algorithm
    const mnemonic = entropyToMnemonic(entropy, wordlist);
    return mnemonic;
}

/**
 * Manual implementation of entropy to mnemonic conversion
 * This shows how BIP39 actually works under the hood
 */
function entropyToMnemonic(entropy, wordlist) {
    const crypto = require('crypto');
    
    // 1. Calculate checksum
    const hash = crypto.createHash('sha256').update(entropy).digest();
    const checksumBits = entropy.length / 4; // CS = ENT / 32
    
    // 2. Convert entropy + checksum to binary string
    let bits = '';
    
    // Add entropy bits
    for (let i = 0; i < entropy.length; i++) {
        bits += entropy[i].toString(2).padStart(8, '0');
    }
    
    // Add checksum bits
    for (let i = 0; i < checksumBits; i++) {
        const byte = hash[Math.floor(i / 8)];
        const bit = (byte >> (7 - (i % 8))) & 1;
        bits += bit.toString();
    }
    
    // 3. Split into 11-bit chunks and map to words
    const words = [];
    for (let i = 0; i < bits.length; i += 11) {
        const index = parseInt(bits.slice(i, i + 11), 2);
        words.push(wordlist.split('\n')[index]);
    }
    
    return words.join(' ');
}

/**
 * Convert mnemonic to seed
 * @param {string} mnemonic - The mnemonic phrase
 * @param {string} passphrase - Optional passphrase (empty string by default)
 * @returns {Buffer} The 64-byte seed
 */
export function mnemonicToSeed(mnemonic, passphrase = '') {
    return mnemonicToSeedSync(mnemonic, passphrase);
}

/**
 * Validate a mnemonic phrase
 * @param {string} mnemonic - The mnemonic to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidMnemonic(mnemonic) {
    return validateMnemonic(mnemonic, wordlist);
}

/**
 * Example usage showing the complete flow
 */
export async function exampleUsage() {
    console.log('=== Proper BIP39 Implementation Example ===\n');
    
    // 1. Generate a 12-word mnemonic (128 bits of entropy)
    const mnemonic12 = generateProperMnemonic(128);
    console.log('12-word mnemonic:', mnemonic12);
    console.log('Word count:', mnemonic12.split(' ').length);
    console.log('Valid:', isValidMnemonic(mnemonic12));
    
    // 2. Generate a 24-word mnemonic (256 bits of entropy)
    const mnemonic24 = generateProperMnemonic(256);
    console.log('\n24-word mnemonic:', mnemonic24);
    console.log('Word count:', mnemonic24.split(' ').length);
    console.log('Valid:', isValidMnemonic(mnemonic24));
    
    // 3. Convert mnemonic to seed
    const seed = mnemonicToSeed(mnemonic12);
    console.log('\nSeed from 12-word mnemonic:', seed.toString('hex'));
    console.log('Seed length:', seed.length, 'bytes');
    
    // 4. Generate from specific entropy
    const customEntropy = randomBytes(16); // 16 bytes = 128 bits = 12 words
    const customMnemonic = generateMnemonicFromEntropy(customEntropy);
    console.log('\nCustom entropy mnemonic:', customMnemonic);
    console.log('Valid:', isValidMnemonic(customMnemonic));
    
    // 5. Show that all words come from the BIP39 wordlist
    const words = mnemonic12.split(' ');
    const wordlistArray = wordlist.split('\n');
    console.log('\nVerifying words are from BIP39 wordlist:');
    words.slice(0, 3).forEach(word => {
        const index = wordlistArray.indexOf(word);
        console.log(`  "${word}" - index: ${index} (valid: ${index !== -1})`);
    });
    
    return {
        mnemonic12,
        mnemonic24,
        seed: seed.toString('hex'),
        customMnemonic
    };
}

/**
 * Get the full BIP39 English wordlist
 * @returns {string[]} Array of 2048 words
 */
export function getFullWordlist() {
    return wordlist.split('\n');
}

/**
 * Check if a word is in the BIP39 wordlist
 * @param {string} word - The word to check
 * @returns {boolean} True if the word is in the wordlist
 */
export function isWordInList(word) {
    return wordlist.includes(word);
}

// If running directly, show example
if (import.meta.url === `file://${process.argv[1]}`) {
    exampleUsage().then(result => {
        console.log('\n=== Summary ===');
        console.log('Generated mnemonics use the full BIP39 wordlist of 2048 words');
        console.log('Each word can be verified against the official wordlist');
        console.log('The implementation follows BIP39 specification exactly');
    });
}