require('@nomiclabs/hardhat-etherscan')
require('@nomiclabs/hardhat-waffle')
require('hardhat-gas-reporter')

const {
  ALCHEMY_API_KEY,
  ALCHEMY_API_KEY_GOERLI,
  ETHERSCAN_API_KEY,
  INFURA_API_KEY,
  DEPLOYER_PRIVATE_KEY,
  SIGNER_PRIVATE_KEY,
  SAFE_ADDRESS_MAINNET,
  SAFE_ADDRESS_GOERLI,
  DEPLOYER_PRIVATE_KEY_LOCALHOST,
  MAX_FEE,
  MAX_PRIORITY_FEE,
} = require('./secret.json')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  networks: {
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [DEPLOYER_PRIVATE_KEY, SIGNER_PRIVATE_KEY],
      registryAddress: '0x000000000000AAeB6D7670E522A718067333cd4E',
      registrySubscriptionAddress: '0x3cc6CddA760b79bAfa08dF41ECFA224f810dCeB6',
      linkAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      wrapperAddress: '0x5A861794B927983406fCE1D062e00b9368d97Df6',
      safeAddress: SAFE_ADDRESS_MAINNET,
      maxFee: MAX_FEE,
      maxPriorityFee: MAX_PRIORITY_FEE,
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY_GOERLI}`,
      accounts: [DEPLOYER_PRIVATE_KEY, SIGNER_PRIVATE_KEY],
      registryAddress: '0x000000000000AAeB6D7670E522A718067333cd4E',
      registrySubscriptionAddress: '0x3cc6CddA760b79bAfa08dF41ECFA224f810dCeB6',
      linkAddress: '0x326C977E6efc84E512bB9C30f76E30c160eD06FB',
      wrapperAddress: '0x708701a1DfF4f478de54383E49a627eD4852C816',
      safeAddress: SAFE_ADDRESS_GOERLI,
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [DEPLOYER_PRIVATE_KEY, SIGNER_PRIVATE_KEY],
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      accounts: [DEPLOYER_PRIVATE_KEY_LOCALHOST, SIGNER_PRIVATE_KEY],
    },
  },
  solidity: '0.8.4',
}
