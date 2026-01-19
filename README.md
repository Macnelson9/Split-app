# SPLIT

A decentralized payment splitting app for Base and Celo. Create on-chain split contracts that distribute ETH or USDC to multiple recipients using predefined percentages.

## Overview

SPLIT makes payment distribution simple for teams, DAOs, and creators. Create a split contract once, deposit funds, and trigger a distribution whenever you are ready. The platform charges a 0.5% fee on distributions to support ongoing development.

### Key Features

- **USDC Splitting on Base and Celo**: Create and distribute USDC splits across both networks
- **ETH Support**: Split native ETH payments alongside USDC
- **Flexible Distribution**: Define custom percentage splits for any number of recipients
- **Factory-Based Contracts**: Deploy and manage splits through a single factory contract
- **Wallet Integration**: Connect with MetaMask, WalletConnect, and other Web3 wallets
- **Simple Dashboard**: Create, fund, distribute, and finalize splits from one place

## How It Works

1. **Create a Split**: Add recipients and percentage shares
2. **Deposit Funds**: Send ETH or USDC to the split contract
3. **Distribute**: Trigger a distribution when you are ready
4. **Finalize**: Lock the contract once distributions are complete

## Supported Networks

- Base Mainnet (USDC and ETH)
- Celo Mainnet (USDC and ETH)

## Fee Structure

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
git clone https://github.com/Macnelson9/Split-app.git
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

6. Open `http://localhost:3000` in your browser

## Usage

### Connecting a Wallet

1. Click "Connect Wallet" on the homepage
2. Select your preferred wallet
3. Ensure you are connected to Base mainnet or Celo mainnet

### Creating a Split

1. Navigate to the Split Dashboard
2. Click "Create Split"
3. Select the token type (ETH or USDC)
4. Add recipient addresses and their percentage shares
5. Ensure percentages total 100%
6. Confirm the transaction

### Managing Splits

- **Deposit**: Add funds to an active split contract
- **Distribute**: Automatically send funds to recipients according to percentages
- **Finalize**: Lock the contract when distribution is complete
- **View History**: Track all your created splits

## Smart Contract Architecture

The application uses two main contracts:

- **SplitContract**: Individual split contracts that handle fund distribution
- **SplitFactory**: Factory contract for creating and managing split contracts

### SplitContract Functions

- `distributeEth()`: Distributes ETH according to recipient percentages
- `distributeToken()`: Distributes USDC according to recipient percentages
- `depositEth()`: Deposits ETH into the contract
- `depositToken()`: Deposits USDC into the contract
- `finalize()`: Locks the contract permanently

## Security

- OpenZeppelin libraries for trusted contract primitives
- ReentrancyGuard protection on state-changing functions
- SafeERC20 for secure token transfers
- Only contract creators can trigger distributions
- Contracts can be finalized to prevent further changes

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Web3**: Wagmi, Viem
- **Smart Contracts**: Solidity, OpenZeppelin
- **Animations**: Framer Motion, GSAP

## Contributing

We welcome contributions to SPLIT:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

### Areas for Contribution

- Smart contract audits and improvements
- UI and UX enhancements
- Additional token support
- Multi-chain expansion
- Tests and documentation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions, suggestions, or support:

- Create an issue on GitHub
- Email: ucheofatu@gmail.com

<!-- ## SplitCard Contract Address

--- -->

Built with care.
