import { developmentChains, networkConfig } from '../../hardhat-helper.config'
import { deployments, ethers, getNamedAccounts, network } from 'hardhat'
import { beforeEach } from 'mocha'
import { assert, expect } from 'chai'
import { Raffle, VRFCoordinatorV2Mock } from '../../typechain'
import { BigNumber } from 'ethers'

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Raffle Unit Tests', () => {

    let deployer: string
    let contractRaffle: Raffle
    let contractVRFCoordinatorV2Mock: VRFCoordinatorV2Mock
    const chainId = network.config.chainId || 31337
    // const { entranceFee = ethers.utils.parseEther('0.01'), interval = '0' } = networkConfig[chainId]
    let entranceFee: BigNumber
    let interval: BigNumber

    beforeEach(async () => {
      deployer = (await getNamedAccounts()).deployer
      await deployments.fixture(['all'])

      contractRaffle = await ethers.getContract('Raffle', deployer)
      contractVRFCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock', deployer)
      entranceFee = await contractRaffle.getEntranceFee()
      interval = await contractRaffle.getInterval()
    })

    describe('constructor', () => {
      it('initialize the Raffle correctly', async () => {
        const interval = await contractRaffle.getInterval()
        const state = await contractRaffle.getRaffleState()
        assert.equal(interval.toString(), networkConfig[chainId].interval)
        assert.equal(state.toString(), '0')
      })
    })

    describe('enterRaffle', () => {
      it('revert if you don\'t pay enough', async () => {
        await expect(contractRaffle.enterRaffle()).to.be.revertedWith('Raffle__NotEnoughEthEntered')
      })
      it('populate an array of players', async () => {
        await contractRaffle.enterRaffle({ value: entranceFee })
        const player = await contractRaffle.getPlayers(0)
        assert.equal(deployer, player)
      })
      it('emits event on enter', async () => {
        // https://ethereum-waffle.readthedocs.io/en/latest/matchers.html
        await expect(contractRaffle.enterRaffle({ value: entranceFee }))
          .to.emit(contractRaffle, 'RaffleEnter')
          .withArgs(deployer)
      })
      it('revert when Raffle is calculating', async () => {
        // https://hardhat.org/hardhat-network/reference#special-testing/debugging-methods
        await contractRaffle.enterRaffle({ value: entranceFee })
        await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
        await network.provider.send('evm_mine', [])
        await contractRaffle.performUpkeep([])
        await expect(contractRaffle.enterRaffle({ value: entranceFee })).to.be.revertedWith('Raffle__NotOpen')
      })
    })

    describe('checkUpkeep', () => {
      it('returns False if players haven\'t sent any ETH', async () => {
        // https://docs.ethers.io/v5/api/contract/contract/#contract-callStatic
        await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
        await network.provider.send('evm_mine', [])
        const { upkeepNeeded } = await contractRaffle.callStatic.checkUpkeep([])
        assert(!upkeepNeeded)
      })
      it('returns False if s_raffleState != OPEN', async () => {
        await contractRaffle.enterRaffle({ value: entranceFee })
        await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
        await network.provider.send('evm_mine', [])
        await contractRaffle.performUpkeep([])
        const raffleState = await contractRaffle.getRaffleState()
        const { upkeepNeeded } = await contractRaffle.callStatic.checkUpkeep([])
        assert.equal(raffleState.toString(), '1')
        assert(!upkeepNeeded)
      })
      it('returns False if time hasn\'t passed', async () => {
        await contractRaffle.enterRaffle({ value: entranceFee })
        await network.provider.send('evm_increaseTime', [interval.toNumber() - 1])
        await network.provider.send('evm_mine', [])
        const { upkeepNeeded } = await contractRaffle.callStatic.checkUpkeep('0x')
        assert(!upkeepNeeded)
      })
      it('returns True if enough time has passed, has players, ETH and state == OPEN', async () => {
        await contractRaffle.enterRaffle({ value: entranceFee })
        await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
        await network.provider.send('evm_mine', [])
        const { upkeepNeeded } = await contractRaffle.callStatic.checkUpkeep('0x')
        assert(upkeepNeeded)
      })
    })
    describe('performUpkeep', () => {
      it('should run only if checkUpkeep returns True', async () => {
        await contractRaffle.enterRaffle({ value: entranceFee })
        await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
        await network.provider.send('evm_mine', [])
        const tx = await contractRaffle.performUpkeep('0x')
        assert(tx)
      })
      it('should revert if checkUpkeep returns False', async () => {
        await expect(contractRaffle.performUpkeep('0x')).to.be.revertedWith('Raffle__UpkeepNotNeeded')
      })
      it('updates s_raffleState, calls vrfCoordinator, emits an event', async () => {
        await contractRaffle.enterRaffle({ value: entranceFee })
        await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
        await network.provider.send('evm_mine', [])
        const tx = await contractRaffle.performUpkeep('0x')

        const raffleState = await contractRaffle.getRaffleState()
        assert.equal(raffleState.toString(), '1')

        const txReceipt = await tx.wait(1)
        const requestId = txReceipt.events && txReceipt.events[1].args?.requestId
        assert(parseInt(requestId) > 0)
      })
    })

    describe('fulfillRandomWords', () => {
      beforeEach(async () => {
        await contractRaffle.enterRaffle({ value: entranceFee })
        await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
        await network.provider.send('evm_mine', [])
      })
      // information from VRFCoordinatorV2Mock.sol
      it('can only be called after performUpkeep', async () => {
        await expect(contractVRFCoordinatorV2Mock.fulfillRandomWords(0, contractRaffle.address))
          .to.be.revertedWith('nonexistent request')
        await expect(contractVRFCoordinatorV2Mock.fulfillRandomWords(1, contractRaffle.address))
          .to.be.revertedWith('nonexistent request')
      })
      it('picks a winner, resets the lottery, and sends the money', async () => {
        const additionalPlayers = 3
        const startingAccountsIndex = 1 // deployer = 0
        const accounts = await ethers.getSigners()
        for (let i = startingAccountsIndex; i < startingAccountsIndex + additionalPlayers; i++) {
          const accountConnectedRaffle = contractRaffle.connect(accounts[1])
          await accountConnectedRaffle.enterRaffle({ value: entranceFee })
        }
        const startingTimestamp = await contractRaffle.getLastTimeStamp()

        await new Promise<void>(async (resolve) => {
          contractRaffle.once('WinnerPicked', async () => {
            // Winner found!
            try {
              const recentWinner = await contractRaffle.getRecentWinner()
              //-------------------------- Detect winner account (1 in this case)
              // console.log('recentWinner: ', recentWinner)
              // console.log('accounts[1]: ', accounts[1].address)
              // console.log('accounts[2]: ', accounts[2].address)
              // console.log('accounts[3]: ', accounts[3].address)
              //--------------------------
              assert.equal(recentWinner.toString(), accounts[1].address)

              const raffleState = await contractRaffle.getRaffleState()
              assert.equal(raffleState.toString(), '0')

              const endingTimeStamp = await contractRaffle.getLastTimeStamp()
              assert(endingTimeStamp > startingTimestamp)

              const numberOfPlayers = await contractRaffle.getNumberOfPlayers()
              assert.equal(numberOfPlayers.toString(), '0')

              const winnerEndingBalance = await accounts[1].getBalance()
              assert.equal(winnerEndingBalance.toString(),
                winnerStartingBalance.add(entranceFee.mul(additionalPlayers).add(entranceFee)).toString())

              resolve()
            } catch (e) {
              return e
            }
          })
          const tx = await contractRaffle.performUpkeep('0x')
          const txReceipt = await tx.wait(1)
          const winnerStartingBalance = await accounts[1].getBalance()
          const requestId = txReceipt.events && txReceipt.events[1].args?.requestId
          await contractVRFCoordinatorV2Mock.fulfillRandomWords(requestId, contractRaffle.address)
        })
      })
    })
  })
