/**
 * Client-side Transaction Signing Service
 * Handles secure transaction creation and signing without exposing private keys
 */

(function() {
    'use strict';

    class TransactionSigner {
        constructor() {
            this.bitcoin = window.bitcoin || null;
            if (!this.bitcoin) {
                console.error('Bitcoin library not loaded');
            }
        }

        /**
         * Create and sign a Bitcoin transaction
         * @param {Object} params Transaction parameters
         * @param {string} params.from - Sender address
         * @param {string} params.to - Recipient address
         * @param {number} params.amount - Amount in satoshis
         * @param {number} params.feeRate - Fee rate in sat/vB
         * @param {Object} params.privateKey - Private key object (never sent to server)
         * @param {Array} params.utxos - Unspent transaction outputs
         * @param {string} params.network - Network type ('mainnet' or 'testnet')
         * @returns {Promise<Object>} Signed transaction ready for broadcast
         */
        async createAndSignTransaction(params) {
            try {
                const {
                    from,
                    to,
                    amount,
                    feeRate,
                    privateKey,
                    utxos,
                    network = 'mainnet'
                } = params;

                // Validate inputs
                this.validateTransactionParams(params);

                // Get network config
                const networkConfig = this.getNetworkConfig(network);

                // Create key pair from private key
                const keyPair = this.createKeyPair(privateKey, networkConfig);

                // Build the transaction
                const psbt = new this.bitcoin.Psbt({ network: networkConfig });

                // Add inputs
                let totalInput = 0;
                for (const utxo of utxos) {
                    if (totalInput >= amount + this.estimateFee(1, 2, feeRate)) {
                        break;
                    }

                    psbt.addInput({
                        hash: utxo.txid,
                        index: utxo.vout,
                        witnessUtxo: {
                            script: this.bitcoin.address.toOutputScript(from, networkConfig),
                            value: utxo.value
                        }
                    });

                    totalInput += utxo.value;
                }

                // Calculate fee
                const estimatedSize = this.estimateTransactionSize(psbt.inputCount, 2);
                const fee = Math.ceil(estimatedSize * feeRate);

                // Validate sufficient funds
                if (totalInput < amount + fee) {
                    throw new Error('Insufficient funds for transaction and fee');
                }

                // Add recipient output
                psbt.addOutput({
                    address: to,
                    value: amount
                });

                // Add change output if needed
                const change = totalInput - amount - fee;
                if (change > 546) { // Dust threshold
                    psbt.addOutput({
                        address: from,
                        value: change
                    });
                }

                // Sign all inputs
                for (let i = 0; i < psbt.inputCount; i++) {
                    psbt.signInput(i, keyPair);
                }

                // Finalize all inputs
                psbt.finalizeAllInputs();

                // Extract the transaction
                const tx = psbt.extractTransaction();
                const txHex = tx.toHex();
                const txId = tx.getId();

                return {
                    success: true,
                    transaction: {
                        hex: txHex,
                        txId: txId,
                        fee: fee,
                        size: tx.virtualSize(),
                        inputs: psbt.inputCount,
                        outputs: psbt.txOutputs.length
                    }
                };

            } catch (error) {
                console.error('Transaction signing error:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        }

        /**
         * Validate transaction parameters
         */
        validateTransactionParams(params) {
            const { from, to, amount, feeRate, privateKey, utxos } = params;

            if (!from || !this.isValidAddress(from)) {
                throw new Error('Invalid sender address');
            }

            if (!to || !this.isValidAddress(to)) {
                throw new Error('Invalid recipient address');
            }

            if (!amount || amount <= 0) {
                throw new Error('Invalid amount');
            }

            if (!feeRate || feeRate <= 0) {
                throw new Error('Invalid fee rate');
            }

            if (!privateKey) {
                throw new Error('Private key required for signing');
            }

            if (!utxos || !Array.isArray(utxos) || utxos.length === 0) {
                throw new Error('No UTXOs provided');
            }
        }

        /**
         * Create key pair from private key
         */
        createKeyPair(privateKey, network) {
            if (privateKey.wif) {
                return this.bitcoin.ECPair.fromWIF(privateKey.wif, network);
            } else if (privateKey.hex) {
                return this.bitcoin.ECPair.fromPrivateKey(
                    Buffer.from(privateKey.hex, 'hex'),
                    { network }
                );
            } else {
                throw new Error('Invalid private key format');
            }
        }

        /**
         * Get network configuration
         */
        getNetworkConfig(network) {
            return network === 'testnet' 
                ? this.bitcoin.networks.testnet 
                : this.bitcoin.networks.bitcoin;
        }

        /**
         * Validate Bitcoin address
         */
        isValidAddress(address) {
            try {
                this.bitcoin.address.toOutputScript(address);
                return true;
            } catch (e) {
                return false;
            }
        }

        /**
         * Estimate transaction size
         */
        estimateTransactionSize(inputCount, outputCount) {
            // Base size: version (4) + locktime (4) + input count (1) + output count (1)
            let size = 10;
            
            // Input size: prevout (36) + script length (1) + script (~107) + sequence (4)
            size += inputCount * 148;
            
            // Output size: value (8) + script length (1) + script (~25)
            size += outputCount * 34;
            
            return size;
        }

        /**
         * Estimate fee for transaction
         */
        estimateFee(inputCount, outputCount, feeRate) {
            const size = this.estimateTransactionSize(inputCount, outputCount);
            return Math.ceil(size * feeRate);
        }

        /**
         * Sign a message with private key (for verification)
         */
        signMessage(message, privateKey, network = 'mainnet') {
            try {
                const networkConfig = this.getNetworkConfig(network);
                const keyPair = this.createKeyPair(privateKey, networkConfig);
                
                const signature = this.bitcoin.message.sign(
                    message,
                    keyPair.privateKey,
                    keyPair.compressed
                );
                
                return signature.toString('base64');
            } catch (error) {
                console.error('Message signing error:', error);
                throw error;
            }
        }

        /**
         * Create a transaction for broadcasting (without private key)
         */
        prepareTransactionForBroadcast(signedTxHex) {
            return {
                hex: signedTxHex,
                broadcast: true
            };
        }
    }

    // Export for use
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TransactionSigner;
    } else {
        window.TransactionSigner = TransactionSigner;
    }
})();