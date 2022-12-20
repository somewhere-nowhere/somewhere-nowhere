const { ethers, network } = require('hardhat')

const {
  PAYEES,
  SHARES,
  DEFAULT_URI,
  PRIVATE_SALE_ID,
  // PUBLIC_SALE_ID,
  TEST_ADDRESS,
} = require('../secret.json')

const REGISTRY_ADDRESS = network.config.registryAddress
const REGISTRY_SUBSCRIPTION_ADDRESS = network.config.registrySubscriptionAddress
const LINK_ADDRESS = network.config.linkAddress
const WRAPPER_ADDRESS = network.config.wrapperAddress
const SAFE_ADDRESS = network.config.safeAddress
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const MAX_UINT32 = '4294967295'

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
    SHARES
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
    signer.address
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
    DEFAULT_URI
  )
  await metadataContract.deployed()
  console.log('Metadata contract: deployed')

  await tokenContract.setMetadataContractAddress(metadataContract.address)
  console.log('Token contract: metadata contract updated')

  if (SAFE_ADDRESS) {
    await tokenContract.setControllerAddress(SAFE_ADDRESS)
    console.log('Token contract: controller updated')
    await tokenContract.transferOwnership(SAFE_ADDRESS)
    console.log('Token contract: owner updated')

    await metadataContract.setControllerAddress(SAFE_ADDRESS)
    console.log('Metadata contract: controller updated')
    await metadataContract.transferOwnership(SAFE_ADDRESS)
    console.log('Metadata contract: owner updated')
  } else {
    if (network.chainId === 31337) {
      await deployer.sendTransaction({
        to: TEST_ADDRESS,
        value: ethers.utils.parseEther('1'),
      })
    }

    await tokenContract.addSale(PRIVATE_SALE_ID, 3200, 2, 2, 0, MAX_UINT32)
    console.log('Token contract: private sale added')

    // await tokenContract.addSale(PUBLIC_SALE_ID, 3200, 2, 2, 0, MAX_UINT32)
    // console.log('Token contract: public sale added', PUBLIC_SALE_ID)

    // await metadataContract.setSeed(1)
    // console.log('Metadata contract: seed updated')
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
