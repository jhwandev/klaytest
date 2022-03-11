// truffle.js config for klaytn.
const HDWalletProvider = require('truffle-hdwallet-provider-klaytn')
const URL = 'https://api.baobab.klaytn.net:8651'
const NETWORK_ID = '1001'
const GASLIMIT = '8500000'

const PRIVATE_KEY = '0x98cd8ce5db002984816fb9326b54077a412238209ad140e728405b07a79c1148'

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