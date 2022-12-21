const { ethers, network } = require('hardhat')

const {
  PAYEES,
  SHARES,
  DEFAULT_URI,
  PRIVATE_SALE_ID,
  PUBLIC_SALE_ID,
  TEST_ADDRESS,
} = require('../secret.json')

const REGISTRY_ADDRESS = network.config.registryAddress
const REGISTRY_SUBSCRIPTION_ADDRESS = network.config.registrySubscriptionAddress
const LINK_ADDRESS = network.config.linkAddress
const WRAPPER_ADDRESS = network.config.wrapperAddress
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const MAX_UINT32 = '4294967295'

const MAX_FEE = '40'
const MAX_PRIORITY_FEE = '4'

let tokenContract
let metadataContract
let paymentSplitterContract

async function main() {
  ;[deployer, signer] = await ethers.getSigners()

  console.log('Deployer:', deployer.address)

  console.log('Deployer balance:', (await deployer.getBalance()).toString())

  const network = await ethers.provider.getNetwork()
  console.log('Chain ID:', network.chainId)

  const paymentSplitterContractFactory = await ethers.getContractFactory(
    'SomewhereNowherePaymentSplitter'
  )
  paymentSplitterContract = await paymentSplitterContractFactory.deploy(
    PAYEES,
    SHARES,
    {
      maxFeePerGas: ethers.utils.parseUnits(MAX_FEE, 'gwei'),
      maxPriorityFeePerGas: ethers.utils.parseUnits(MAX_PRIORITY_FEE, 'gwei'),
    }
  )
  await paymentSplitterContract.deployed()
  console.log('Payment splitter contract: deployed')

  const tokenContractFactory = await ethers.getContractFactory(
    'SomewhereNowhere'
  )
  tokenContract = await tokenContractFactory.deploy(
    paymentSplitterContract.address,
    REGISTRY_ADDRESS ?? ZERO_ADDRESS,
    REGISTRY_SUBSCRIPTION_ADDRESS ?? ZERO_ADDRESS,
    signer.address,
    {
      maxFeePerGas: ethers.utils.parseUnits(MAX_FEE, 'gwei'),
      maxPriorityFeePerGas: ethers.utils.parseUnits(MAX_PRIORITY_FEE, 'gwei'),
    }
  )
  await tokenContract.deployed()
  console.log('Token contract: deployed')

  const metadataContractFactory = await ethers.getContractFactory(
    'SomewhereNowhereMetadataV1'
  )
  metadataContract = await metadataContractFactory.deploy(
    tokenContract.address,
    LINK_ADDRESS ?? ZERO_ADDRESS,
    WRAPPER_ADDRESS ?? ZERO_ADDRESS,
    DEFAULT_URI,
    {
      maxFeePerGas: ethers.utils.parseUnits(MAX_FEE, 'gwei'),
      maxPriorityFeePerGas: ethers.utils.parseUnits(MAX_PRIORITY_FEE, 'gwei'),
    }
  )
  await metadataContract.deployed()
  console.log('Metadata contract: deployed')

  await tokenContract.setMetadataContractAddress(metadataContract.address, {
    maxFeePerGas: ethers.utils.parseUnits(MAX_FEE, 'gwei'),
    maxPriorityFeePerGas: ethers.utils.parseUnits(MAX_PRIORITY_FEE, 'gwei'),
  })
  console.log('Token contract: metadata contract updated')

  if (network.chainId === 1) {
    /**
     * Mainnet
     */

    await tokenContract.addSale(
      PRIVATE_SALE_ID,
      3200,
      2,
      2,
      16234732,
      16249135,
      {
        maxFeePerGas: ethers.utils.parseUnits(MAX_FEE, 'gwei'),
        maxPriorityFeePerGas: ethers.utils.parseUnits(MAX_PRIORITY_FEE, 'gwei'),
      }
    )
    console.log('Token contract: private sale added')

    await tokenContract.addSale(
      PUBLIC_SALE_ID,
      3200,
      2,
      2,
      16249135,
      MAX_UINT32,
      {
        maxFeePerGas: ethers.utils.parseUnits(MAX_FEE, 'gwei'),
        maxPriorityFeePerGas: ethers.utils.parseUnits(MAX_PRIORITY_FEE, 'gwei'),
      }
    )
    console.log('Token contract: public sale added')
  } else if (network.chainId === 5) {
    /**
     * Goerli
     */

    await tokenContract.addSale(PRIVATE_SALE_ID, 3200, 2, 2, 8175015, 8171015, {
      maxFeePerGas: ethers.utils.parseUnits(MAX_FEE, 'gwei'),
      maxPriorityFeePerGas: ethers.utils.parseUnits(MAX_PRIORITY_FEE, 'gwei'),
    })
    console.log('Token contract: private sale added')

    await tokenContract.addSale(
      PUBLIC_SALE_ID,
      3200,
      2,
      2,
      8171015,
      MAX_UINT32,
      {
        maxFeePerGas: ethers.utils.parseUnits(MAX_FEE, 'gwei'),
        maxPriorityFeePerGas: ethers.utils.parseUnits(MAX_PRIORITY_FEE, 'gwei'),
      }
    )
    console.log('Token contract: public sale added')
  } else if (network.chainId === 11155111) {
    /**
     * Sepolia
     */
  } else if (network.chainId === 31337) {
    /**
     * Localhost
     */

    await deployer.sendTransaction({
      to: TEST_ADDRESS,
      value: ethers.utils.parseEther('1'),
    })
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
