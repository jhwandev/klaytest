// truffle.js config for klaytn.
const HDWalletProvider = require('truffle-hdwallet-provider-klaytn')
const URL = 'https://api.baobab.klaytn.net:8651'
const NETWORK_ID = '1001'
const GASLIMIT = '8500000'

const PRIVATE_KEY = '0x7780c219af9edc38f9599ca77b3989c93ffd853f6fe2704550822f554e138517'

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