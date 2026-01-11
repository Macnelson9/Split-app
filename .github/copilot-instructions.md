# AI Agent Instructions for SPLIT Codebase

## Project Overview

**SPLIT** is a decentralized payment distribution application built on Base and Celo blockchains. It enables users to create smart contracts that automatically distribute payments (ETH/ERC-20) among multiple recipients at predefined percentages with a 0.5% platform fee.

## Architecture & Core Components

### Multi-Chain Strategy

- **Supported Networks**: Base Mainnet, Base Sepolia, Celo Mainnet, Celo Sepolia
- **Chain Configuration**: Defined in [lib/wagmi.ts](../lib/wagmi.ts) using Wagmi + Viem
- **Network Detection**: Use `useAccount()` hook to detect current chain and dynamically load correct contract ABIs/addresses from environment variables
- **Pattern**: Each network has separate factory addresses and ABIs (`SPLIT_BASE_MAINNET_FACTORY_ABI.json`, `SPLIT_CELO_MAINNET_FACTORY_ABI.json`, etc.)

### Smart Contract Layer

- **SplitFactory**: Factory contract for creating split instances (contract addresses in `NEXT_PUBLIC_FACTORY_ADDRESS_*` env vars)
- **SplitContract**: Individual split contracts handling fund distribution
- **ABI Files**: Located in [lib/](../lib/) directory, indexed by chain/network (`lib/SPLIT_BASE_MAINNET_FACTORY_ABI.json`)
- **Integration**: Interact via [useSplitFactory](../src/hooks/useSplitFactory.ts) and [useSplitContract](../src/hooks/useSplitContract.ts) hooks

### Form & UI Patterns

- **UI Components**: Radix UI + custom components from [components/ui/](../components/ui/) (button, card, dialog, input, select, label)
- **Forms**: React Hook Form + Zod validation (`react-hook-form`, `zod`)
- **Styling**: Tailwind CSS v4 with custom animations (GSAP, `tailwindcss-animate`)
- **Notifications**: Sonner toast library via [useToastNotification](../src/hooks/useToastNotification.ts)

### State & Data Flow

- **Wallet State**: `useWallet()` hook manages connection, chain switching, supported network validation
- **Contract State**: Wagmi hooks (`useReadContract`, `useWriteContract`, `useWaitForTransactionReceipt`)
- **Data Fetching**: TanStack React Query for server state management
- **Environment Config**: Factory addresses and chain RPC endpoints via `.env.local` (required: `NEXT_PUBLIC_FACTORY_ADDRESS_*`, `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`)

## Key Workflows

### Creating a Split (SplitCreationForm.tsx)

1. User selects token (ETH/USDC/Celo/etc.) - available tokens differ by chain
2. Dynamically loads correct factory address/ABI based on connected chain
3. User adds recipient addresses and percentages (must total 100%)
4. Form validates percentages, calls factory contract to create split
5. Tracks transaction via `useWaitForTransactionReceipt`, triggers callback on success

### Wallet Management (useWallet.ts)

- `connectWallet()`: Uses Wagmi injected connector
- `switchToSupportedNetwork()`: Attempts to switch to supported chains in priority order
- `isOnSupportedNetwork`: Boolean check for Celo, Base, Base Sepolia, Celo Sepolia
- Always validate user is on supported network before contract interactions

## Developer Commands

```bash
npm run dev      # Start Next.js dev server (localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project-Specific Conventions

### Naming & File Organization

- **Hooks**: Prefixed with `use*`, stored in [src/hooks/](../src/hooks/), one hook per file
- **Components**: PascalCase in [components/](../components/), UI primitives in `ui/` subdirectory
- **Chain-Aware Logic**: Always read current chain from `useAccount()` to dynamically select contract addresses/ABIs
- **Imports**: Absolute paths via `@/` alias (configured in `tsconfig.json`)

### Contract Interaction Patterns

- **ABI Selection**: Use chain ID to select correct ABI from [lib/](../lib/) (e.g., `isOnBaseSepolia ? SPLIT_BASE_SEPOLIA_FACTORY_ABI : SPLIT_CELO_MAINNET_FACTORY_ABI`)
- **Address Selection**: Load factory addresses from env variables, never hardcode
- **Error Handling**: Use try-catch around `switchToSupportedNetwork()`, toast errors via `useToastNotification`
- **Percentage Validation**: Ensure form percentages sum to exactly 100% before submission

### Theme & Styling

- **Theme System**: Dark/light modes via `next-themes`, color accent system passed via props
- **CSS Architecture**: Global styles in [app/globals.css](../app/globals.css) and [styles/globals.css](../styles/globals.css)
- **Animations**: GSAP for complex animations, Tailwind utilities for basic transitions
- **Layout**: `client-layout.tsx` provides consistent navigation/structure across pages

## Common Patterns to Follow

### When Adding a New Feature

1. **Chain Awareness**: If interacting with contracts, check current chain and load appropriate ABI/address
2. **Form Validation**: Use Zod schema + React Hook Form integration
3. **Notifications**: Use `useToastNotification()` hook for success/error messages
4. **Wallet Requirements**: Call `switchToSupportedNetwork()` if feature requires specific chain, then validate with `isOnSupportedNetwork`

### When Debugging Contract Calls

- Check [useSplitFactory.ts](../src/hooks/useSplitFactory.ts) and [useSplitContract.ts](../src/hooks/useSplitContract.ts) for current patterns
- Verify correct ABI is loaded (log `FACTORY_ABI` to confirm it matches expected contract)
- Confirm factory address matches chain (compare `FACTORY_ADDRESS` with env variable for current chain)
- Test on Base Sepolia testnet first before mainnet

### Page Routes

- `/`: Homepage
- `/split`: Create/manage splits (main feature)
- `/dashboard`: View user's splits
- `/about` & `/contact`: Static pages
- All use [client-layout.tsx](../app/client-layout.tsx) structure

## Critical Dependencies

- **wagmi@^2.18.1**: Wallet connection, contract reads/writes
- **viem@^2.38.3**: Ethereum client library (address formatting, parsing)
- **@tanstack/react-query@^5.90.5**: Server state management
- **react-hook-form@^7.60.0 + zod**: Form validation
- **@radix-ui/\***: Unstyled, accessible UI components
- **tailwindcss@^4.1.9**: Styling framework

## Testing & Validation

No existing test files found in structure. When adding tests:

- Focus on form validation logic (percentage calculations)
- Chain-switching logic in `useWallet.ts`
- ABI/address selection in hooks based on chain ID
- Mock Wagmi hooks using `vi.mock()` or similar for unit tests

## Environment Variables Required

```
NEXT_PUBLIC_FACTORY_ADDRESS_BASE_MAINNET=0x...
NEXT_PUBLIC_FACTORY_ADDRESS_BASE_SEPOLIA=0x...
NEXT_PUBLIC_FACTORY_ADDRESS_CELO_MAINNET=0x...
NEXT_PUBLIC_FACTORY_ADDRESS_CELO_SEPOLIA=0x...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```
