// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AlibiSubscription is Ownable, ReentrancyGuard {
    IERC20 public immutable usdc;
    uint256 public constant PRICE = 10_000;
    uint256 public constant PERIOD = 30 days;
    mapping(address => uint256) public expiresAt;

    event Subscribed(address indexed subscriber, uint256 expiresAt, uint256 amount);

    constructor(address initialOwner, address usdcAddress) Ownable(initialOwner) { usdc = IERC20(usdcAddress); }

    function subscribe() external nonReentrant {
        require(usdc.transferFrom(msg.sender, owner(), PRICE), "USDC transfer failed");
        uint256 start = expiresAt[msg.sender] > block.timestamp ? expiresAt[msg.sender] : block.timestamp;
        expiresAt[msg.sender] = start + PERIOD;
        emit Subscribed(msg.sender, expiresAt[msg.sender], PRICE);
    }

    function isSubscribed(address subscriber) external view returns (bool) { return expiresAt[subscriber] >= block.timestamp; }
}
