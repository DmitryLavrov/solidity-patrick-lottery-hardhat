import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'

export interface NetworkConfigItem {
  ethUsdPriceFeed?: string
  name: string
  blockConfirmations?: number
  vrfCoordinatorV2?: string
  entranceFee?: BigNumber
  gasLane?: string
  subscriptionId?: string
  callbackGasLimit?: string
  interval?: string
}

export interface NetworkConfig {
  [key: number]: NetworkConfigItem
}

const networkConfig: NetworkConfig = {
  4: {
    name: 'rinkeby',
    blockConfirmations: 6,
    vrfCoordinatorV2: '0x6168499c0cFfCaCD319c818142124B7A15E857ab', // https://docs.chain.link/docs/vrf-contracts/#rinkeby-testnet
    entranceFee: ethers.utils.parseEther('0.01'),
    gasLane: '0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc',
    subscriptionId: '6741', // https://vrf.chain.link/rinkeby/6741
    callbackGasLimit: '500000',
    interval: '30' // seconds
  },
  31337: {
    name: 'hardhat',
    blockConfirmations: 1,
    entranceFee: ethers.utils.parseEther('0.01'),
    gasLane: '0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc', // doesn't any matter
    callbackGasLimit: '500000',
    interval: '30' // seconds
  },
  1337: {
    name: 'ganache'
  }
}

const developmentChains = ['hardhat', 'localhost', 'ganache']
const frontEndContractsFile = "../solidity-patrick-lottery-nextjs/constants/contractAddresses.json"
const frontEndAbiFile = "../solidity-patrick-lottery-nextjs/constants/abi.json"

export {
  networkConfig,
  developmentChains,
  frontEndContractsFile,
  frontEndAbiFile
}
