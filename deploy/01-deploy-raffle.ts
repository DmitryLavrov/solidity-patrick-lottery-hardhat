import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers, network } from 'hardhat'
import { developmentChains, networkConfig } from '../hardhat-helper.config'
import { verify } from '../utils/verify'

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther('2')

const deployRaffle: DeployFunction = async function({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) {
  const { deploy, get, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId || 31337
  let vrfCoordinatorV2Address, subscriptionId

  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock')
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
    const txResponse = await vrfCoordinatorV2Mock.createSubscription()
    const txReceipt = await txResponse.wait(1)
    subscriptionId = txReceipt.events[0].args.subId
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)

  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
    subscriptionId = networkConfig[chainId].subscriptionId
  }

  const entranceFee = networkConfig[chainId].entranceFee
  const gasLane = networkConfig[chainId].gasLane
  const callbackGasLimit = networkConfig[chainId].callbackGasLimit
  const interval = networkConfig[chainId].interval

  const args = [vrfCoordinatorV2Address, entranceFee, gasLane, subscriptionId, callbackGasLimit, interval]

  const contractRaffle = await deploy('Raffle', {
    from: deployer,
    args,
    log: true,
    waitConfirmations: networkConfig[chainId].blockConfirmations || 1
  })

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    console.log('Verifying...')
    await verify(contractRaffle.address, args)
  }
  log('------------------------------------------------')
}

export default deployRaffle
deployRaffle.tags = ['all', 'raffle']
