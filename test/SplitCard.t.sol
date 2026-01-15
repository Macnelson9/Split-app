// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "forge-std/Test.sol";
import "../contract/splitcard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MOCK") {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}

contract SplitCardTest is Test {
    SplitCard splitCard;
    MockERC20 mockToken;
    address userA = address(0x1);
    address userB = address(0x2);
    address userC = address(0x3);
    uint256 amount = 1 ether;
    uint256 duration = 30; // days

    function setUp() public {
        splitCard = new SplitCard();
        mockToken = new MockERC20();
        mockToken.transfer(userA, 100 * 10 ** 18);
        vm.deal(userA, 10 ether);
        vm.deal(userB, 1 ether);
        vm.deal(address(this), 10 ether);
    }

    function testCreateCardNative() public {
        vm.prank(userA);
        bytes32 code = keccak256(
            abi.encodePacked(block.timestamp, userA, splitCard.nonce())
        );
        vm.expectEmit(true, true, false, true);
        emit SplitCard.CardCreated(
            code,
            userA,
            amount,
            address(0),
            block.timestamp + duration * 1 days
        );
        splitCard.createCard{value: amount}(amount, address(0), duration);

        (
            address creator,
            uint256 amt,
            address token,
            uint256 expiry,
            bool redeemed,
            address redeemer
        ) = splitCard.getCard(code);
        assertEq(creator, userA);
        assertEq(amt, amount);
        assertEq(token, address(0));
        assertEq(expiry, block.timestamp + duration * 1 days);
        assertEq(redeemed, false);
        assertEq(redeemer, address(0));
    }

    function testCreateCardERC20() public {
        vm.startPrank(userA);
        mockToken.approve(address(splitCard), amount);
        bytes32 code = keccak256(abi.encodePacked(userA, splitCard.nonce()));
        vm.expectEmit(true, true, false, true);
        emit SplitCard.CardCreated(
            code,
            userA,
            amount,
            address(mockToken),
            block.timestamp + duration * 1 days
        );
        splitCard.createCard(amount, address(mockToken), duration);
        vm.stopPrank();

        (
            address creator,
            uint256 amt,
            address token,
            uint256 expiry,
            bool redeemed,
            address redeemer
        ) = splitCard.getCard(code);
        assertEq(creator, userA);
        assertEq(amt, amount);
        assertEq(token, address(mockToken));
        assertEq(expiry, block.timestamp + duration * 1 days);
        assertEq(redeemed, false);
        assertEq(redeemer, address(0));
    }

    function testCreateCardInvalidAmount() public {
        vm.prank(userA);
        vm.expectRevert(SplitCard.InvalidAmount.selector);
        splitCard.createCard(0, address(0), duration);
    }

    function testCreateCardNativeValueMismatch() public {
        vm.prank(userA);
        vm.expectRevert(SplitCard.InvalidAmount.selector);
        splitCard.createCard{value: amount / 2}(amount, address(0), duration);
    }

    function testRedeemCardNative() public {
        vm.prank(userA);
        bytes32 code = keccak256(abi.encodePacked(userA, splitCard.nonce()));
        splitCard.createCard{value: amount}(amount, address(0), duration);

        uint256 balanceBefore = userB.balance;
        vm.prank(userB);
        vm.expectEmit(true, true, false, true);
        emit SplitCard.CardRedeemed(code, userB, amount, address(0));
        splitCard.redeemCard(code);

        uint256 balanceAfter = userB.balance;
        assertEq(balanceAfter - balanceBefore, amount);

        (, , , , bool redeemed, address redeemer) = splitCard.getCard(code);
        assertEq(redeemed, true);
        assertEq(redeemer, userB);
    }

    function testRedeemCardERC20() public {
        vm.startPrank(userA);
        mockToken.approve(address(splitCard), amount);
        bytes32 code = keccak256(abi.encodePacked(userA, splitCard.nonce()));
        splitCard.createCard(amount, address(mockToken), duration);
        vm.stopPrank();

        uint256 balanceBefore = mockToken.balanceOf(userB);
        vm.prank(userB);
        vm.expectEmit(true, true, false, true);
        emit SplitCard.CardRedeemed(code, userB, amount, address(mockToken));
        splitCard.redeemCard(code);

        uint256 balanceAfter = mockToken.balanceOf(userB);
        assertEq(balanceAfter - balanceBefore, amount);

        (, , , , bool redeemed, address redeemer) = splitCard.getCard(code);
        assertEq(redeemed, true);
        assertEq(redeemer, userB);
    }

    function testRedeemCardNotFound() public {
        bytes32 fakeCode = keccak256("fake");
        vm.prank(userB);
        vm.expectRevert(SplitCard.CardNotFound.selector);
        splitCard.redeemCard(fakeCode);
    }

    function testRedeemCardAlreadyRedeemed() public {
        vm.prank(userA);
        bytes32 code = keccak256(abi.encodePacked(userA, splitCard.nonce()));
        splitCard.createCard{value: amount}(amount, address(0), duration);

        vm.prank(userB);
        splitCard.redeemCard(code);

        vm.prank(userC);
        vm.expectRevert(SplitCard.CardAlreadyRedeemed.selector);
        splitCard.redeemCard(code);
    }

    function testRedeemCardExpired() public {
        vm.prank(userA);
        bytes32 code = keccak256(abi.encodePacked(userA, splitCard.nonce()));
        splitCard.createCard{value: amount}(amount, address(0), 0); // 0 days, expires immediately

        vm.warp(block.timestamp + 1); // move time forward

        vm.prank(userB);
        vm.expectRevert(SplitCard.CardExpired.selector);
        splitCard.redeemCard(code);
    }

    function testWithdrawExpiredNative() public {
        vm.prank(userA);
        bytes32 code = keccak256(abi.encodePacked(userA, splitCard.nonce()));
        splitCard.createCard{value: amount}(amount, address(0), 0);

        vm.warp(block.timestamp + 1);

        uint256 balanceBefore = userA.balance;
        vm.prank(userA);
        splitCard.withdrawExpired(code);

        uint256 balanceAfter = userA.balance;
        assertEq(balanceAfter - balanceBefore, amount);

        (address creator, uint256 amt, , , , ) = splitCard.getCard(code);
        assertEq(creator, userA);
        assertEq(amt, 0); // amount set to 0
    }

    function testWithdrawExpiredERC20() public {
        vm.startPrank(userA);
        mockToken.approve(address(splitCard), amount);
        bytes32 code = keccak256(abi.encodePacked(userA, splitCard.nonce()));
        splitCard.createCard(amount, address(mockToken), 0);
        vm.stopPrank();

        vm.warp(block.timestamp + 1);

        uint256 balanceBefore = mockToken.balanceOf(userA);
        vm.prank(userA);
        splitCard.withdrawExpired(code);

        uint256 balanceAfter = mockToken.balanceOf(userA);
        assertEq(balanceAfter - balanceBefore, amount);

        (address creator, uint256 amt, , , , ) = splitCard.getCard(code);
        assertEq(creator, userA);
        assertEq(amt, 0);
    }

    function testWithdrawExpiredNotCreator() public {
        vm.prank(userA);
        bytes32 code = keccak256(abi.encodePacked(userA, splitCard.nonce()));
        splitCard.createCard{value: amount}(amount, address(0), 0);

        vm.warp(block.timestamp + 1);

        vm.prank(userB);
        vm.expectRevert(SplitCard.Unauthorized.selector);
        splitCard.withdrawExpired(code);
    }

    function testWithdrawExpiredNotExpired() public {
        vm.prank(userA);
        bytes32 code = keccak256(abi.encodePacked(userA, splitCard.nonce()));
        splitCard.createCard{value: amount}(amount, address(0), duration);

        vm.prank(userA);
        // Should not withdraw since not expired
        splitCard.withdrawExpired(code);

        (address creator, uint256 amt, , , , ) = splitCard.getCard(code);
        assertEq(creator, userA);
        assertEq(amt, amount); // amount still there
    }

    function testWithdrawExpiredAlreadyRedeemed() public {
        vm.prank(userA);
        bytes32 code = keccak256(abi.encodePacked(userA, splitCard.nonce()));
        splitCard.createCard{value: amount}(amount, address(0), 0);

        vm.prank(userB);
        splitCard.redeemCard(code);

        vm.warp(block.timestamp + 1);

        vm.prank(userA);
        // Should not withdraw since redeemed
        splitCard.withdrawExpired(code);

        (address creator, uint256 amt, , , , ) = splitCard.getCard(code);
        assertEq(creator, userA);
        assertEq(amt, amount); // amount still there, but redeemed
    }

    function testGetCard() public {
        vm.prank(userA);
        bytes32 code = keccak256(abi.encodePacked(userA, splitCard.nonce()));
        splitCard.createCard{value: amount}(amount, address(0), duration);

        (
            address creator,
            uint256 amt,
            address token,
            uint256 expiry,
            bool redeemed,
            address redeemer
        ) = splitCard.getCard(code);
        assertEq(creator, userA);
        assertEq(amt, amount);
        assertEq(token, address(0));
        assertEq(expiry, block.timestamp + duration * 1 days);
        assertEq(redeemed, false);
        assertEq(redeemer, address(0));
    }

    function testGetCardNonExistent() public {
        bytes32 fakeCode = keccak256("nonexistent");
        (
            address creator,
            uint256 amt,
            address token,
            uint256 expiry,
            bool redeemed,
            address redeemer
        ) = splitCard.getCard(fakeCode);
        assertEq(creator, address(0));
        assertEq(amt, 0);
        assertEq(token, address(0));
        assertEq(expiry, 0);
        assertEq(redeemed, false);
        assertEq(redeemer, address(0));
    }

    function testNonceIncrements() public {
        uint256 nonceBefore = splitCard.nonce();
        vm.prank(userA);
        splitCard.createCard{value: amount}(amount, address(0), duration);
        uint256 nonceAfter = splitCard.nonce();
        assertEq(nonceAfter, nonceBefore + 1);
    }
}
