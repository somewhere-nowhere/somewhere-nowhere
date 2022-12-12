// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import './IRoles.sol';

interface IRevealable is IRoles {
    error LinkBalanceIsInsufficient();

    error RandomnessWasAlreadyRequested();

    error SeedIsAlreadySet();

    event DefaultURIUpdated(string defaultURI);

    event SeedUpdated(uint256 seed);

    event RandomnessFailed(
        uint256 indexed timestamp,
        bytes32 requestId,
        uint256 randomNumber
    );

    event RandomnessRequested(uint256 indexed timestamp, bytes32 requestId);

    event RandomnessSucceeded(
        uint256 indexed timestamp,
        bytes32 requestId,
        uint256 randomNumber
    );

    event RevealedBaseURIUpdated(string revealedBaseURI);

    function requestChainlinkVRF() external;

    function setDefaultURI(string memory defaultURI) external;

    function setRevealedBaseURI(string memory revealedBaseURI) external;

    function setSeed(uint256 seed) external;

    function isRevealed() external view returns (bool);
}
