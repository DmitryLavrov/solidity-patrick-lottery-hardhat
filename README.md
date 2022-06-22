## Getting Started

### Prerequisites

```shell
npm i npm@latest -g
npm init -y
```

### Installation

```shell
npm i -D hardhat
npx hardhat
```

√ What do you want to do? · Create an advanced sample project that uses TypeScript  
√ Hardhat project root: · C:\Projects\solidity-patrick-lottery-hardhat   
√ Do you want to add a .gitignore? (Y/n) ·
y

You need to install these dependencies to run the sample project:

```shell
npm install --save-dev "hardhat@^2.9.9" "@nomiclabs/hardhat-waffle@^2.0.0" "ethereum-waffle@^3.0.0" "chai@^4.2.0" "@nomiclabs/hardhat-ethers@^2.0.0" "ethers@^5.0.0" "@nomiclabs/hardhat-etherscan@^3.0.0" "dotenv@^16.0.0" "eslint@^7.29.0" "eslint-config-prettier@^8.3.0" "eslint-config-standard@^16.0.3" "eslint-plugin-import@^2.23.4" "eslint-plugin-node@^11.1.0" "eslint-plugin-prettier@^3.4.0" "eslint-plugin-promise@^5.1.0" "hardhat-gas-reporter@^1.0.4" "prettier@^2.3.2" "prettier-plugin-solidity@^1.0.0-beta.13" "solhint@^3.3.6" "solidity-coverage@^0.7.16" "@typechain/ethers-v5@^7.0.1" "@typechain/hardhat@^2.3.0" "@typescript-eslint/eslint-plugin@^4.29.1" "@typescript-eslint/parser@^4.29.1" "@types/chai@^4.2.21" "@types/node@^12.0.0" "@types/mocha@^9.0.0" "ts-node@^10.1.0" "typechain@^5.1.2" "typescript@^4.5.2"
```
```shell
npm i -D @chainlink/contracts
npm i -g hardhat-shorthand
npm i -D hardhat-deploy
npm i -D @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers
```


## Resources

Lesson 9 of the FreeCodeCamp Solidity & Javascript Blockchain Course
* https://github.com/PatrickAlphaC/hardhat-smartcontract-lottery-fcc

Get a Random Number
* https://docs.chain.link/docs/get-a-random-number/

Shorthand (hh) and autocomplete
* https://hardhat.org/guides/shorthand

Chainlink Keepers
* https://docs.chain.link/docs/chainlink-keepers/introduction/

Waffle Chai matchers
* https://ethereum-waffle.readthedocs.io/en/latest/matchers.html

Hardhat Special testing/debugging methods
* https://hardhat.org/hardhat-network/reference#special-testing/debugging-methods

LINK Token Contract Rinkeby
* https://docs.chain.link/docs/link-token-contracts/#rinkeby  
  Address	0x01BE23585060835E02B77ef475b0Cc51aA1e0709

VRF (Chainlink Verifiable Randomness Function)
* https://vrf.chain.link/   
Create subscription

Chainlink Keepers
* https://keepers.chain.link/rinkeby
* https://keepers.chain.link/rinkeby/1275

# Usage

## Useful commands

```shell
# Check all smart projects with Solhint
npx solhint contracts/*.sol

# Delete folder artefacts and clear folder cash
hh clean

# Compile files in ./contracts
hh compile

# Run tests
hh test

# Code coverage for Solidity tests
hh coverage
```

## Staging test
```shell
hh deploy --network rinkeby 
hh test --network rinkeby
```
See results here  
https://rinkeby.etherscan.io/address/0x44044A512BdE98098Df4D36Da1D89CEb94c445A1  
https://vrf.chain.link/rinkeby/6741  
https://keepers.chain.link/rinkeby/1275
