import {HardhatUserConfig} from 'hardhat/config'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-gas-reporter'
import 'solidity-coverage'
import 'hardhat-deploy'
import 'dotenv/config'

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL || ''
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY || ''
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ''
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ''
const REPORT_GAS = process.env.REPORT_GAS === 'true' ?? false

const config: HardhatUserConfig = {
  solidity: '0.8.7',
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 31337,
    },
    rinkeby: {
      url: RINKEBY_RPC_URL,
      accounts: [RINKEBY_PRIVATE_KEY],
      chainId: 4,
    },
    localhost: {
      url: 'http://127.0.0.1:8545/',
      // accounts: It's Hardhat!
      chainId: 31337
    }
  },
  gasReporter: {
    enabled: REPORT_GAS,
    currency: 'USD',
    // outputFile: "gas-report.txt",
    // noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY
    // token: 'MATIC', // Use gasPriceApi for Polygon
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
    player: {
      default: 1
    }
  },
  mocha: {
    timeout: 600000 // Timeout for test complete
  }
}

export default config
