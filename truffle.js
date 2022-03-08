// truffle.js config for klaytn.
const HDWalletProvider = require('truffle-hdwallet-provider-klaytn')
const URL = 'https://api.baobab.klaytn.net:8651'
const NETWORK_ID = '1001'
const GASLIMIT = '8500000'

const PRIVATE_KEY = '0xcd534c5b118e8865ffc4632b3473729492782f5c0fb644afada463bc2252e4fc'

module.exports = {
    networks : {
        klaytn:{
            provider: () => new HDWalletProvider(PRIVATE_KEY, URL),
            network_id: NETWORK_ID,
            gas: GASLIMIT,
            gasPrice: null,
        }
    }
}