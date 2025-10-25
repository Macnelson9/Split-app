# SPLIT

A decentralized payment splitting application built on the Base blockchain. SPLIT allows users to create smart contracts that automatically distribute payments among multiple recipients according to predefined percentages.

## Overview

SPLIT is a Web3 application that simplifies payment distribution through smart contracts. Users can create "split" contracts that define how incoming payments (ETH or ERC-20 tokens) should be divided among multiple recipients. The platform charges a small 0.5% fee on distributions to support ongoing development.

### Key Features

- **Multi-Token Support**: Create splits for ETH and popular ERC-20 tokens on Base (USDC, DAI, WETH)
- **Flexible Distribution**: Define custom percentage splits among any number of recipients
- **Smart Contract Security**: All distributions are handled by audited smart contracts on Base
- **Real-time Management**: Deposit funds, distribute payments, and finalize splits through an intuitive dashboard
- **Base Network Integration**: Built specifically for the Base ecosystem with optimized gas fees
- **Wallet Integration**: Connect with popular Web3 wallets (MetaMask, WalletConnect, etc.)

## How It Works

1. **Create a Split**: Define recipients and their percentage shares
2. **Deposit Funds**: Send ETH or tokens to the split contract
3. **Distribute**: Trigger automatic distribution according to your rules
4. **Finalize**: Lock the contract when distribution is complete

### Smart Contract Architecture

The application consists of two main contracts:

- **SplitContract**: Individual split contracts that handle fund distribution
- **SplitFactory**: Factory contract for creating and managing split contracts

### Fee Structure

- 0.5% fee on all distributions (50 basis points)
- Fees are sent to a treasury address for platform sustainability

## Installation

### Prerequisites

- Node.js 18+
- npm or pnpm
- A Web3 wallet (MetaMask, etc.)

### Setup

1. Clone the repository:

```bash
git clone <https://github.com/Macnelson9/Split-app.git>
cd Split-app
```

2. Install dependencies:

```bash
npm install --legacy-peer-deps
# or
pnpm install --legacy-peer-deps
```

3. Create environment variables:

```bash
cp .env.example .env.local
```

4. Configure your environment variables (API keys, etc.)

5. Run the development server:

```bash
npm run dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Connecting a Wallet

1. Click "Connect Wallet" on the homepage
2. Select your preferred wallet
3. Ensure you're connected to Base Sepolia testnet

### Creating a Split

1. Navigate to the Split Dashboard
2. Click "Create Split"
3. Select the token type (ETH, USDC, etc.)
4. Add recipient addresses and their percentage shares
5. Ensure percentages total 100%
6. Confirm the transaction

### Managing Splits

- **Deposit**: Add funds to an active split contract
- **Distribute**: Automatically send funds to recipients according to percentages
- **Finalize**: Lock the contract when distribution is complete
- **View History**: Track all your created splits

### Supported Networks

- Base Sepolia (Testnet)
- Base Mainnet (Coming soon)
- Celo Sepolia (Coming soon)
- Celo Mainnet (Coming soon)

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Web3**: Wagmi, Viem, Base blockchain
- **Smart Contracts**: Solidity, OpenZeppelin
- **Animations**: Framer Motion, GSAP

## Smart Contract Details

### SplitContract

Core functionality for individual payment splits:

- `distributeEth()`: Distributes ETH according to recipient percentages
- `distributeToken()`: Distributes ERC-20 tokens
- `depositEth()`: Deposits ETH into the contract
- `depositToken()`: Deposits ERC-20 tokens
- `finalize()`: Locks the contract permanently

### SplitFactory

Factory contract for creating and tracking splits:

- `createSplit()`: Deploys new SplitContract instances
- `getUserSplits()`: Returns all splits created by a user
- `getAllSplits()`: Returns all splits in the system

## Security

- All smart contracts use OpenZeppelin's battle-tested libraries
- ReentrancyGuard protection on all state-changing functions
- SafeERC20 for secure token transfers
- Only contract creators can trigger distributions
- Contracts can be finalized to prevent further changes

## Contributing

We welcome contributions to SPLIT! Here's how you can help:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

### Areas for Contribution

- **Smart Contract Audits**: Security reviews and improvements
- **UI/UX Enhancements**: Better user experience and design
- **New Token Support**: Adding more ERC-20 tokens
- **Multi-Chain Support**: Expanding beyond Base
- **Testing**: Additional test coverage
- **Documentation**: Improving docs and tutorials

### Code Standards

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write comprehensive tests for new features
- Follow conventional commit messages

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This is experimental software. Use at your own risk. Always test thoroughly on testnets before mainnet deployment. The developers are not responsible for any financial losses incurred through the use of this software.

## Contact

For questions, suggestions, or support:

- Create an issue on GitHub
- Join our Discord community
- Email: ucheofatu@gmail.com

---

Built with ❤️
