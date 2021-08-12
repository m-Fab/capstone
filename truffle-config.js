require('babel-register');
require('babel-polyfill');
require('dotenv').config();

const privateKeys = process.env.PRIVATE_KEYS || ""
const HDWalletProvider = require('truffle-hdwallet-provider-privkey');
//
// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  networks: {
    // development: {
    //  host: "127.0.0.1",
    //  port: 7545,
    //  network_id: "*",
    // },
    // kovan: {
    //   provider: function() {
    //     return new HDWalletProvider(
    //       privateKeys.split(','),
    //       `https://kovan.infura.io/v3/${ process.env.INFURA_API_KEY }`
    //     )
    //   },
    //   gas: 50000,
    //   gasPrice: 5000000000,
    //   network_id: 42,
    // },
    goerli: {
      provider: function() {
        return new HDWalletProvider(
          privateKeys.split(','),
          `wss://goerli.infura.io/ws/v3/${ process.env.INFURA_API_KEY }`
        )
      },
      gas: 5000000,
      gasPrice: 25000000000,
      network_id: 5,
    }
  },

  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',

  compilers: {
    solc: {
      version: "0.8.0",
      settings: {
       optimizer: {
         enabled: true,
         runs: 200
       },
      },
    },
  },
};
