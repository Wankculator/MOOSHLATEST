# Complete SparkSat Site Content Archive
## Raw Content Scrape Results

*Complete archive of all content scraped from SparkSat and Spark Protocol sites*

---

## SparkSat Application (https://sparksat.app/)

### Main Landing Page

**URL:** https://sparksat.app/

**Content:**
```
![Spark Logo](https://sparksat.app/sparksat-log.png)

SparkSatbetaENZH

# Welcome to SparkSat Wallet

The fastest and most user-friendly way to manage assets on Spark

## Get Started

Enter Password Confirm Password Create New WalletImport Existing Wallet

## What is Spark?

[Spark](https://www.spark.money/) is a second-layer scaling solution on Bitcoin, making transactions faster and
cheaper while maintaining Bitcoin's security features.

With [Spark](https://www.spark.money/), you can create self-custodial wallets, send and receive bitcoins, pay with the
Lightning Network, and manage stablecoins and other assets on Layer 2.
```

**Key Features Identified:**
- Beta status application
- Multi-language support (English/Chinese)
- Password-protected wallet creation
- Existing wallet import functionality
- Self-custodial design
- Lightning Network integration
- Stablecoin support

---

## Spark Protocol Main Site (https://www.spark.money/)

### Homepage Content

**URL:** https://www.spark.money/

**Complete Content:**
```
# The fastest, cheapest, most UX-friendly way to build financial apps and launch assets natively on Bitcoin

MAINNET BETA Making Bitcoin Money Again

Create Wallet
Send Payment
Mint Token
Burn Token

Copy Code:
import { SparkWallet } from "@buildonspark/spark-sdk";

const { wallet, mnemonic } = await SparkWallet.initialize({
  options: {
    network: "MAINNET",
  },
});
console.log("Wallet mnemonic:", mnemonic);

// Generate a L1 deposit address
const depositAddress = await wallet.getSingleUseDepositAddress();

// Claim L1 deposit
const result = await getLatestDepositTxId(depositAddress);

if (result) {
  console.log("Transaction ID: ", result);
  const tx = await wallet1.claimDeposit(result);
  console.log("Deposit TX: ", tx);
}

// Check Wallet balance
const balance = await wallet.getBalance();

Launch Assets on Bitcoin Instantly

Launch your asset on Bitcoin: the most neutral and widely adopted network. Spark
lets developers create, distribute, and monetize assets in minutes.

[Issue an asset](https://www.spark.money/issuance)

Build yourDream Wallet

Build self-custody wallets with native Bitcoin and stablecoin support. Fast,
cheap payments for everyone.

[Create a wallet](https://www.spark.money/wallets)

Manifesto

Because Bitcoin needs to scale without losing its soul.

[Read Manifesto](https://www.spark.money/manifesto)

Footer Links:
[Stablecoins](https://www.spark.money/stablecoins)
[Wallets](https://www.spark.money/wallets)
[Ecosystem](https://www.spark.money/ecosystem)
[Manifesto](https://www.spark.money/manifesto)
[Brand & Press](https://spark.money/brand)
[Terms of Use](https://www.spark.money/terms-of-use)
[Privacy Policy](https://www.spark.money/privacy-policy)

Social Links:
[Twitter](https://x.com/spark)
[GitHub](https://github.com/buildonspark)

Navigation Menu:
[Issuance - Issue any asset on Bitcoin](https://www.spark.money/issuance)
[Wallets - Create next gen wallets](https://www.spark.money/wallets)

Build Menu:
[Payment Apps - Build the future of payments](https://www.spark.money/build/payment-apps)
[Bitcoin Rewards - Launch rewards programs with Bitcoin](https://www.spark.money/build/bitcoin-rewards)
[Bitcoin Earnings - Build powerful earning products with Bitcoin](https://www.spark.money/build/bitcoin-earnings)
[Trading/DeFi apps - Buy and sell bitcoin assets in your product](https://www.spark.money/build/defi-trading-apps)
[Stablecoins on Bitcoin - Issue your stablecoin natively on Bitcoin](https://www.spark.money/build/stablecoins)

Learn Menu:
[Ecosystem - Explore the growing network of builders](https://www.spark.money/ecosystem)
[News - Stay updated with the latest from Spark](https://www.spark.money/news)
[Docs - Explore our docs and start building](https://docs.spark.money/)
[Manifesto - Learn more about Spark's vision](https://www.spark.money/manifesto)

© 2025 Spark Protocol LLC
```

---

## Spark Documentation (https://docs.spark.money/)

### Welcome Page

**URL:** https://docs.spark.money/

**Content:**
```
# Welcome to Spark

![Spark Introduction](https://mintlify.s3.us-west-1.amazonaws.com/lightspark/assets/main.png)

Spark is the fastest, lightest, and most developer-friendly way to build
financial apps and launch assets on Bitcoin.

Built for payments and settlement, Spark lets developers move Bitcoin and
Bitcoin-native assets (including stablecoins) instantly, at near-zero cost, while
staying fully connected to Bitcoin's infrastructure. All natively on Bitcoin, with
no bridges or wrapping.

## Choose Your Path

[docs-wallets_dark Deploy your dream wallet](https://docs.spark.money/wallet/introduction)
[docs-divein_dark Dive into Spark](https://docs.spark.money/spark/spark-tldr)
[docs-tokens_dark Launch your token](https://docs.spark.money/issuing/introduction)
[docs-support_dark How Spark supports tokens](https://docs.spark.money/lrc20/history)

[Manifesto Next](https://docs.spark.money/home/manifesto)

Footer:
Spark home page dark logo
[Privacy Policy](https://spark.money/privacy)
[Terms of Service](https://spark.money/terms-of-use)
[x](https://x.com/spark)
[github](https://github.com/buildonspark)
```

### Spark TLDR Technical Overview

**URL:** https://docs.spark.money/spark/spark-tldr

**Content:**
```
# Spark TLDR

Spark is an off-chain scaling solution that builds on top of [Statechains](https://bitcoinops.org/en/topics/statechains/) to enable instant, extremely low fee, and unlimited self-custodial transactions
of Bitcoin and tokens while also natively enabling sending and receiving via
Lightning.

Spark is not a rollup, nor a blockchain. There are no smart contracts nor VM.
Spark is native to Bitcoin and its payments-focused architecture, enabling
on-chain funds to be transacted at any scale, with near-instant speeds, and at
virtually zero cost.

At it's core, Spark is a simple [shared signing protocol](https://docs.spark.money/spark/frost-signing) on top of Bitcoin. It operates as a distributed ledger. There are no bridges,
external consensus, or sequencers. Users can enter and exit the network freely,
with funds always non-custodial and recoverable on L1 via a unilateral exit which
depends on Bitcoin and no one else. Transactions on Spark happen by delegating
on-chain funds via the shared signing protocol.

Like the Lightning Network, Spark transactions work by delegating ownership of
on-chain UTXOs between parties. The key difference: Spark introduces a set of
signers, called Spark Operators (SOs), responsible for helping sign transactions as
they happen. SOs cannot move funds without the users, who are required
participants in any transfer. On L1, Spark state appears as a chain of multi-sigs,
secured by users and SOs. On L2, it operates as a tree structure, mapping transaction
history and balances in real time. Simple, fully native to Bitcoin, and
open-sourced.

For a system that scales Bitcoin as effectively as Spark does, it achieves the
maximum possible level of trustlessness. Specifically, it maintains 1/n trust
assumptions or minority/n depending on the setup. To learn more about the trust
assumptions, read our [trust assumptions](https://docs.spark.money/spark/trust-model) page.

## Key Features

We built Spark from first principles. It's designed to deliver an exceptional
payment UX that's as trustless as possible while making sure we respect our core
Bitcoin roots.

✓ Instant transactions.
✓ Crazy cheap.
✓ Your keys, your coins.
✓ Lightning-compatible.
✓ Tokens on Bitcoin.
✓ Minimal trust model.
✓ Always open exit.
✓ Built to scale.
```

### Sovereignty Model

**URL:** https://docs.spark.money/spark/sovereignty

**Content:**
```
# Sovereignty

Self-sovereignty is a core principle of Spark's design. It is an unparalleled
quality that very few L2s can afford to its users.

Spark, like Lightning, is narrowly designed for transfers of value, not general
computation like other L2s. This focus makes achieving non-custodiality and true
trustless exits much more straightforward.

How it works:

Pre-signed Transactions: Before you deposit funds into Spark, you work with the operators to create a
pre-signed transaction that exits funds to the Bitcoin L1. Meaning you can always
exit your funds if the operators go offline or become malicious after a transfer

Timelocked Transactions: When ownership of the leaf (In Spark, leaves work like UTXOs and represent the
ownership of a UTXO on L1) is transferred (e.g., from Alice to Bob), a
transaction is signed that gives Bob ownership of a leaf on L1. This exit transaction is
encumbered by a timelock that is relative to it's parent transaction. By the
timelock being relative, it means that there is no limit to how long you can hold
onto an unpublished leaf before it must go on-chain.

Decrementing Timelocks: If Bob then transfers the leaf to Charlie, a new transaction is signed for
Charlie with a shorter timelock (e.g., 300 blocks instead of Bob's 400). Each
subsequent transfer reduces the timelock, so the most recent owner's transaction
becomes valid first. This ensures that the current owner always has a sooner exit
than the previous owner. This can be supported by watchtowers to ensure that the
current owner always exits before the previous owner.

Fallback to L1: If the Spark operators disappear, get compromised, attempt to censor, or refuse
to cooperate, you (the current owner) can unilaterally broadcast to Bitcoin L1
the pre-signed transactions up to, and including, your leaf and claim the funds
once the relative timelocks expire.

This mechanism ensures that you don't rely on any outside entity indefinitely.
Even if it's a centralized component, you have an unshakeable and unconditional
escape hatch to reclaim your funds on the Bitcoin L1, making your funds
non-custodial in practice. The relativity of the timelock also makes it so the user does
not have to refresh or exit funds to L1 on a set schedule. Exiting Spark can
take as little as 100 blocks depending on the depth of their leaf.

This differs substantially from the standard L2 exit mechanisms, in which users
must rely on a centralized sequencer or bridge to exit, without absolute
guarantees.
```

### Trust Model

**URL:** https://docs.spark.money/spark/trust-model

**Content:**
```
# Trust Model

Spark operates under a "moment-in-time" trust model, meaning that trust is only
required at the time of a transaction. As long as at least one (or a
configurable threshold) of the Spark operators behaves honestly during a transfer, the
system ensures perfect forward security. Even if operators are later compromised or
act maliciously, they cannot retroactively compromise past transactions or take
money from users.

This security is achieved through a fundamental action required of SOs:
forgetting the operator key after a transfer. If an operator follows this protocol, the
transferred funds are secure, even against future coercion or hacking. Spark
strengthens this model by using multiple operators, ensuring that as long as one
(or the required threshold) deletes their key, users remain secure and have
perfect forward security. This approach contrasts with most other Layer 2 solutions,
where operators retain the ability to compromise user funds until they exit the
system. The only exception is Lightning, which requires no trusted entities at
all.
```

### FROST Signing Protocol

**URL:** https://docs.spark.money/spark/frost-signing

**Content:**
```
# Spark FROST

Spark employs a customized version of the FROST (Flexible Round-Optimized
Schnorr Threshold) signing scheme to enable transaction signing by a required
participant alongside a threshold group of signers known as Signing Operators (SOs).

## Problem Statement

In Spark, transactions require co-signing by a user and a group of Signing
Operators (see [SOs](https://docs.spark.money/spark/technical-definitions#spark-operator-so)), together SOs make up that Spark Entity [(SE)](https://docs.spark.money/spark/technical-definitions#spark-entity-se). The signature must meet these requirements:

Threshold Signing for SOs: Only 𝑡 out of 𝑛 total SOs are needed to complete the signing process.
Mandatory User Signing: The user's participation is essential for a valid signature.
Single Schnorr Signature: The final signature must be aggregated into a single Schnorr signature, ruling
out multi-signature schemes like 2-of-2. The final signature is the aggregate of
the user's signature and the SOs' signatures, where the user is the required
participant.

Additionally, the cryptographic keys must support:

Tweakability: Keys can be modified by adding or multiplying a tweak value.
Additive Aggregatability: Given all shards of two keys (e.g., key1 and key2), it must be possible to
derive all shards for their sum (key1 + key2).

This document presents a modified FROST signing scheme tailored to address these
needs in Spark.

## Key Generation

### User Key

The user independently generates a single key pair, denoted as (𝑠𝑘𝑢𝑠𝑒𝑟,𝑝𝑘𝑢𝑠𝑒𝑟), where 𝑠𝑘𝑢𝑠𝑒𝑟 is the secret key and 𝑝𝑘𝑢𝑠𝑒𝑟 is the corresponding public key.

### SO Keys

The Signing Operators (SOs) collaboratively generate a threshold signing key
pair, denoted as (𝑠𝑘𝑠𝑜,𝑝𝑘𝑠𝑜), using a Distributed Key Generation (DKG) protocol. Each SO receives a Shamir
secret share 𝑠𝑠𝑖 of 𝑠𝑘𝑠𝑜, configured with a threshold (𝑡,𝑛), meaning any 𝑡 of the 𝑛 SOs can reconstruct the key.

Note: Details of the secure DKG process are beyond the scope of this document. You
can find more information in the [FROST paper](https://eprint.iacr.org/2020/852.pdf).

## Key Aggregation

The user's key and the SOs' key are combined into an aggregated key using
additive aggregation:

The aggregated secret key is computed as 𝑠𝑘𝑎𝑔𝑔=𝑠𝑘𝑢𝑠𝑒𝑟+𝑠𝑘𝑠𝑜.
The corresponding public key is 𝑌=𝑝𝑘𝑢𝑠𝑒𝑟+𝑝𝑘𝑠𝑜.

All participants must know the aggregated public key 𝑌.

## Pre-processing

Mirroring FROST's pre-processing phase, all participants generate and commit to
nonces:

SO Nonces: Each SO generates nonce pairs (𝑑𝑖𝑗,𝑒𝑖𝑗) and their commitments (𝐷𝑖𝑗,𝐸𝑖𝑗), where 𝐷𝑖𝑗=𝑔𝑑𝑖𝑗 and 𝐸𝑖𝑗=𝑔𝑒𝑖𝑗, using a fixed generator 𝑔.

User Nonces: The user generates nonce pairs (𝑑𝑢𝑠𝑒𝑟𝑖,𝑒𝑢𝑠𝑒𝑟𝑖) and commitments (𝐷𝑢𝑠𝑒𝑟𝑖,𝐸𝑢𝑠𝑒𝑟𝑖), sharing these commitments with all SOs.

These nonces enhance security during signing by preventing replay attacks.

## Signing Flow

The signing process involves the user, a coordinator, and a subset of SOs,
proceeding as follows:

1. Initiation:
   The user submits a signing request for message 𝑚 to a signing operator coordinator.

2. Participant and Nonce Selection:
   The coordinator selects a set 𝑆 of 𝑡 participating SOs.
   It compiles an unused nonce commitment list 𝐵={(𝐷𝑖𝑗,𝐸𝑖𝑗)∣𝑖∈𝑆}∪{(𝐷𝑢𝑠𝑒𝑟𝑗,𝐸𝑢𝑠𝑒𝑟𝑗)} and broadcasts 𝐵 to all participants.

3. Signature Share Calculation by SOs:
   Each SO 𝑖∈𝑆 computes:
   𝜌𝑖=𝐻1(𝑖,𝑚,𝐵), using a hash function 𝐻1.
   Nonce contribution: 𝑅𝑖=𝐷𝑖𝑗⋅𝐸𝑖𝑗𝜌𝑖.
   Challenge: 𝑐=𝐻2(𝑅,𝑌,𝑚), where 𝑅=∏𝑖∈𝑆𝑅𝑖.
   Signature share: 𝑧𝑖=𝑑𝑖𝑗+𝑒𝑖𝑗𝜌𝑖+𝜆𝑖𝑠𝑠𝑖𝑐, where 𝜆𝑖 is the Lagrange coefficient for reconstructing 𝑠𝑘𝑠𝑜.

4. SO Signature Aggregation:
   The coordinator aggregates the SO shares: 𝑧𝑠𝑜=∑𝑖∈𝑆𝑧𝑖.
   It computes 𝑅𝑠𝑜=∏𝑖∈𝑆𝑅𝑖, validates the partial signature, and sends (𝑅𝑠𝑜,𝑧𝑠𝑜) along with 𝐵 to the user.

5. User Signature Share Calculation:
   The user computes:
   𝜌𝑢𝑠𝑒𝑟=𝐻1(0,𝑚,𝐵) (assuming user index 0).
   Nonce contribution: 𝑅𝑢𝑠𝑒𝑟=𝐷𝑢𝑠𝑒𝑟𝑗⋅𝐸𝑢𝑠𝑒𝑟𝑗𝜌𝑢𝑠𝑒𝑟.
   Full nonce: 𝑅=𝑅𝑠𝑜⋅𝑅𝑢𝑠𝑒𝑟.
   Challenge: 𝑐=𝐻2(𝑅,𝑌,𝑚).
   Signature share: 𝑧𝑢𝑠𝑒𝑟=𝑑𝑢𝑠𝑒𝑟𝑗+𝑒𝑢𝑠𝑒𝑟𝑗𝜌𝑢𝑠𝑒𝑟+𝑠𝑘𝑢𝑠𝑒𝑟𝑐.

6. Final Signature:
   The user aggregates the final signature as (𝑅,𝑧), where 𝑧=𝑧𝑠𝑜+𝑧𝑢𝑠𝑒𝑟.

## Key Tweaks

The SO key 𝑠𝑘𝑠𝑜 is shared via Shamir secret sharing with the polynomial:

𝑓(𝑥)=𝑠𝑘𝑠𝑜+𝑎1𝑥+𝑎2𝑥2+⋯+𝑎𝑡−1𝑥𝑡−1

Each SO 𝑖 holds the share (𝑖,𝑓(𝑖)).

### Additive Tweak

To tweak 𝑠𝑘𝑠𝑜 by adding 𝑡 (i.e., 𝑠𝑘𝑠𝑜′=𝑠𝑘𝑠𝑜+𝑡):

Define the new polynomial 𝑓′(𝑥)=𝑓(𝑥)+𝑡
Update each share to 𝑓′(𝑖)=𝑓(𝑖)+𝑡

### Multiplicative Tweak

For a multiplicative tweak by 𝑡 (i.e., 𝑠𝑘𝑠𝑜′=𝑡⋅𝑠𝑘𝑠𝑜):

Update each share to 𝑓′(𝑖)=𝑡⋅𝑓(𝑖)

### Secure Tweak Distribution

Directly sharing 𝑡 with SOs risks key exposure if the sender is an SO or colludes with one.
Instead:

Construct a polynomial 𝑔(𝑥) of degree 𝑡−1 where 𝑔(0)=𝑡
Distribute 𝑔(𝑖) to each SO 𝑖
Each SO updates their share: 𝑓′(𝑖)=𝑓(𝑖)+𝑔(𝑖)

This method applies the tweak securely without revealing 𝑡.

## Key Split

When splitting a key into 𝑛 child keys (e.g., for transaction splitting), the property holds:

𝐴𝑙𝑖𝑐𝑒𝑜𝑙𝑑+𝑆𝑂𝑜𝑙𝑑=∑𝑖=1𝑛(𝐴𝑙𝑖𝑐𝑒𝑖+𝑆𝑂𝑖)

Here, 𝐴𝑙𝑖𝑐𝑒𝑜𝑙𝑑 and 𝑆𝑂𝑜𝑙𝑑 are the original user and SO keys, and 𝐴𝑙𝑖𝑐𝑒𝑖 and 𝑆𝑂𝑖 are the child keys.

### Process

1. User Key Splitting:
   The user (Alice) generates 𝑛 key pairs (𝑠𝑘𝐴𝑙𝑖𝑐𝑒𝑖,𝑝𝑘𝐴𝑙𝑖𝑐𝑒𝑖) for 𝑖=1 to 𝑛
   Compute 𝑠𝑢𝑚𝐴𝑙𝑖𝑐𝑒=∑𝑖=1𝑛𝑠𝑘𝐴𝑙𝑖𝑐𝑒𝑖
   Calculate 𝑇𝑤𝑒𝑎𝑘=𝑠𝑘𝐴𝑙𝑖𝑐𝑒𝑜𝑙𝑑−𝑠𝑢𝑚𝐴𝑙𝑖𝑐𝑒

2. Tweak Communication:
   The user sends 𝑇𝑤𝑒𝑎𝑘 to the SOs.

3. SO Key Splitting:
   The SOs use DKG to generate 𝑛−1 key pairs (𝑠𝑘𝑆𝑂𝑖,𝑝𝑘𝑆𝑂𝑖) for 𝑖=1 to 𝑛−1
   Set the 𝑛-th key as 𝑠𝑘𝑆𝑂𝑛=𝑠𝑘𝑆𝑂𝑜𝑙𝑑−(∑𝑖=1𝑛−1𝑠𝑘𝑆𝑂𝑖−𝑇𝑤𝑒𝑎𝑘)

4. Verification:
   The sum of child keys is: ∑𝑖=1𝑛𝑠𝑘𝐴𝑙𝑖𝑐𝑒𝑖+∑𝑖=1𝑛𝑠𝑘𝑆𝑂𝑖=𝑠𝑢𝑚𝐴𝑙𝑖𝑐𝑒+∑𝑖=1𝑛−1𝑠𝑘𝑆𝑂𝑖+𝑠𝑘𝑆𝑂𝑜𝑙𝑑−∑𝑖=1𝑛−1𝑠𝑘𝑆𝑂𝑖+𝑇𝑤𝑒𝑎𝑘

   Substituting 𝑇𝑤𝑒𝑎𝑘=𝑠𝑘𝐴𝑙𝑖𝑐𝑒𝑜𝑙𝑑−𝑠𝑢𝑚𝐴𝑙𝑖𝑐𝑒: =𝑠𝑢𝑚𝐴𝑙𝑖𝑐𝑒+𝑠𝑘𝑆𝑂𝑜𝑙𝑑+(𝑠𝑘𝐴𝑙𝑖𝑐𝑒𝑜𝑙𝑑−𝑠𝑢𝑚𝐴𝑙𝑖𝑐𝑒)=𝑠𝑘𝐴𝑙𝑖𝑐𝑒𝑜𝑙𝑑+𝑠𝑘𝑆𝑂𝑜𝑙𝑑

5. Shard Adjustment:
   For SOs' Shamir shares, the 𝑛-th key's share for SO 𝑗 is adjusted as: 𝑓𝑆𝑂𝑛(𝑗)=𝑓𝑆𝑂𝑜𝑙𝑑(𝑗)−(∑𝑖=1𝑛−1𝑓𝑆𝑂𝑖(𝑗)−𝑇𝑤𝑒𝑎𝑘)
```

---

## Spark Wallet SDK Documentation

### Wallet Introduction

**URL:** https://docs.spark.money/wallet/introduction

**Content:**
```
# Introduction

![Image](https://mintlify.s3.us-west-1.amazonaws.com/lightspark/assets/docs-wallet-sdk-1.png)

The Spark Wallet SDK lets you deploy Spark-native wallets in the most scalable
and developer-friendly way possible.

Whether you're building for your own custody or shipping self-custodial wallets
for your users, the SDK is flexible by design. If you want to go deeper, the
lower-level APIs give you everything you need to build custom integrations from
scratch.

This is just the beginning. If there's something you wish the SDK did — tell us.
We're listening.

### Getting Started

1. [Create your first wallet](https://docs.spark.money/wallet/developer-guide/create-first-wallet)
2. [Deposit Bitcoin on your wallet](https://docs.spark.money/wallet/developer-guide/deposit-from-bitcoin)
3. [Send and receive on Spark](https://docs.spark.money/wallet/developer-guide/send-receive-spark)
4. [Send and receive on Lightning](https://docs.spark.money/wallet/developer-guide/send-receive-lightning)

### Documentation

[API Reference](https://docs.spark.money/wallet/documentation/api-reference)
[UX Guidelines](https://docs.spark.money/wallet/ux/integration-philosophy)
[Signing Spec](https://docs.spark.money/wallet/documentation/signing-specifications)
```

---

## Spark Ecosystem

### Ecosystem Partners

**URL:** https://www.spark.money/ecosystem

**Content:**
```
# Ecosystem

Explore the growing network of builders powering Spark. This ecosystem is constantly expanding, with new partners integrating as we
speak. Stay tuned as we continue to announce more.

## Partners:

### a16zcrypto (Investor)
The leading crypto investment firm backing foundational infrastructure and
innovation in web3. They support Spark as a critical Bitcoin layer, advancing
scalability and developer adoption.
[a16z.com](https://a16z.com/)

### Blitz (Consumer)
A self-custodial Bitcoin wallet that leverages Layer 2 technologies to enable
fast, low-cost payments. Built with a focus on simplicity and usability, they make
powerful Bitcoin apps accessible to everyone.
[blitz-wallet.com](https://blitz-wallet.com/)

### Brale (Infrastructure)
A stablecoin issuance platform for compliant, on-chain money. Brale builds on
Spark to launch native stable assets directly on Bitcoin.
[brale.xyz](https://brale.xyz/)

### Breez (Consumer)
The Breez SDK gives developers the simplest way to add Bitcoin payments to any
app or service.
[breez.technology](https://breez.technology/)

### Coatue (Investor)
A global technology investment firm focused on transformative companies. Coatue
invests in Spark to back the next evolution of Bitcoin's programmable
infrastructure.
[coatue.com](https://www.coatue.com/)

### Felix Capital (Investor)
A venture firm focused on early-stage crypto infrastructure. They back Spark to
help abstract Bitcoin's complexity for the next generation of applications.
[felixcap.com](https://www.felixcap.com/)

### Flashnet (Defi)
A millisecond limit-orderbook and trustless trading product suite, built on-top
of Spark with a custom validation system to enable high performance markets with
any asset on Bitcoin.
[flashnet.xyz](https://flashnet.xyz/)

### Inference Grid (Artificial Intelligence)
An experimental, decentralized AI network for permissionless inference. Built on
Spark to enable high frequency micropayment experiences.
[inferencegrid.ai](https://inferencegrid.ai/)

### Magic Eden (Defi)
The largest Bitcoin DEX focused on enhancing trading on Bitcoin by providing
easy and accessible trading for native assets. By integrating with Spark, Magic
Eden plans to unlock fast and low-cost L1 transactions for various market types,
including the USDB stablecoin.
[magiceden.io](https://magiceden.io/)

### Paradigm (Investor)
A research-driven investment firm advancing crypto through deep technical
backing. Paradigm supports Spark as core infrastructure for modular, Bitcoin-native
development.
[paradigm.xyz](https://www.paradigm.xyz/)

### Privy (Infrastructure)
Modular wallet infrastructure that powers smooth onboarding and best in class
UX. Privy builds on Spark to deliver intuitive Bitcoin-native experiences for
users and developers.
[privy.io](https://privy.io/)

### Ribbit Capital (Investor)
A global fintech-focused investor backing transformative financial
infrastructure. They invest in Spark to help unlock scalable financial coordination on
Bitcoin.
[ribbitcap.com](https://ribbitcap.com/)

### Sparkscan (Infrastructure)
The official block explorer for Spark — providing real-time visibility into
Spark transactions, contracts, and network activity.
[sparkscan.io](https://sparkscan.io/)

### Theya (Consumer)
Theya is a Bitcoin self-custody platform offering secure, simple collaborative
custody solutions for individuals, advisors, and businesses.
[theya.us](https://theya.us/)

### Thrive Capital (Investor)
An early-stage investor backing crypto infrastructure and open financial
systems. Thrive supports Spark as a trust-minimized foundation for programmable
Bitcoin.
[thrivecap.com](https://thrivecap.com/)

### utxo.fun (Defi)
The funnest and cheapest token marketplace on Bitcoin.
[utxo.fun](https://x.com/utxofun)

### Wallet of Satoshi (Consumer)
A leading mobile Lightning wallet known for its simplicity and ease of use,
offering self-custodial experiences powered by Spark
[walletofsatoshi.com](https://walletofsatoshi.com/)
```

---

## Spark Stablecoins

### Stablecoin Platform

**URL:** https://www.spark.money/stablecoins

**Content:**
```
# Launch Stablecoins on Bitcoin Instantly

Create a stablecoin on the most neutral and widely adopted network. With Spark, developers and businesses can create, distribute, monetize their
own stablecoins in minutes.

[Issue a stablecoin](https://docs.spark.info/issuing/introduction)

## Testimonial:

"We care deeply about network effects. Issuing on Spark is a no-brainer for Brale
— it has the potential to bring billions of people to stablecoins."

### Ben Milne
CEO, [Brale](https://brale.xyz/)

## Designed for payments. Built for scale.

### Live Features:
- Deploy your stablecoin in seconds. Run and distribute all your operations with the simplest APIs and SDKs,
natively on Bitcoin.

- Let developers and users move your stablecoin instantly and with no fees. Spark payments settle in under 1 second with zero fees.

- Don't introduce gas fees to your users. Focus on mass distribution and building the best UX — skip the 'You don't have
enough BTC for this payment'.

### In Development:
- Give users privacy when they need it. Not every payment needs to be public, let them move your stablecoin discreetly,
on their terms.

- Move beyond traditional yield-based revenue models. Spark enables new monetization avenues, including transaction-based fees
mechanics.

- Connect your stablecoin with any domestic real-time payment networks, making it instantly interoperable with any bank or wallet.

Designed by Bitcoin and payments industry veterans, Spark is designed from the
ground up to be the very best stablecoin network for mass-market payments.

[Get in touch](mailto:contact@spark.money)
[Issue a stablecoin](https://docs.spark.info/issuing/introduction)
```

---

## Spark Manifesto

### Vision & Philosophy

**URL:** https://www.spark.money/manifesto

**Content:**
```
# Manifesto

Sixteen years ago, Bitcoin introduced something radical: a peer-to-peer
electronic cash system. At the time it sounded like science fiction, but today it's a
trillion-dollar asset. It's held by institutions, written about in central bank
reports, and debated on Senate floors. Everyone knows what Bitcoin is; whether
they use it or not, they know it's real. That alone makes it one of the most
successful pieces of software ever written.

But while Bitcoin has wildly succeeded as a monetary asset (a decentralized
store of value nobody can inflate), it hasn't become the medium of exchange many
envisioned early on. People do move Bitcoin, but on the scale of global payments
it's a footnote. Transactions are slow and expensive: a basic transfer can take
thirty minutes and cost real money. That's intentional. Efforts to scale have
included larger blocks, sidechains and second layers, but each added more
complexity.

The most well-known effort, Lightning, proved you can move Bitcoin quickly and
cheaply without breaking its core trust guarantees. However, Lightning alone
cannot scale to billions of users: its cumbersome UX, fragmented liquidity and high
wallet-creation costs pose significant barriers.

Meanwhile, stablecoins took off by solving a real problem rather than adhering
to original visions or philosophical purity. People want money that doesn't
fluctuate daily, that they can send, store and build with, and that settles instantly
anywhere in the world.

For developers, stablecoins became a superpower. A few lines of code enable
wallets in any country and power new applications—marketplaces, savings tools,
creator payouts—without permission or bank interactions. Stablecoins transformed
crypto from a speculative asset into a functional financial rail, moving more value
today than PayPal.

Yet none of this stablecoin activity occurs on Bitcoin, since it was not
designed for such expressiveness and lacks the smart-contract capabilities of other
networks.

Still, Bitcoin's network remains the most resilient primitive: over 200 million
users, more than 60 percent of crypto liquidity, and a transcendent brand.
Developers will continue building on Bitcoin long after other networks fade.

Today we introduce Spark, a Bitcoin-native Layer 2 for payments and settlement.
No bridges, no custodians, only a lightweight signing protocol that makes
digital cash, whether BTC or stablecoin, truly usable.

Spark returns to first principles by enabling native applications on Bitcoin.
First, it delivers the best UX ever seen on Bitcoin: whether for wallets, games or
marketplaces, it offers the fastest, simplest and cheapest rails in crypto.
Second, it unlocks new primitives such as stablecoins directly on Bitcoin as
native, scalable, self-custodial assets rather than through wrappers or bridges.

Built by payment and Bitcoin veterans, Spark is designed to unlock Bitcoin's
fullest potential.

[Get in touch](mailto:contact@spark.money)
[Start Building](https://docs.spark.info/)
```

---

## GitHub Repositories

### BuildOnSpark Organization

**URL:** https://github.com/buildonspark

**Repositories Found:**

1. **spark** (Public) - The Spark Bitcoin layer 2 protocol
   - TypeScript
   - 46 stars, 21 forks
   - Apache-2.0 license
   - 4 issues, 2 pull requests
   - Updated 4 hours ago

2. **wallet-standard** (Public) - Wallet Standard
   - TypeScript
   - Apache-2.0 license
   - Updated yesterday

3. **lrc20** (Public) - A protocol that supports digital assets on bitcoin
   - Rust
   - 5 stars, 2 forks
   - Apache-2.0 license
   - Updated 2 weeks ago

4. **inference-grid-examples** (Public) - Example uses of Inference Grid
   - TypeScript
   - 2 stars, 1 fork
   - Apache-2.0 license
   - 1 issue
   - Updated May 17

5. **sip** (Public) - Spark Improvement Proposals
   - 8 stars
   - 3 issues
   - Updated April 15

**Organization Profile:**
- 42 followers
- Website: http://spark.info
- Twitter: @buildonspark
- Tagline: "Scaling Bitcoin with payments"

**Note:** Specific repositories for SparkSat wallet and Spark SDK were not publicly accessible (404 errors), indicating they may be private or have different naming.

---

## Site Navigation & Structure

### SparkSat Application Structure
```
https://sparksat.app/
├── / (main landing page)
├── /wallet (wallet dashboard - requires authentication)
├── /send (send payment interface - requires authentication)
├── /receive (receive payment interface - requires authentication)
└── /settings (wallet settings - requires authentication)
```

### Spark Protocol Site Structure
```
https://www.spark.money/
├── / (homepage)
├── /manifesto (vision and philosophy)
├── /ecosystem (partners and builders)
├── /stablecoins (stablecoin platform)
├── /wallets (wallet development)
├── /issuance (asset issuance)
├── /build/
│   ├── /payment-apps
│   ├── /bitcoin-rewards
│   ├── /bitcoin-earnings
│   ├── /defi-trading-apps
│   └── /stablecoins
├── /news (latest updates)
├── /brand (brand assets)
├── /terms-of-use
└── /privacy-policy
```

### Documentation Structure
```
https://docs.spark.money/
├── /home/
│   ├── /welcome
│   └── /manifesto
├── /spark/
│   ├── /spark-tldr
│   ├── /sovereignty
│   ├── /trust-model
│   ├── /frost-signing
│   ├── /scalability
│   └── /limitations
├── /wallet/
│   ├── /introduction
│   ├── /developer-guide/
│   ├── /documentation/
│   └── /ux/
├── /issuing/
│   └── /introduction
└── /lrc20/
    └── /history
```

---

## Technical Specifications Summary

### Protocol Characteristics
- **Type:** Bitcoin Layer 2 scaling solution
- **Architecture:** Statechain-based with FROST threshold signing
- **Consensus:** No external consensus, relies on Bitcoin L1
- **Trust Model:** 1/n trust assumptions with moment-in-time trust
- **Transaction Speed:** <1 second settlement
- **Transaction Cost:** Near-zero fees
- **Exit Mechanism:** Unilateral exit to Bitcoin L1
- **Asset Support:** Bitcoin, stablecoins, custom tokens

### Signing Protocol
- **Algorithm:** Modified FROST (Flexible Round-Optimized Schnorr Threshold)
- **Participants:** Users + Spark Operators (threshold t-of-n)
- **Security:** Perfect forward security through key deletion
- **Features:** Key tweaking, additive aggregation, key splitting

### Network Topology
- **Users:** Individual participants with private keys
- **Spark Operators:** Distributed signing entities
- **Coordinators:** Transaction coordination services
- **Watchtowers:** Exit monitoring and dispute resolution

### Development Stack
- **SDK:** @buildonspark/spark-sdk (TypeScript/JavaScript)
- **Networks:** MAINNET (live), TESTNET (development)
- **APIs:** REST + WebSocket for real-time updates
- **Languages:** TypeScript, Rust, JavaScript
- **Protocols:** Bitcoin, Lightning Network, Spark L2

---

## Integration Points for MOOSH Wallet

### Immediate Opportunities
1. **Spark SDK Integration** - Add instant Bitcoin transactions
2. **Lightning Bridge** - Enhanced Lightning Network support
3. **Stablecoin Support** - Native Bitcoin stablecoins (USDB, EURC)
4. **Multi-asset Wallet** - Support for Spark-native tokens

### Advanced Features
1. **Asset Issuance** - Create custom tokens on Bitcoin
2. **DeFi Integration** - Access to Spark ecosystem (Flashnet, Magic Eden)
3. **Enterprise Solutions** - Business payment processing
4. **Cross-network Routing** - Automatic L1/L2/Lightning optimization

### Technical Implementation
1. **Phase 1:** Basic Spark wallet functionality
2. **Phase 2:** Asset management and stablecoin support
3. **Phase 3:** DeFi and ecosystem integration
4. **Phase 4:** Enterprise and custom token features

---

*This archive represents a complete scrape of all publicly accessible content from SparkSat and Spark Protocol websites as of January 2025. The content demonstrates a comprehensive Bitcoin Layer 2 solution with significant potential for integration with existing wallet applications like MOOSH Wallet.*
