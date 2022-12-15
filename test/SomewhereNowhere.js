const { expect } = require('chai')

describe('SomewhereNowhere', function () {
  const MAX_UINT32 = '4294967295'
  const MAX_UINT64 = '184467440737095551615'
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
  const ZERO_UINT256 =
    '0x0000000000000000000000000000000000000000000000000000000000000000'
  const GLOBAL_SUPPLY = 3333
  const RESERVE_SUPPLY = 133
  const SALE_ID = 1000
  const SALE_SUPPLY = 8
  const WALLET_SUPPLY = 4
  const TRANSACTION_SUPPLY = 2
  const SMALL_QUANTITY = TRANSACTION_SUPPLY
  const DEFAULT_URI = 'DEFAULT_URI'
  const REVEALED_BASE_URI = 'REVEALED_BASE_URI'

  let owner
  let creator
  let registry
  let signer
  let customer

  let contract
  let metadataContract

  let domain
  let types
  let values
  let signature

  beforeEach(async () => {
    ;[owner, creator, registry, signer, customer] = await ethers.getSigners()

    const factory = await ethers.getContractFactory('SomewhereNowhere')
    const metadataFactory = await ethers.getContractFactory(
      'SomewhereNowhereMetadata'
    )
    contract = await factory.deploy(
      owner.address,
      creator.address,
      registry.address,
      ZERO_ADDRESS,
      signer.address
    )
    await contract.deployed()
    metadataContract = await metadataFactory.deploy(
      owner.address,
      contract.address,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      ZERO_UINT256,
      DEFAULT_URI
    )
    await metadataContract.deployed()
    await contract.setMetadataContractAddress(metadataContract.address)
    await metadataContract.setRevealedBaseURI(REVEALED_BASE_URI)

    const network = await ethers.provider.getNetwork()
    domain = {
      name: 'Somewhere Nowhere',
      version: '1',
      chainId: network.chainId,
      verifyingContract: contract.address,
    }
    types = {
      SaleWallet: [
        { name: 'saleId', type: 'uint256' },
        { name: 'wallet', type: 'address' },
      ],
    }
    values = {
      saleId: SALE_ID,
      wallet: owner.address,
    }
    signature = await signer._signTypedData(domain, types, values)
  })

  describe('getControllerAddress', () => {
    it('should be owner address', async () => {
      expect(await contract.getControllerAddress()).to.equal(owner.address)
    })

    it('should be owner address', async () => {
      expect(await metadataContract.getControllerAddress()).to.equal(
        owner.address
      )
    })
  })

  describe('getGlobalSupply', () => {
    it('should be 3333', async () => {
      expect(await contract.getGlobalSupply()).to.equal(GLOBAL_SUPPLY)
    })
  })

  describe('getMetadataContractAddress', () => {
    it('should be metadata contract address', async () => {
      expect(await contract.getMetadataContractAddress()).to.equal(
        metadataContract.address
      )
    })
  })

  describe('getOperatorFilterRegistryAddress', () => {
    it('should be operator filter registry address', async () => {
      expect(await contract.getOperatorFilterRegistryAddress()).to.equal(
        registry.address
      )
    })
  })

  describe('getOwnerAddress', () => {
    it('should be owner address', async () => {
      expect(await contract.getOwnerAddress()).to.equal(owner.address)
    })

    it('should be owner address', async () => {
      expect(await metadataContract.getOwnerAddress()).to.equal(owner.address)
    })
  })

  describe('getReserveSupply', () => {
    it('should be 133', async () => {
      expect(await contract.getReserveSupply()).to.equal(RESERVE_SUPPLY)
    })
  })

  describe('getSigningAddress', () => {
    it('should be signing address', async () => {
      expect(await contract.getSigningAddress()).to.equal(signer.address)
    })
  })

  describe('getStatus', () => {
    it('should be empty sale', async () => {
      const status = await contract.getStatus(SALE_ID, owner.getAddress())
      expect(status.globalSupply).to.equal(GLOBAL_SUPPLY)
      expect(status.globalMinted).to.equal(0)
      expect(status.reserveSupply).to.equal(RESERVE_SUPPLY)
      expect(status.reserveMinted).to.equal(0)
      expect(status.saleSupply).to.equal(0)
      expect(status.saleMinted).to.equal(0)
      expect(status.walletSupply).to.equal(0)
      expect(status.walletMinted).to.equal(0)
      expect(status.transactionSupply).to.equal(0)
      expect(status.beginBlock).to.equal(0)
      expect(status.endBlock).to.equal(0)
      expect(status.isActive).to.equal(false)
    })
  })

  describe('getTokenContractAddress', () => {
    it('should be token contract address', async () => {
      expect(await metadataContract.getTokenContractAddress()).to.equal(
        contract.address
      )
    })
  })

  describe('isPaused', () => {
    it('should not be paused', async () => {
      expect(await contract.isPaused()).to.equal(false)
    })
  })

  describe('isRevealed', () => {
    it('should not be revealed', async () => {
      expect(await metadataContract.isRevealed()).to.equal(false)
    })
  })

  describe('name', () => {
    it("should be 'Somewhere Nowhere'", async () => {
      expect(await contract.name()).to.equal('Somewhere Nowhere')
    })
  })

  describe('royaltyInfo', () => {
    it('should be creator address and 5%', async () => {
      const [address, fee] = await contract.royaltyInfo(
        1,
        ethers.utils.parseEther('1')
      )
      expect(address).to.equal(creator.address)
      expect(fee).to.equal(ethers.utils.parseEther('0.05'))
    })
  })

  describe('supportsInterface', () => {
    it('should support ERC165', async () => {
      expect(await contract.supportsInterface('0x01ffc9a7')).to.equal(true)
    })

    it('should support ERC721', async () => {
      expect(await contract.supportsInterface('0x80ac58cd')).to.equal(true)
    })

    it('should support ERC721Metadata', async () => {
      expect(await contract.supportsInterface('0x5b5e139f')).to.equal(true)
    })

    it('should support ERC2981', async () => {
      expect(await contract.supportsInterface('0x2a55205a')).to.equal(true)
    })
  })

  describe('symbol', () => {
    it("should be 'HOOMAN'", async () => {
      expect(await contract.symbol()).to.equal('HOOMAN')
    })
  })

  describe('tokenURI', () => {
    beforeEach(async () => {
      await contract.mintReserve([owner.address], 1)
    })

    it('should be metadata contract token URI', async () => {
      const actual = await contract.tokenURI(1)
      const expected = await metadataContract.tokenURI(1)
      expect(actual).to.equal(expected)
    })

    it('should be metadata contract token URI', async () => {
      await metadataContract.setSeed(1)
      const actual = await contract.tokenURI(1)
      const expected = await metadataContract.tokenURI(1)
      expect(actual).to.equal(expected)
    })

    it('should be reverted because token does not exist', async () => {
      await expect(contract.tokenURI(2)).to.be.revertedWith(
        'TokenDoesNotExist()'
      )
    })

    it('should be reverted because metadata contract address is zero address', async () => {
      await contract.setMetadataContractAddress(ZERO_ADDRESS)
      await expect(contract.tokenURI(1)).to.be.revertedWith(
        'MetadataContractAddressIsZeroAddress()'
      )
    })

    it('should be reverted because token contract address is zero address', async () => {
      await metadataContract.setTokenContractAddress(ZERO_ADDRESS)
      await expect(metadataContract.tokenURI(1)).to.be.revertedWith(
        'TokenContractAddressIsZeroAddress()'
      )
    })
  })

  describe('addSale', () => {
    it('should add sale', async () => {
      await contract.addSale(
        SALE_ID,
        SALE_SUPPLY,
        WALLET_SUPPLY,
        TRANSACTION_SUPPLY,
        0,
        MAX_UINT32
      )
      const status = await contract.getStatus(SALE_ID, owner.getAddress())
      expect(status.globalSupply).to.equal(GLOBAL_SUPPLY)
      expect(status.globalMinted).to.equal(0)
      expect(status.reserveSupply).to.equal(RESERVE_SUPPLY)
      expect(status.reserveMinted).to.equal(0)
      expect(status.saleSupply).to.equal(SALE_SUPPLY)
      expect(status.saleMinted).to.equal(0)
      expect(status.walletSupply).to.equal(WALLET_SUPPLY)
      expect(status.walletMinted).to.equal(0)
      expect(status.transactionSupply).to.equal(TRANSACTION_SUPPLY)
      expect(status.beginBlock).to.equal(0)
      expect(status.endBlock).to.equal(MAX_UINT32)
      expect(status.isActive).to.equal(true)
    })

    it('should be reverted because sender is not controller', async () => {
      await expect(
        contract
          .connect(customer)
          .addSale(
            SALE_ID,
            SALE_SUPPLY,
            WALLET_SUPPLY,
            TRANSACTION_SUPPLY,
            0,
            MAX_UINT32
          )
      ).to.be.revertedWith('SenderIsNotController()')
    })
  })

  describe('mintHooman', () => {
    beforeEach(async () => {
      await contract.addSale(
        SALE_ID,
        SALE_SUPPLY,
        WALLET_SUPPLY,
        TRANSACTION_SUPPLY,
        0,
        MAX_UINT32
      )
    })

    it('should mint one token', async () => {
      await contract.mintHooman(1, SALE_ID, signature)
      expect(await contract.balanceOf(owner.address)).to.equal(1)
      const status = await contract.getStatus(SALE_ID, owner.getAddress())
      expect(status.globalSupply).to.equal(GLOBAL_SUPPLY)
      expect(status.globalMinted).to.equal(1)
      expect(status.reserveSupply).to.equal(RESERVE_SUPPLY)
      expect(status.reserveMinted).to.equal(0)
      expect(status.saleSupply).to.equal(SALE_SUPPLY)
      expect(status.saleMinted).to.equal(1)
      expect(status.walletSupply).to.equal(WALLET_SUPPLY)
      expect(status.walletMinted).to.equal(1)
      expect(status.transactionSupply).to.equal(TRANSACTION_SUPPLY)
      expect(status.beginBlock).to.equal(0)
      expect(status.endBlock).to.equal(MAX_UINT32)
      expect(status.isActive).to.equal(true)
    })

    it('should mint more than one token', async () => {
      await contract.mintHooman(SMALL_QUANTITY, SALE_ID, signature)
      expect(await contract.balanceOf(owner.address)).to.equal(SMALL_QUANTITY)
      const status = await contract.getStatus(SALE_ID, owner.getAddress())
      expect(status.globalSupply).to.equal(GLOBAL_SUPPLY)
      expect(status.globalMinted).to.equal(SMALL_QUANTITY)
      expect(status.reserveSupply).to.equal(RESERVE_SUPPLY)
      expect(status.reserveMinted).to.equal(0)
      expect(status.saleSupply).to.equal(SALE_SUPPLY)
      expect(status.saleMinted).to.equal(SMALL_QUANTITY)
      expect(status.walletSupply).to.equal(WALLET_SUPPLY)
      expect(status.walletMinted).to.equal(SMALL_QUANTITY)
      expect(status.transactionSupply).to.equal(TRANSACTION_SUPPLY)
      expect(status.beginBlock).to.equal(0)
      expect(status.endBlock).to.equal(MAX_UINT32)
      expect(status.isActive).to.equal(true)
    })

    it('should be reverted because function is not payable', async () => {
      await expect(
        contract.mintHooman(1, SALE_ID, signature, {
          value: ethers.utils.parseEther('1'),
        })
      ).to.be.reverted
    })

    it('should be reverted because signature is not valid', async () => {
      const badSignature = owner._signTypedData(domain, types, values)
      await expect(
        contract.mintHooman(1, SALE_ID, badSignature)
      ).to.be.revertedWith('SignatureIsNotValid()')
    })

    it('should be reverted because signature is not valid', async () => {
      await expect(
        contract.connect(customer).mintHooman(1, SALE_ID, signature)
      ).to.be.revertedWith('SignatureIsNotValid()')
    })

    it('should be reverted because sale is paused', async () => {
      await contract.pause()
      await expect(
        contract.mintHooman(1, SALE_ID, signature)
      ).to.be.revertedWith('SaleIsPaused()')
    })

    it('should be reverted because sale has not begun', async () => {
      await contract.addSale(SALE_ID, 1, 1, 1, MAX_UINT32, MAX_UINT32)
      await expect(
        contract.mintHooman(1, SALE_ID, signature)
      ).to.be.revertedWith('SaleHasNotBegun()')
    })

    it('should be reverted because sale has ended', async () => {
      await contract.addSale(SALE_ID, 1, 1, 1, 0, 0)
      await expect(
        contract.mintHooman(1, SALE_ID, signature)
      ).to.be.revertedWith('SaleHasEnded()')
    })

    it('should be reverted because mint exceeds transaction supply', async () => {
      await contract.addSale(
        SALE_ID,
        SMALL_QUANTITY,
        SMALL_QUANTITY,
        1,
        0,
        MAX_UINT32
      )
      await expect(
        contract.mintHooman(SMALL_QUANTITY, SALE_ID, signature)
      ).to.be.revertedWith('MintExceedsTransactionSupply()')
    })

    it('should be reverted because mint exceeds wallet supply', async () => {
      await contract.addSale(
        SALE_ID,
        SMALL_QUANTITY,
        1,
        SMALL_QUANTITY,
        0,
        MAX_UINT32
      )
      await expect(
        contract.mintHooman(SMALL_QUANTITY, SALE_ID, signature)
      ).to.be.revertedWith('MintExceedsWalletSupply()')
    })

    it('should be reverted because mint exceeds sale supply', async () => {
      await contract.addSale(
        SALE_ID,
        1,
        SMALL_QUANTITY,
        SMALL_QUANTITY,
        0,
        MAX_UINT32
      )
      await expect(
        contract.mintHooman(SMALL_QUANTITY, SALE_ID, signature)
      ).to.be.revertedWith('MintExceedsSaleSupply()')
    })

    it('should be reverted because mint exceeds global supply', async () => {
      await contract.addSale(
        SALE_ID,
        MAX_UINT64,
        MAX_UINT64,
        MAX_UINT64,
        0,
        MAX_UINT32
      )
      await expect(
        contract.mintHooman(
          GLOBAL_SUPPLY - RESERVE_SUPPLY + 1,
          SALE_ID,
          signature
        )
      ).to.be.revertedWith('MintExceedsGlobalSupply()')
    })
  })

  describe('mintReserve', () => {
    it('should mint one token', async () => {
      await contract.mintReserve([owner.address], 1)
      expect(await contract.balanceOf(owner.address)).to.equal(1)
      const status = await contract.getStatus(SALE_ID, owner.getAddress())
      expect(status.globalSupply).to.equal(GLOBAL_SUPPLY)
      expect(status.globalMinted).to.equal(1)
      expect(status.reserveSupply).to.equal(RESERVE_SUPPLY)
      expect(status.reserveMinted).to.equal(1)
      expect(status.saleSupply).to.equal(0)
      expect(status.saleMinted).to.equal(0)
      expect(status.walletSupply).to.equal(0)
      expect(status.walletMinted).to.equal(0)
      expect(status.transactionSupply).to.equal(0)
      expect(status.beginBlock).to.equal(0)
      expect(status.endBlock).to.equal(0)
      expect(status.isActive).to.equal(false)
    })

    it('should mint more than one token', async () => {
      await contract.mintReserve([owner.address], SMALL_QUANTITY)
      expect(await contract.balanceOf(owner.address)).to.equal(SMALL_QUANTITY)
      const status = await contract.getStatus(SALE_ID, owner.getAddress())
      expect(status.globalSupply).to.equal(GLOBAL_SUPPLY)
      expect(status.globalMinted).to.equal(SMALL_QUANTITY)
      expect(status.reserveSupply).to.equal(RESERVE_SUPPLY)
      expect(status.reserveMinted).to.equal(SMALL_QUANTITY)
      expect(status.saleSupply).to.equal(0)
      expect(status.saleMinted).to.equal(0)
      expect(status.walletSupply).to.equal(0)
      expect(status.walletMinted).to.equal(0)
      expect(status.transactionSupply).to.equal(0)
      expect(status.beginBlock).to.equal(0)
      expect(status.endBlock).to.equal(0)
      expect(status.isActive).to.equal(false)
    })

    it('should be reverted because sender is not controller', async () => {
      await expect(
        contract.connect(customer).mintReserve([customer.address], 1)
      ).to.be.revertedWith('SenderIsNotController()')
    })

    it('should be reverted because mint exceeds reserve supply', async () => {
      await expect(
        contract.mintReserve([owner.address], RESERVE_SUPPLY + 1)
      ).to.be.revertedWith('MintExceedsReserveSupply()')
    })
  })

  describe('pause', () => {
    it('should pause', async () => {
      await contract.pause()
      expect(await contract.isPaused()).to.equal(true)
    })

    it('should be reverted because sender is not controller', async () => {
      await expect(contract.connect(customer).pause()).to.be.revertedWith(
        'SenderIsNotController()'
      )
    })

    it('should be reverted because contract is paused', async () => {
      await contract.pause()
      await expect(contract.pause()).to.be.revertedWith('IsPaused()')
    })
  })

  describe('register', () => {
    it('should be reverted because sender is not controller', async () => {
      await expect(contract.connect(customer).register()).to.be.revertedWith(
        'SenderIsNotController()'
      )
    })

    it('should be reverted because sender is not controller', async () => {
      await contract.setOperatorFilterRegistryAddress(ZERO_ADDRESS)
      await expect(contract.register()).to.be.revertedWith(
        'OperatorFilterRegistryAddressIsZeroAddress()'
      )
    })
  })

  describe('registerAndSubscribe', () => {
    it('should be reverted because sender is not controller', async () => {
      await expect(
        contract.connect(customer).registerAndSubscribe(ZERO_ADDRESS)
      ).to.be.revertedWith('SenderIsNotController()')
    })

    it('should be reverted because sender is not controller', async () => {
      await contract.setOperatorFilterRegistryAddress(ZERO_ADDRESS)
      await expect(
        contract.registerAndSubscribe(ZERO_ADDRESS)
      ).to.be.revertedWith('OperatorFilterRegistryAddressIsZeroAddress()')
    })
  })

  describe('removeSale', () => {
    beforeEach(async () => {
      await contract.addSale(
        SALE_ID,
        SALE_SUPPLY,
        WALLET_SUPPLY,
        TRANSACTION_SUPPLY,
        0,
        MAX_UINT32
      )
    })

    it('should remove sale', async () => {
      await contract.removeSale(SALE_ID)
      const status = await contract.getStatus(SALE_ID, owner.getAddress())
      expect(status.globalSupply).to.equal(GLOBAL_SUPPLY)
      expect(status.globalMinted).to.equal(0)
      expect(status.reserveSupply).to.equal(RESERVE_SUPPLY)
      expect(status.reserveMinted).to.equal(0)
      expect(status.saleSupply).to.equal(0)
      expect(status.saleMinted).to.equal(0)
      expect(status.walletSupply).to.equal(0)
      expect(status.walletMinted).to.equal(0)
      expect(status.transactionSupply).to.equal(0)
      expect(status.beginBlock).to.equal(0)
      expect(status.endBlock).to.equal(0)
      expect(status.isActive).to.equal(false)
    })

    it('should be reverted because sender is not controller', async () => {
      await expect(
        contract.connect(customer).removeSale(SALE_ID)
      ).to.be.revertedWith('SenderIsNotController()')
    })
  })

  describe('renounceOwnership', () => {
    it('should renounce ownership', async () => {
      await contract.renounceOwnership()
      expect(await contract.getOwnerAddress()).to.equal(ZERO_ADDRESS)
    })

    it('should renounce ownership', async () => {
      await metadataContract.renounceOwnership()
      expect(await metadataContract.getOwnerAddress()).to.equal(ZERO_ADDRESS)
    })

    it('should be reverted because sender is not owner', async () => {
      await expect(
        contract.connect(customer).renounceOwnership()
      ).to.be.revertedWith('SenderIsNotOwner()')
    })

    it('should be reverted because sender is not owner', async () => {
      await expect(
        metadataContract.connect(customer).renounceOwnership()
      ).to.be.revertedWith('SenderIsNotOwner()')
    })
  })

  describe('requestChainlinkVRF', () => {
    it('should be reverted because sender is not controller', async () => {
      await expect(
        metadataContract.connect(customer).requestChainlinkVRF()
      ).to.be.revertedWith('SenderIsNotController()')
    })
  })

  describe('setControllerAddress', () => {
    it('should set controller address', async () => {
      await contract.setControllerAddress(ZERO_ADDRESS)
      expect(await contract.getControllerAddress()).to.equal(ZERO_ADDRESS)
    })

    it('should set controller address', async () => {
      await metadataContract.setControllerAddress(ZERO_ADDRESS)
      expect(await metadataContract.getControllerAddress()).to.equal(
        ZERO_ADDRESS
      )
    })

    it('should be reverted because sender is not owner', async () => {
      await expect(
        contract.connect(customer).setControllerAddress(ZERO_ADDRESS)
      ).to.be.revertedWith('SenderIsNotOwner()')
    })

    it('should be reverted because sender is not owner', async () => {
      await expect(
        metadataContract.connect(customer).setControllerAddress(ZERO_ADDRESS)
      ).to.be.revertedWith('SenderIsNotOwner()')
    })
  })

  describe('setCreatorFeeInfo', () => {
    it('should be reverted because sender is not controller', async () => {
      await expect(
        contract.connect(customer).setCreatorFeeInfo(ZERO_ADDRESS, 500)
      ).to.be.revertedWith('SenderIsNotController()')
    })
  })

  describe('setDefaultURI', () => {
    it('should be reverted because sender is not controller', async () => {
      await expect(
        metadataContract.connect(customer).setDefaultURI(DEFAULT_URI)
      ).to.be.revertedWith('SenderIsNotController()')
    })
  })

  describe('setMetadataContract', () => {
    it('should set metadata contract address', async () => {
      await contract.setMetadataContractAddress(ZERO_ADDRESS)
      expect(await contract.getMetadataContractAddress()).to.equal(ZERO_ADDRESS)
    })

    it('should be reverted because sender is not controller', async () => {
      await expect(
        contract.connect(customer).setMetadataContractAddress(ZERO_ADDRESS)
      ).to.be.revertedWith('SenderIsNotController()')
    })
  })

  describe('setOperatorFilterRegistryAddress', () => {
    it('should set operator filter registry address', async () => {
      await contract.setOperatorFilterRegistryAddress(ZERO_ADDRESS)
      expect(await contract.getOperatorFilterRegistryAddress()).to.equal(
        ZERO_ADDRESS
      )
    })

    it('should be reverted because sender is not controller', async () => {
      await expect(
        contract
          .connect(customer)
          .setOperatorFilterRegistryAddress(ZERO_ADDRESS)
      ).to.be.revertedWith('SenderIsNotController()')
    })
  })

  describe('setRevealedBaseURI', () => {
    it('should be reverted because sender is not controller', async () => {
      await expect(
        metadataContract.connect(customer).setRevealedBaseURI(REVEALED_BASE_URI)
      ).to.be.revertedWith('SenderIsNotController()')
    })
  })

  describe('setSeed', () => {
    it('should set seed', async () => {
      await metadataContract.setSeed(1)
      expect(await metadataContract.isRevealed()).to.equal(true)
    })

    it('should be reverted because sender is not controller', async () => {
      await expect(
        metadataContract.connect(customer).setSeed(1)
      ).to.be.revertedWith('SenderIsNotController()')
    })

    it('should be reverted because seed is already set', async () => {
      await metadataContract.setSeed(1)
      await expect(metadataContract.setSeed(1)).to.be.revertedWith(
        'SeedIsAlreadySet()'
      )
    })
  })

  describe('setSigningAddress', () => {
    it('should set signing address', async () => {
      await contract.setSigningAddress(ZERO_ADDRESS)
      expect(await contract.getSigningAddress()).to.equal(ZERO_ADDRESS)
    })

    it('should be reverted because sender is not controller', async () => {
      await expect(
        contract.connect(customer).setSigningAddress(ZERO_ADDRESS)
      ).to.be.revertedWith('SenderIsNotController()')
    })
  })

  describe('setTokenContractAddress', () => {
    it('should set token contract address', async () => {
      await metadataContract.setTokenContractAddress(ZERO_ADDRESS)
      expect(await metadataContract.getTokenContractAddress()).to.equal(
        ZERO_ADDRESS
      )
    })

    it('should be reverted because sender is not controller', async () => {
      await expect(
        metadataContract.connect(customer).setTokenContractAddress(ZERO_ADDRESS)
      ).to.be.revertedWith('SenderIsNotController()')
    })
  })

  describe('subscribe', () => {
    it('should be reverted because sender is not controller', async () => {
      await expect(
        contract.connect(customer).subscribe(ZERO_ADDRESS)
      ).to.be.revertedWith('SenderIsNotController()')
    })

    it('should be reverted because sender is not controller', async () => {
      await contract.setOperatorFilterRegistryAddress(ZERO_ADDRESS)
      await expect(contract.subscribe(ZERO_ADDRESS)).to.be.revertedWith(
        'OperatorFilterRegistryAddressIsZeroAddress()'
      )
    })
  })

  describe('transferOwnership', () => {
    it('should transfer ownership to customer', async () => {
      await contract.transferOwnership(customer.address)
      expect(await contract.getOwnerAddress()).to.equal(customer.address)
    })

    it('should transfer ownership to customer', async () => {
      await metadataContract.transferOwnership(customer.address)
      expect(await metadataContract.getOwnerAddress()).to.equal(
        customer.address
      )
    })

    it('should be reverted because sender is not owner', async () => {
      await expect(
        contract.connect(customer).transferOwnership(customer.address)
      ).to.be.revertedWith('SenderIsNotOwner()')
    })

    it('should be reverted because sender is not owner', async () => {
      await expect(
        metadataContract.connect(customer).transferOwnership(customer.address)
      ).to.be.revertedWith('SenderIsNotOwner()')
    })

    it('should be reverted because recipient address is zero address', async () => {
      await expect(contract.transferOwnership(ZERO_ADDRESS)).to.be.revertedWith(
        'RecipientAddressIsZeroAddress()'
      )
    })

    it('should be reverted because recipient address is zero address', async () => {
      await expect(
        metadataContract.transferOwnership(ZERO_ADDRESS)
      ).to.be.revertedWith('RecipientAddressIsZeroAddress()')
    })
  })

  describe('unpause', () => {
    beforeEach(async () => {
      contract.pause()
    })

    it('should unpause', async () => {
      await contract.unpause()
      expect(await contract.isPaused()).to.equal(false)
    })

    it('should be reverted because sender is not controller', async () => {
      await expect(contract.connect(customer).unpause()).to.be.revertedWith(
        'SenderIsNotController()'
      )
    })

    it('should be reverted because contract is unpaused', async () => {
      await contract.unpause()
      await expect(contract.unpause()).to.be.revertedWith('IsNotPaused()')
    })
  })

  describe('unregister', () => {
    it('should be reverted because sender is not controller', async () => {
      await expect(contract.connect(customer).unregister()).to.be.revertedWith(
        'SenderIsNotController()'
      )
    })

    it('should be reverted because sender is not controller', async () => {
      await contract.setOperatorFilterRegistryAddress(ZERO_ADDRESS)
      await expect(contract.unregister()).to.be.revertedWith(
        'OperatorFilterRegistryAddressIsZeroAddress()'
      )
    })
  })

  describe('unsubscribe', () => {
    it('should be reverted because sender is not controller', async () => {
      await expect(contract.connect(customer).unsubscribe()).to.be.revertedWith(
        'SenderIsNotController()'
      )
    })

    it('should be reverted because sender is not controller', async () => {
      await contract.setOperatorFilterRegistryAddress(ZERO_ADDRESS)
      await expect(contract.unsubscribe()).to.be.revertedWith(
        'OperatorFilterRegistryAddressIsZeroAddress()'
      )
    })
  })

  describe('events', () => {
    it('should emit SaleAdded', async () => {
      await expect(
        contract.addSale(
          SALE_ID,
          SALE_SUPPLY,
          WALLET_SUPPLY,
          TRANSACTION_SUPPLY,
          0,
          MAX_UINT32
        )
      )
        .to.emit(contract, 'SaleAdded')
        .withArgs(
          SALE_ID,
          SALE_SUPPLY,
          WALLET_SUPPLY,
          TRANSACTION_SUPPLY,
          0,
          MAX_UINT32
        )
    })

    it('should emit SaleRemoved', async () => {
      await expect(contract.removeSale(SALE_ID))
        .to.emit(contract, 'SaleRemoved')
        .withArgs(SALE_ID)
    })

    it('should emit ControllerAddressUpdated', async () => {
      await expect(contract.setControllerAddress(ZERO_ADDRESS))
        .to.emit(contract, 'ControllerAddressUpdated')
        .withArgs(ZERO_ADDRESS)
    })

    it('should emit ControllerAddressUpdated', async () => {
      await expect(metadataContract.setControllerAddress(ZERO_ADDRESS))
        .to.emit(metadataContract, 'ControllerAddressUpdated')
        .withArgs(ZERO_ADDRESS)
    })

    it('should emit CreatorFeeInfoUpdated', async () => {
      await expect(contract.setCreatorFeeInfo(creator.address, 500))
        .to.emit(contract, 'CreatorFeeInfoUpdated')
        .withArgs(creator.address, 500)
    })

    it('should emit DefaultURIUpdated', async () => {
      await expect(metadataContract.setDefaultURI(DEFAULT_URI))
        .to.emit(metadataContract, 'DefaultURIUpdated')
        .withArgs(DEFAULT_URI)
    })

    it('should emit MetadataContractAddressUpdated', async () => {
      await expect(contract.setMetadataContractAddress(ZERO_ADDRESS))
        .to.emit(contract, 'MetadataContractAddressUpdated')
        .withArgs(ZERO_ADDRESS)
    })

    it('should emit OperatorFilterRegistryAddressUpdated', async () => {
      await expect(contract.setOperatorFilterRegistryAddress(ZERO_ADDRESS))
        .to.emit(contract, 'OperatorFilterRegistryAddressUpdated')
        .withArgs(ZERO_ADDRESS)
    })

    it('should emit OwnerAddressUpdated', async () => {
      await expect(contract.renounceOwnership())
        .to.emit(contract, 'OwnerAddressUpdated')
        .withArgs(ZERO_ADDRESS)
    })

    it('should emit OwnerAddressUpdated', async () => {
      await expect(metadataContract.renounceOwnership())
        .to.emit(metadataContract, 'OwnerAddressUpdated')
        .withArgs(ZERO_ADDRESS)
    })

    it('should emit OwnerAddressUpdated', async () => {
      await expect(contract.transferOwnership(customer.address))
        .to.emit(contract, 'OwnerAddressUpdated')
        .withArgs(customer.address)
    })

    it('should emit OwnerAddressUpdated', async () => {
      await expect(metadataContract.transferOwnership(customer.address))
        .to.emit(metadataContract, 'OwnerAddressUpdated')
        .withArgs(customer.address)
    })

    it('should emit Paused', async () => {
      await expect(contract.pause())
        .to.emit(contract, 'Paused')
        .withArgs(owner.address)
    })

    it('should emit RevealedBaseURIUpdated', async () => {
      await expect(metadataContract.setRevealedBaseURI(REVEALED_BASE_URI))
        .to.emit(metadataContract, 'RevealedBaseURIUpdated')
        .withArgs(REVEALED_BASE_URI)
    })

    it('should emit SeedUpdated', async () => {
      await expect(metadataContract.setSeed(1))
        .to.emit(metadataContract, 'SeedUpdated')
        .withArgs(1)
    })

    it('should emit SigningAddressUpdated', async () => {
      await expect(contract.setSigningAddress(ZERO_ADDRESS))
        .to.emit(contract, 'SigningAddressUpdated')
        .withArgs(ZERO_ADDRESS)
    })

    it('should emit TokenContractAddressUpdated', async () => {
      await expect(metadataContract.setTokenContractAddress(ZERO_ADDRESS))
        .to.emit(metadataContract, 'TokenContractAddressUpdated')
        .withArgs(ZERO_ADDRESS)
    })

    it('should emit Unpaused', async () => {
      await contract.pause()
      await expect(contract.unpause())
        .to.emit(contract, 'Unpaused')
        .withArgs(owner.address)
    })
  })
})
