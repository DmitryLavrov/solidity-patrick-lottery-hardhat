import {DeployFunction} from 'hardhat-deploy/types'
import {HardhatRuntimeEnvironment} from 'hardhat/types'
import {developmentChains} from '../hardhat-helper.config'
import {network} from 'hardhat'
import {ethers} from 'ethers'

const BASE_FEE = ethers.utils.parseEther('0.25') // Premium 0.25 LINK for Rinkeby // https://docs.chain.link/docs/vrf-contracts/#rinkeby-testnet
const GAS_PRICE_LINK = 1e9 // Calculated (Depends on GAS price)

const deployMocks: DeployFunction = async function ({getNamedAccounts, deployments}: HardhatRuntimeEnvironment) {
  const {deploy, get, log} = deployments
  const {deployer} = await getNamedAccounts()

  if (developmentChains.includes(network.name)) {
    log('Local network detected! Deploying mocks...')
    const args = [BASE_FEE, GAS_PRICE_LINK]
    await deploy('VRFCoordinatorV2Mock', {
      contract: 'VRFCoordinatorV2Mock',
      from: deployer,
      log: true,
      args
    })
    log('Mocks Deployed!')
    log('------------------------------------------------')
  }
}

export default deployMocks
deployMocks.tags = ["all", "mocks"]
