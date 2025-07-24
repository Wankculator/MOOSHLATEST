/**
 * Real Spark Wallet Service - Following the Complete Guide
 * Generates real Spark Protocol wallets with the official SDK
 */

// Step 1: Import Required Libraries
const { SparkWallet } = require("@buildonspark/spark-sdk");
const bip39 = require('bip39');
const { BIP32Factory } = require('bip32');
const ecc = require('tiny-secp256k1');

/**
 * Generate Real Spark Wallet - Complete Working Function from Guide
 */
async function generateRealSparkWallet() {
    try {
        // 2. Initialize wallet
        const { wallet, mnemonic } = await SparkWallet.initialize({
            options: { network: "MAINNET" }
        });
        
        // 3. Get Bitcoin deposit address
        const depositAddress = await wallet.getSingleUseDepositAddress();
        
        // 4. Get Spark address - IMPORTANT: Use getSparkAddress() NOT getAddress()
        let sparkAddress = null;
        if (wallet.getSparkAddress) {
            sparkAddress = await wallet.getSparkAddress();
        }
        
        // 5. Extract private keys
        const bip32Instance = BIP32Factory(ecc);
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const root = bip32Instance.fromSeed(seed);
        const child = root.derivePath("m/84'/0'/0'/0/0");
        
        const privateKeys = {
            wif: child.toWIF(),
            hex: Buffer.from(child.privateKey).toString('hex')
        };
        
        // 6. Return complete wallet data
        return {
            seedPhrase: mnemonic,
            bitcoinAddress: depositAddress,
            sparkAddress: sparkAddress,
            privateKeys: privateKeys,
            success: true
        };
        
    } catch (error) {
        return {
            error: error.message,
            success: false
        };
    }
}

/**
 * Import wallet from mnemonic
 */
async function importRealSparkWallet(mnemonic) {
    try {
        // Validate mnemonic
        const words = mnemonic.trim().split(/\s+/);
        if (words.length !== 12 && words.length !== 24) {
            throw new Error('Invalid mnemonic length. Must be 12 or 24 words.');
        }
        
        // Initialize wallet with existing mnemonic
        const { wallet } = await SparkWallet.initialize({
            mnemonicOrSeed: mnemonic,
            options: { network: "MAINNET" }
        });
        
        // Get addresses
        const depositAddress = await wallet.getSingleUseDepositAddress();
        let sparkAddress = null;
        if (wallet.getSparkAddress) {
            sparkAddress = await wallet.getSparkAddress();
        }
        
        // Extract private keys
        const bip32Instance = BIP32Factory(ecc);
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const root = bip32Instance.fromSeed(seed);
        const child = root.derivePath("m/84'/0'/0'/0/0");
        
        const privateKeys = {
            wif: child.toWIF(),
            hex: Buffer.from(child.privateKey).toString('hex')
        };
        
        return {
            seedPhrase: mnemonic,
            bitcoinAddress: depositAddress,
            sparkAddress: sparkAddress,
            privateKeys: privateKeys,
            success: true
        };
        
    } catch (error) {
        return {
            error: error.message,
            success: false
        };
    }
}

/**
 * Wrapper for API compatibility
 */
async function generateSparkWallet(network = 'MAINNET') {
    const result = await generateRealSparkWallet();
    
    if (result.success) {
        return {
            success: true,
            data: {
                mnemonic: result.seedPhrase,
                addresses: {
                    bitcoin: result.bitcoinAddress,
                    spark: result.sparkAddress
                },
                privateKeys: result.privateKeys,
                network: network.toLowerCase(),
                createdAt: new Date().toISOString()
            }
        };
    } else {
        return {
            success: false,
            error: result.error
        };
    }
}

/**
 * Wrapper for import API compatibility
 */
async function importSparkWallet(mnemonic, network = 'MAINNET') {
    const result = await importRealSparkWallet(mnemonic);
    
    if (result.success) {
        return {
            success: true,
            data: {
                mnemonic: result.seedPhrase,
                addresses: {
                    bitcoin: result.bitcoinAddress,
                    spark: result.sparkAddress
                },
                privateKeys: result.privateKeys,
                network: network.toLowerCase(),
                importedAt: new Date().toISOString()
            }
        };
    } else {
        return {
            success: false,
            error: result.error
        };
    }
}

module.exports = {
    generateRealSparkWallet,
    importRealSparkWallet,
    generateSparkWallet,
    importSparkWallet
};