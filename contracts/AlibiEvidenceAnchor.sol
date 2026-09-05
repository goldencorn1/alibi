// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract AlibiEvidenceAnchor is Ownable {
    mapping(bytes32 => uint256) public anchoredAt;
    event EvidenceAnchored(bytes32 indexed evidenceHash, uint256 timestamp, address indexed submitter);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function anchor(bytes32 evidenceHash) external onlyOwner {
        require(evidenceHash != bytes32(0), "empty evidence hash");
        require(anchoredAt[evidenceHash] == 0, "already anchored");
        anchoredAt[evidenceHash] = block.timestamp;
        emit EvidenceAnchored(evidenceHash, block.timestamp, msg.sender);
    }
}
