import { developmentChains } from '../../hardhat-helper.config'
import { ethers, getNamedAccounts, network } from 'hardhat'
import { Raffle } from '../../typechain'
import { beforeEach } from 'mocha'
import { BigNumber } from 'ethers'
import { assert, expect } from 'chai'

developmentChains.includes(network.name)
  ? describe.skip
  : describe('Raffle Unit Tests', () => {

    let deployer: string
    let contractRaffle: Raffle
    let entranceFee: BigNumber
    let interval: BigNumber

    beforeEach(async () => {
      deployer = (await getNamedAccounts()).deployer
      contractRaffle = await ethers.getContract('Raffle', deployer)
      entranceFee = await contractRaffle.getEntranceFee()
      interval = await contractRaffle.getInterval()
    })

    describe('fulfillRandomWords', () => {
      it('works', async () => {
        const startingTimestamp = await contractRaffle.getLastTimeStamp()
        const accounts = await ethers.getSigners()

        await new Promise<void>(async (resolve) => {
          contractRaffle.once('WinnerPicked', async () => {
            console.log('WinnerPicked event fired!')
            // Winner found!
            try {
              const recentWinner = await contractRaffle.getRecentWinner()
              console.log('recentWinner received')
              const raffleState = await contractRaffle.getRaffleState()
              console.log('raffleState received')
              const winnerEndingBalance = await accounts[0].getBalance()
              console.log('winnerEndingBalance received')
              const endingTimeStamp = await contractRaffle.getLastTimeStamp()
              console.log('endingTimeStamp received')

              await expect(contractRaffle.getPlayers(0)).to.be.reverted
              assert.equal(recentWinner.toString(), accounts[0].address)
              assert.equal(raffleState.toString(), '0')
              assert(endingTimeStamp > startingTimestamp)
              assert.equal(winnerEndingBalance.toString(),
                winnerStartingBalance.add(entranceFee).toString())

              resolve()
            } catch (e) {
              return e
            }
          })

          console.log('Entering Raffle...')
          await contractRaffle.enterRaffle({ value: entranceFee })
          console.log('Ok, time to wait...')
          const winnerStartingBalance = await accounts[0].getBalance()
        })
      })
    })
  })
