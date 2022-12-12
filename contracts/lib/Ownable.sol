// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import '@openzeppelin/contracts/utils/Context.sol';
import './interfaces/IOwnable.sol';

abstract contract Ownable is Context, IOwnable {
    address private _ownerAddress;

    constructor() {
        _transferOwnership(_msgSender());
    }

    modifier onlyOwner() virtual {
        if (_msgSender() != getOwnerAddress()) revert SenderIsNotOwner();
        _;
    }

    function renounceOwnership() public virtual override onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address ownerAddress)
        public
        virtual
        override
        onlyOwner
    {
        if (ownerAddress == address(0)) revert RecipientAddressIsZeroAddress();

        _transferOwnership(ownerAddress);
    }

    function getOwnerAddress() public view virtual override returns (address) {
        return _ownerAddress;
    }

    function _transferOwnership(address ownerAddress) internal virtual {
        _ownerAddress = ownerAddress;

        emit OwnerAddressUpdated(ownerAddress);
    }
}
