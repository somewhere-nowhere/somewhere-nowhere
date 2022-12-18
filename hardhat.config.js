require('@nomiclabs/hardhat-waffle')
require('hardhat-gas-reporter')

const {
  INFURA_API_KEY,
  DEPLOYER_PRIVATE_KEY,
  SIGNER_PRIVATE_KEY,
} = require('./secret.json')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  etherscan: {
    apiKey: 'ISHX7J4EFPR56KRY34YEQ752GDGZF264N6',
  },
  networks: {
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [DEPLOYER_PRIVATE_KEY, SIGNER_PRIVATE_KEY],
      registryAddress: '0x000000000000AAeB6D7670E522A718067333cd4E',
      registrySubscriptionAddress: '0x3cc6CddA760b79bAfa08dF41ECFA224f810dCeB6',
      linkAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      wrapperAddress: '0x5A861794B927983406fCE1D062e00b9368d97Df6',
      safeAddress: '',
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [DEPLOYER_PRIVATE_KEY, SIGNER_PRIVATE_KEY],
      registryAddress: '0x000000000000AAeB6D7670E522A718067333cd4E',
      registrySubscriptionAddress: '0x3cc6CddA760b79bAfa08dF41ECFA224f810dCeB6',
      linkAddress: '0x326C977E6efc84E512bB9C30f76E30c160eD06FB',
      wrapperAddress: '0x708701a1DfF4f478de54383E49a627eD4852C816',
      safeAddress: '',
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [DEPLOYER_PRIVATE_KEY, SIGNER_PRIVATE_KEY],
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      accounts: [
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        SIGNER_PRIVATE_KEY,
      ],
    },
  },
  solidity: '0.8.4',
}
