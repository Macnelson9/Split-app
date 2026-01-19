// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SplitCard is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Card {
        address creator;
        uint256 amount;
        address token; // address(0) for native
        uint256 expire_date; // timestamp
        bool redeemed;
        address redeemer_addr;
    }

    mapping(bytes32 => Card) public cards;
    uint256 public nonce; // for unique code generation

    event CardCreated(
        bytes32 indexed code,
        address indexed creator,
        uint256 amount,
        address token,
        uint256 expire_date
    );
    event CardRedeemed(
        bytes32 indexed code,
        address indexed redeemer_addr,
        uint256 amount,
        address token
    );

    error CardAlreadyExists();
    error CardNotFound();
    error CardExpired();
    error CardAlreadyRedeemed();
    error InvalidAmount();
    error TransferFailed();
    error Unauthorized();

    function createCard(
        uint256 amount,
        address token,
        uint256 durationDays
    ) external payable nonReentrant {
        if (amount == 0) revert InvalidAmount();
        bytes32 code = keccak256(abi.encodePacked(msg.sender, nonce++));
        if (cards[code].creator != address(0)) revert CardAlreadyExists(); // unlikely, but safe

        uint256 expire_date = block.timestamp + (durationDays * 1 days);
        cards[code] = Card(
            msg.sender,
            amount,
            token,
            expire_date,
            false,
            address(0)
        );

        if (token == address(0)) {
            if (msg.value != amount) revert InvalidAmount();
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        emit CardCreated(code, msg.sender, amount, token, expire_date);
    }

    function redeemCard(bytes32 code) external nonReentrant {
        Card storage card = cards[code];
        if (card.creator == address(0)) revert CardNotFound();
        if (card.redeemed) revert CardAlreadyRedeemed();
        if (block.timestamp > card.expire_date) revert CardExpired();

        card.redeemed = true;
        card.redeemer_addr = msg.sender;

        if (card.token == address(0)) {
            (bool success, ) = payable(msg.sender).call{value: card.amount}("");
            if (!success) revert TransferFailed();
        } else {
            IERC20(card.token).safeTransfer(msg.sender, card.amount);
        }

        emit CardRedeemed(code, msg.sender, card.amount, card.token);
    }

    function withdrawExpired(bytes32 code) external nonReentrant {
        Card storage card = cards[code];
        if (card.creator != msg.sender) revert Unauthorized();
        if (!card.redeemed && block.timestamp > card.expire_date) {
            uint256 amount = card.amount;
            card.amount = 0; // prevent re-withdrawal
            if (card.token == address(0)) {
                (bool success, ) = payable(msg.sender).call{value: amount}("");
                if (!success) revert TransferFailed();
            } else {
                IERC20(card.token).safeTransfer(msg.sender, amount);
            }
        }
    }

    function getCard(
        bytes32 code
    )
        external
        view
        returns (
            address creator,
            uint256 amount,
            address token,
            uint256 expire_date,
            bool redeemed,
            address redeemer_addr
        )
    {
        Card memory card = cards[code];
        return (
            card.creator,
            card.amount,
            card.token,
            card.expire_date,
            card.redeemed,
            card.redeemer_addr
        );
    }
}
