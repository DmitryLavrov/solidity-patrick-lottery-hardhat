import { Raffle, VRFCoordinatorV2Mock } from '../typechain'
import { Result } from '@ethersproject/abi'

const { ethers, network } = require('hardhat')

async function mockKeepers() {
  const contractRaffle: Raffle = await ethers.getContract('Raffle')
  //--------------------------
  console.log('1')
  //--------------------------

  const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(''))
  const { upkeepNeeded } = await contractRaffle.callStatic.checkUpkeep(checkData)
  if (upkeepNeeded) {
    const tx = await contractRaffle.performUpkeep(checkData)
    const txReceipt = await tx.wait(1)
    const requestId = txReceipt.events && txReceipt.events[1].args?.requestId
    console.log(`Performed upkeep with RequestId: ${requestId}`)
    if (network.config.chainId == 31337) {
      await mockVrf(requestId, contractRaffle)
    }
  } else {
    console.log('No upkeep needed!')
  }
}

async function mockVrf(requestId: Result, raffle: Raffle) {
  console.log('We on a local network? Ok let\'s pretend...')
  const vrfCoordinatorV2Mock: VRFCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock')
  await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, raffle.address)
  console.log('Responded!')
  const recentWinner = await raffle.getRecentWinner()
  console.log(`The winner is: ${recentWinner}`)
}

mockKeepers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error detected:', error)
    process.exit(1)
  })
