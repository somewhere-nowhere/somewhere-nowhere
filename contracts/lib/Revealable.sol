// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import '@chainlink/contracts/src/v0.8/VRFConsumerBase.sol';
import './interfaces/IRevealable.sol';
import './Roles.sol';

abstract contract Revealable is IRevealable, Roles, VRFConsumerBase {
    bytes32 private _keyHash;
    uint256 private _seed;

    string private _defaultURI;
    string private _revealedBaseURI;

    constructor(
        address coordinatorAddress,
        address linkTokenAddress,
        bytes32 keyHash
    ) VRFConsumerBase(coordinatorAddress, linkTokenAddress) {
        _keyHash = keyHash;
    }

    function requestChainlinkVRF() external virtual override onlyController {
        if (LINK.balanceOf(address(this)) < 2000000000000000000)
            revert LinkBalanceIsInsufficient();

        bytes32 requestId = requestRandomness(_keyHash, 2000000000000000000);

        emit RandomnessRequested(block.timestamp, requestId);
    }

    function setDefaultURI(string memory defaultURI)
        public
        virtual
        override
        onlyController
    {
        _defaultURI = defaultURI;

        emit DefaultURIUpdated(defaultURI);
    }

    function setRevealedBaseURI(string memory revealedBaseURI)
        public
        virtual
        override
        onlyController
    {
        _revealedBaseURI = revealedBaseURI;

        emit RevealedBaseURIUpdated(revealedBaseURI);
    }

    function setSeed(uint256 seed) public virtual override onlyController {
        if (_seed > 0) revert SeedIsAlreadySet();

        _setSeed(seed);
    }

    function isRevealed() public view virtual override returns (bool) {
        return _seed > 0;
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomNumber)
        internal
        virtual
        override
    {
        if (randomNumber > 0) {
            emit RandomnessSucceeded(block.timestamp, requestId, randomNumber);

            _setSeed(randomNumber);
        } else {
            emit RandomnessFailed(block.timestamp, requestId, randomNumber);
        }
    }

    function _setSeed(uint256 seed) internal virtual {
        _seed = seed;

        emit SeedUpdated(seed);
    }

    function _getDefaultURI() internal view virtual returns (string memory) {
        return _defaultURI;
    }

    function _getRevealedBaseURI()
        internal
        view
        virtual
        returns (string memory)
    {
        return _revealedBaseURI;
    }

    function _getShuffledId(uint256 supply, uint256 tokenId)
        internal
        view
        virtual
        returns (uint256)
    {
        uint256[] memory data = new uint256[](supply + 1);
        data[0] = supply;
        for (uint256 i = 1; i <= supply; ++i) {
            data[i] = i;
        }
        for (uint256 i = 1; i <= supply; ++i) {
            uint256 j = i +
                (uint256(keccak256(abi.encode(_seed, i))) % data[0]);
            (data[i], data[j]) = (data[j], data[i]);
            --data[0];
        }
        return data[tokenId];
    }
}
