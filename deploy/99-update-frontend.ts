import { ethers, network } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import  fs  from 'fs'
import {frontEndAbiFile, frontEndContractsFile} from '../hardhat-helper.config'

const updateFrontend: DeployFunction = async () => {
  if (process.env.UPDATE_FRONT_END) {
    console.log('Writing to frontend...')
    await updateContractAddresses()
    await updateAbi()
  }
}

const updateContractAddresses = async () => {
  const contractRaffle = await ethers.getContract('Raffle')
  if (!network.config.chainId) {
    console.log('chainId is empty! Check hardhat-helper.config.ts')
    return
  }
  const chainId = network.config.chainId.toString()
  const contractRaffleAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, 'utf8'))
  if (chainId in contractRaffleAddresses) {
    if (!contractRaffleAddresses[chainId].includes(contractRaffle.address)) {
      contractRaffleAddresses[chainId].push(contractRaffle.address)
    }
  } else {
    contractRaffleAddresses[chainId] = [contractRaffle.address]
  }
  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractRaffleAddresses))
}

const updateAbi = async () => {
  const contractRaffle = await ethers.getContract('Raffle')
  fs.writeFileSync(frontEndAbiFile, contractRaffle.interface.format(ethers.utils.FormatTypes.json))
}

export default updateFrontend
updateFrontend.tags = ['all', 'frontend']
