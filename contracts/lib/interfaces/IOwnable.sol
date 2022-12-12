// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

interface IOwnable {
    error RecipientAddressIsZeroAddress();

    error SenderIsNotOwner();

    event OwnerAddressUpdated(address indexed ownerAddress);

    function renounceOwnership() external;

    function transferOwnership(address newOwnerAddress) external;

    function getOwnerAddress() external view returns (address);
}
