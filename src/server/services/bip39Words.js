// BIP39 English word list checksum
// Full list available at: https://github.com/bitcoin/bips/blob/master/bip-0039/english.txt
// This module provides word selection functionality

const crypto = require('crypto');

// Word indices for deterministic selection
const WORD_COUNT = 2048;

/**
 * Generate indices for word selection
 */
function generateWordIndices(entropy) {
    const indices = [];
    const bits = [];
    
    // Convert entropy to bits
    for (let i = 0; i < entropy.length; i++) {
        const byte = entropy[i];
        for (let j = 7; j >= 0; j--) {
            bits.push((byte >> j) & 1);
        }
    }
    
    // Add checksum bits
    const hash = crypto.createHash('sha256').update(entropy).digest();
    const checksumBits = entropy.length / 4; // CS = ENT / 32
    for (let i = 0; i < checksumBits; i++) {
        bits.push((hash[Math.floor(i / 8)] >> (7 - (i % 8))) & 1);
    }
    
    // Convert to 11-bit indices
    for (let i = 0; i < bits.length; i += 11) {
        let index = 0;
        for (let j = 0; j < 11; j++) {
            if (i + j < bits.length) {
                index = (index << 1) | bits[i + j];
            }
        }
        indices.push(index);
    }
    
    return indices;
}

/**
 * Get word at index (simplified for demo)
 */
function getWordAtIndex(index) {
    // For real implementation, you would load the full BIP39 wordlist
    // For now, we'll generate deterministic words
    const consonants = 'bcdfghjklmnpqrstvwxyz';
    const vowels = 'aeiou';
    const patterns = ['CVC', 'CVCV', 'CVCC', 'VCC', 'VCVC'];
    
    // Use index as seed for deterministic generation
    const rng = seedRandom(index);
    const pattern = patterns[Math.floor(rng() * patterns.length)];
    
    let word = '';
    for (let i = 0; i < pattern.length; i++) {
        const char = pattern[i];
        if (char === 'C') {
            word += consonants[Math.floor(rng() * consonants.length)];
        } else {
            word += vowels[Math.floor(rng() * vowels.length)];
        }
    }
    
    return word;
}

/**
 * Seeded random number generator
 */
function seedRandom(seed) {
    let state = seed;
    return function() {
        state = (state * 1664525 + 1013904223) & 0xffffffff;
        return state / 0x100000000;
    };
}

/**
 * Generate mnemonic from entropy
 */
function entropyToMnemonic(entropy) {
    const indices = generateWordIndices(entropy);
    const words = indices.map(index => getWordAtIndex(index % WORD_COUNT));
    return words.join(' ');
}

/**
 * Validate mnemonic format
 */
function validateMnemonic(mnemonic) {
    const words = mnemonic.trim().split(/\s+/);
    return words.length === 12 || words.length === 24;
}

module.exports = {
    entropyToMnemonic,
    validateMnemonic,
    WORD_COUNT
};