import { generateSparkCompatibleWallet } from './src/server/services/sparkCompatibleService.js';

console.log('Testing wallet generation...');
const start = Date.now();

try {
    const wallet = await generateSparkCompatibleWallet(128);
    const elapsed = Date.now() - start;
    console.log(`✅ Wallet generated in ${elapsed}ms`);
    console.log('Mnemonic:', wallet.data.mnemonic);
    console.log('Bitcoin:', wallet.data.addresses.bitcoin);
    console.log('Spark:', wallet.data.addresses.spark);
} catch (error) {
    console.error('❌ Error:', error.message);
}

process.exit(0);