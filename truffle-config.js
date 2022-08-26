const HDWalletProvider = require('@truffle/hdwallet-provider');

require('@babel/register');
require('@babel/polyfill');
require('dotenv').config();
const privateKeys = process.env.PRIVATE_KEYS || ""


module.exports = {
  networks: {

    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 7545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },
    kovan : {
      provider : function () {
        return new HDWalletProvider(
          privateKeys.split(','),
          `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`
        )
      } ,
      gas : 5000000 ,
      gasPrice : 25000000000 ,
      network_id:42 
    }
  },

  contracts_directory: './src/contracts',
  contracts_build_directory: './src/abis/',

  // Set default mocha options here, use special reporters, etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.0",      // Fetch exact version from solc-bin (default: truffle's version)
       optimizer: {
         enabled: true,
         runs: 200
       },
    }
  },

};
