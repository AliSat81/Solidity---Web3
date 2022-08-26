
# Decentralized Ethereum Token Exchange

This project contain two smart contract for ERC20 token and exchange.\
Also there is a test file that writed with 'mocha' and run with truffle suite .

## Requirements
For run the app :\
Metamask\
Ganache or any Testnet which you can deploy Smart Contracts

For run the Smart Contracts test :\
Metamask\
Ganache\
Truffle suite

## Run Locally

Clone the project

```bash
  git clone https://github.com/AliSat81/Solidity---Web3.git
```

Go to the project directory

```bash
  cd Solidity---Web3
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```


## Run The Smart Contracts Test

After installing the dependencies in the previous step 
```bash
  truffle test
```
## Deploy Smart Contracts

You can Deploy Smart Contracts on Ganache or any Testnet you want.\
Deploy on Ganache :
```bash
  truffle migrate
```
Deploy on Testnets use infoure:
```bash
  touch .env
```
Create your infura account and get your API key.\
** You must have two Wallets(accounts) that contains some ETH **\
Edit .env file like this :
```code
  PRIVATE_KEYS = '[Your Second Account Private Key],[Your First Account Private Key]'
  INFURA_API_KEY = [Your API Key]
```
Then if your Testnet is not 'Kovan' add your network to 'networks' section of your truffle-config.js file like this :
```code
  module.exports = {
  networks: {
    [Your Network Name] : {
      provider : function () {
        return new HDWalletProvider(
          privateKeys.split(','),
          `https://[Your Network Name].infura.io/v3/${process.env.INFURA_API_KEY}`
        )
      } ,
      gas : 5000000 ,
      gasPrice : 25000000000 ,
      network_id:[Your Network ID] 
    }
  },
};
```
Then in your Terminal run 
```bash
  truffle migrate [Your Network Name]
```
Thats all 😉\
\
Also this Contracts Deployed on Kovan testnet and this are the accounts :
```code
  first Account : 0x14d571b75FD249fd4E679b07d5def0440afb3fF9
  Second Account : 0x08D6A512A9c4859a1e678a4c54Abd375F5F4dd54
```


## Seed Exchange
After Deploy Smart Cotracts in the previous step , you can run this so your exchange have some data
```bash
  truffle exec scripts\seed-exchange.js
```

## Screenshots
App Screenshot : \
![Alt text](./screenshots/Home.png?raw=true "App Screenshot")\
Ganache Deployment : \
![Alt text](./screenshots/GanacheDeployment.png?raw=true "Ganache Deployment")\
Truffle Exchange Test : \
![Alt text](./screenshots/TruffleExchangeTest.png?raw=true "Truffle Exchange Test")\
Truffle Token Test : \
![Alt text](./screenshots/TruffleTokenTest.png?raw=true "Truffle Token Test")\
Price Chart : \
![Alt text](./screenshots/PriceChart.png?raw=true "Price Chart")
