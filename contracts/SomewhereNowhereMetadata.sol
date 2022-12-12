// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import '@openzeppelin/contracts/utils/Strings.sol';
import './interfaces/ISomewhereNowhereMetadata.sol';
import './lib/Revealable.sol';
import './SomewhereNowhere.sol';

contract SomewhereNowhereMetadata is ISomewhereNowhereMetadata, Revealable {
    using Strings for uint256;

    address private _tokenContractAddress;

    constructor(
        address tokenContractAddress,
        address coordinatorAddress,
        address linkTokenAddress,
        bytes32 keyHash,
        string memory defaultURI
    ) Revealable(coordinatorAddress, linkTokenAddress, keyHash) {
        setControllerAddress(getOwnerAddress());

        setTokenContractAddress(tokenContractAddress);
        setDefaultURI(defaultURI);
    }

    function setTokenContractAddress(address tokenContractAddress)
        public
        override
        onlyController
    {
        _tokenContractAddress = tokenContractAddress;

        emit TokenContractAddressUpdated(tokenContractAddress);
    }

    function getTokenContractAddress() public view override returns (address) {
        return _tokenContractAddress;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        if (_tokenContractAddress == address(0))
            revert TokenContractAddressIsZeroAddress();

        return
            isRevealed()
                ? string(
                    abi.encodePacked(
                        _getRevealedBaseURI(),
                        _getShuffledId(
                            SomewhereNowhere(_tokenContractAddress)
                                .getGlobalSupply(),
                            tokenId
                        ).toString(),
                        '.json'
                    )
                )
                : _getDefaultURI();
    }
}
