import Caver from "caver-js";
import {Spinner} from 'spin.js';
import Web3 from "web3";

const config = {
  rpcURL: 'https://api.baobab.klaytn.net:8651'
}
const cav = new Caver(config.rpcURL);
const web3 = new Web3(window.ethereum);

const agContract = new cav.klay.Contract(DEPLOYED_ABI, DEPLOYED_ADDRESS);

//set ipfs
//param - (string ipfsnode url, number port, boolean(https:false, http:true))
cav.ipfs.setIPFSNode('localhost', 5001, true);

//test
const myNFT = new cav.klay.KIP17('0x3c23cbB340dF53B93c286AB4D3FD7B7c518Bd879');








const App = {
  auth: {
    accessType: '',
    keystore: '',
    password: ''
  },



  ttt: async function() {


    const user = '0xCd28FDC46D44fDBc667B81D88C3794696D0ecfA7';
    
    //주어진 계정 주소의 잔액을 반환 - 해당 컨트랙(mynft인스턴스)에 해당하는 느프트 몇개 가지고 있는지
    const nftBanance = await myNFT.balanceOf(user);
    
    var nftList = []
    var nftNo = '';
    var nft = '';

    
    for (var i=0; i < nftBanance; i++) {
      nftNo = await myNFT.tokenOfOwnerByIndex(user, i);
      nft = await myNFT.tokenURI(nftNo);
      nft = nft.split('ipfs://')[1]
      
      nftList.push('https://'+nft);
    }

    //https://ipfs.io/ipfs/QmbjEWgbA9wMZqXbFVqAWfVAcd4vSjtmW3YbC6DtpRCE5V/1.json
    //ipfs://QmbjEWgbA9wMZqXbFVqAWfVAcd4vSjtmW3YbC6DtpRCE5V/1.json"
    console.log(nftList);

  },

  /**
   * 연결된 session 정보가 있을경우, ui변경하여 정보표시
   */
  start: async function () {
    
    this.ttt();

    // var tokenList = []
    // for (let i; i < myNFT.balanceOf(myAddress); i++) {
    // tokenList.push(myNFT.tokenOfOwnerByIndex(myAddress, i))
    // }

    // console.log("My tokens: ", tokenList)

    const walletFromSession = sessionStorage.getItem('walletInstance');


    //kaikas일경우와 분기 필요(cav wallet)
    if (walletFromSession) {
      try {
        cav.klay.accounts.wallet.add(JSON.parse(walletFromSession));
        this.changeUI(JSON.parse(walletFromSession));
      } catch (e) {      
        sessionStorage.removeItem('walletInstance');
      }
    }
  },

  /**
   * keystore 유효성
   */
  handleImport: async function () {
    
    this.auth.accessType = 'keystore'

    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0]);
    fileReader.onload = (event) => {      
      try {     
        if (!this.checkValidKeystore(event.target.result)) {
          $('#message').text('유효하지 않은 keystore 파일입니다.');
          return;
        }
        this.auth.keystore = event.target.result;
        $('#message').text('keystore 통과. 비밀번호를 입력하세요.');
        document.querySelector('#input-password').focus();    
      } catch (event) {
        $('#message').text('유효하지 않은 keystore 파일입니다.');
        return;
      }
    }   
  },

  /**
   * keystore 비밀번호 input onchange event
   */
  handlePassword: async function () {
    this.auth.password = event.target.value;
  },

  /**
   * login 버튼
   */
  handleLogin: async function (account) {
    //keystore
    if (this.auth.accessType === 'keystore') { 
      try {
        //private key decrypt
        const privateKey = cav.klay.accounts.decrypt(this.auth.keystore, this.auth.password).privateKey;
        this.integrateWallet(privateKey);
      } catch (e) {
        $('#message').text('비밀번호가 일치하지 않습니다.');
      }

    //kaikas
    }else if(this.auth.accessType === 'kaikas') {
      try {
        const publicKey = account;
        this.integrateWalletKaikas(publicKey);
        //$('#from').val(publicKey);
      } catch (e) {
        $('#message').text('err');
      }

    //metaMask
    }else if(this.auth.accessType === 'metamask') {
      console.log('etherwallet access');
      try {
        const publicKey = account;
        this.integrateWalletMetamask(publicKey);
        //$('#from').val(publicKey);
      } catch (e) {
        $('#message').text('err');
      }
    }

  },

  handleLogout: async function () {
    this.removeWallet();
    location.reload();
  },

  generateNumbers: async function () {
    var num1 = Math.floor((Math.random() * 50) + 10);
    var num2 = Math.floor((Math.random() * 50) + 10);
    sessionStorage.setItem('result', num1 + num2);

    $('#start').hide();
    $('#start').hide();
    $('#num1').text(num1);
    $('#num2').text(num2);
    $('#question').show();
    document.querySelector('#answer').focus();

    this.showTimer();
  },

  submitAnswer: async function () {
    const result = sessionStorage.getItem('result');
    var answer = $('#answer').val();

    if(answer === result){
      if (confirm("정답! 0.1 KLAY 받기")){
        if (await this.callContractBalance() >= 0.1){
          this.receiveKlay();
        }else{
          alert('컨트랙 계정에 klay가 없습니다.')
        }
      }
    }else{
      alert('땡!')
    }

  },

  deposit: async function () {
    var spinner = this.showSpinner();
    const walletInstance = this.getWallet();

    if (walletInstance) {
      if ((await this.callOwner()).toUpperCase() !== walletInstance.address.toUpperCase()){
        alert('Owner 가 아님.')
        return; 
      } 
      else {
        var amount = $('#amount').val();
        console.log(amount)
        if (amount) {
          agContract.methods.deposit().send({
            from: walletInstance.address,
            gas: '200000',
            value: cav.utils.toPeb(amount, "KLAY")
          })
          .then(receipt => {
            console.log(receipt);
            if (receipt.status){
              alert(amount + " KLAY를 컨트랙에 송금했습니다.");               
              location.reload();
            } else{
              alert("컨트랙트 실패.");               
            }
            spinner.stop();  
          })
          .catch(err => {
            alert(err.message)
            spinner.stop();  
          })        

        }
        return;    
      }
    }
  },

  /**
   * kaikas transaction test
   */
  depositTest: async function () {
    caver.klay
    .sendTransaction({
      type: 'VALUE_TRANSFER',
      from: klaytn.selectedAddress,
      to: '0x0000000000000000000000000000000000000000',
      value: caver.utils.toPeb('1', 'KLAY'),
      gas: 8000000
    })
  },


  /**
   * token transfer
   * @returns 
   */
  tokenTransfer: async function() {


    const to = $('#to').val();
    const amount = $('#value').val();
    const gas = $('#gas').val();
    const contractAddress = $('#contract').val();


    // const { from, contractAddress, to, amount, gas, decimal } = this.state
    // if (decimal > 20) {
    //   return alert('decimal should be less than 21')
    // }

    const data = caver.klay.abi.encodeFunctionCall(
      {
        name: 'transfer',
        type: 'function',
        inputs: [
          {
            type: 'address',
            name: 'recipient'
          },
          {
            type: 'uint256',
            name: 'amount'
          }
        ]
      },
      [
        to,
        caver.utils
          .toBN(amount)
          .mul(caver.utils.toBN(Number(`1e${decimal}`)))
          .toString()
      ]
    )

    caver.klay
      .sendTransaction({
        type: 'SMART_CONTRACT_EXECUTION',
        from,
        to: contractAddress,
        data,
        gas
      })
      .on('transactionHash', transactionHash => {
        console.log('txHash', transactionHash)
        this.setState({ txHash: transactionHash })
      })
      .on('receipt', receipt => {
        console.log('receipt', receipt)
        this.setState({ receipt: JSON.stringify(receipt) })
      })
      .on('error', error => {
        console.log('error', error)
        this.setState({ error: error.message })
      })
  },

  /**
   * send transaction
   * klay
   */
  sendKlay: async function () {

    const to = $('#to').val();
    const value = $('#value').val();
    const gas = $('#gas').val();

    try {
      caver.klay
      .sendTransaction({
        type: 'VALUE_TRANSFER',
        from: klaytn.selectedAddress,
        to: to,
        value: caver.utils.toPeb(value, 'KLAY'),
        gas: gas
      })
      .then(receipt => {
        if (receipt.status){
          
          alert(value + " KLAY를 컨트랙에 송금했습니다.");               
          console.log(receipt);
          //location.reload();
        } else{
          alert("컨트랙트 실패");               
        }  
      })
    } catch (err) {
      alert(err.message);
    }
  },

  /**
   * 
   */
  valueTransferMemo: async function () {

    const to = $('#to').val();
    const value = $('#value').val();
    const gas = $('#gas').val();
    const memo = $('#memo').val();


    caver.klay.sendTransaction({
      type: 'VALUE_TRANSFER_MEMO',
      from: klaytn.selectedAddress,
      to: to,
      value: caver.utils.toPeb(value.toString(), 'KLAY'),
      gas: gas,
      data: memo,
    })
      .once('transactionHash', (transactionHash) => {
        console.log('txHash', transactionHash)
        //this.setState({ txHash: transactionHash })
      })
      .once('receipt', (receipt) => {
        console.log('receipt', receipt)
        //this.setState({ receipt: JSON.stringify(receipt) })
      })
      .once('error', (error) => {
        console.log('error', error)
        //this.setState({ error: error.message })
      })
  },


  callOwner: async function () {
    return await agContract.methods.owner().call();
  },

  callContractBalance: async function () {
    return await agContract.methods.getBalance().call();
  },

  getWallet: function () {
    if (cav.klay.accounts.wallet.length) {
      return cav.klay.accounts.wallet[0];
    }
  },

  checkValidKeystore: function (keystore) {
    const parsedKeystore = JSON.parse(keystore);
    const isValidKeystore = parsedKeystore.version &&
      parsedKeystore.id &&
      parsedKeystore.address &&
      parsedKeystore.keyring;  

    return isValidKeystore;
  },

  /**
   * keystore 로그인시 사용
   * privatekey 세션에 추가
   */
  integrateWallet: function (privateKey) {
    const walletInstance = cav.klay.accounts.privateKeyToAccount(privateKey);
    cav.klay.accounts.wallet.add(walletInstance)
    sessionStorage.setItem('walletInstance', JSON.stringify(walletInstance));
    this.changeUI(walletInstance);  
  },


  /**
   * test kaikas 
   */
   integrateWalletKaikas: function (publicKey) {
    const walletInstance = {'address' : publicKey}

    //cav.klay.accounts.wallet.add(walletInstance)
    sessionStorage.setItem('walletInstance', JSON.stringify(walletInstance));
    this.changeUI(walletInstance);  
  },
  /**
   * test metamask 
   */
   integrateWalletMetamask: function (publicKey) {
    const walletInstance = {'address' : publicKey}

    //cav.klay.accounts.wallet.add(walletInstance)
    sessionStorage.setItem('walletInstance', JSON.stringify(walletInstance));
    this.changeUI(walletInstance); 
  },

  
  reset: function () {
    this.auth = {
      keystore: '',
      password: ''
    };
  },

  /**
   * 
   * @param {*} walletInstance 
   */
  changeUI: async function (walletInstance) {

    $('#loginModal').modal('hide');
    $("#loginKaikas").hide();
    $('#loginMetamask').hide();
    $("#login").hide();
    $('#logout').show();
    $('#game').show();
    //$('#address').append('<br>' + '<p>' + '내 계정 주소: ' + walletInstance.address + '</p>');   
    //$('#contractBalance').append('<p>' + '이벤트 잔액: ' + cav.utils.fromPeb(await this.callContractBalance(), "KLAY") + ' KLAY' + '</p>');     

    const contractOwner = await this.callOwner()
    //alert(contractOwner)
    if (contractOwner.toUpperCase() === contractOwner.toUpperCase()) {
      $("#owner").show();
      $("#send").show();
    }     
  },

  removeWallet: function () {
    cav.klay.accounts.wallet.clear();
    sessionStorage.removeItem('walletInstance');
    this.reset();
  },

  showTimer: function () {

    var seconds = 5;
    $('#timer').text(seconds);

    var interval = setInterval(() => {
      $('#timer').text(--seconds);
      if(seconds <= 0){
        $('#timer').text('');
        $('#answer').val('');
        $('#question').hide();
        $('#start').show();
        clearInterval(interval)
      }
    }, 1000);
  },

  showSpinner: function () {
    var target = document.getElementById('spin');
    return new Spinner(opts).spin(target);
  },

  receiveKlay: function () {
    var spinner = this.showSpinner();
    const walletInstance = this.getWallet();

    if(!walletInstance) return;

    agContract.methods.transfer(cav.utils.toPeb("0.1","KLAY")).send({
      from: walletInstance.address,
      gas: '250000'
    }).then(function (receipt){
      console.log(receipt)
      if (receipt.status) {
        spinner.stop();
        alert("0.1 KLAY가 " + walletInstance.address + " 계정으로 지급되었습니다.");
        $('#transaction').html('')
        $('#transaction').append(`<p><a href='https://baobab.klaytnscope.com/tx/${receipt.txHash}' target='_blank'>클레이튼 Scope에서 트랜젝션 확인</a></p>`);
        return agContract.methods.getBalance().call()
          .then(function (balance){
            $('#contractBalance').html("");
            $('#contractBalance').append('<p>' + '이벤트 잔액: ' + cav.utils.fromPeb(balance, "KLAY") + ' KLAY' + '</p>');
          })
      }
    })

  },

  /**
   * kaikas login function
   * @returns 
   */
  kaikasLogin: async function() {
    this.auth.accessType = 'kaikas';
    
    if(typeof window.klaytn !== 'undefined') {
    }else{
      return;
    }

    if(klaytn.networkVersion!='1001'){

    }
    
    if(window.klaytn.isKaikas) {
      const accounts = await klaytn.enable();
      const account = accounts[0]
      this.handleLogin(account);
      //console.log(account);
      this.setAccountInfo();
    }

    //주소 변경 event
    klaytn.on('accountsChanged', function(accounts) {
      //로그아웃?
      console.log('주소 변경 event : '+ accounts);
      App.setAccountInfo();
    })

    //this.depositTest();
  },

  metamaskLogin: async function() {
    this.auth.accessType = 'metamask';
    
    if(typeof window.ethereum !== 'undefined') {
    }else{
      return;
    }

    const chainId = ethereum.chainId;

    if(chainId != '0x3e9') {
      await this.switchMetamaskNetwork();
      return;
    }else{
      
    }
    
    if(window.ethereum.isMetaMask) {
      //const accounts = await ethereum.enable(); //deprecated
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0]
      console.log(account);

      this.handleLogin(account);
      console.log(account);
      this.setAccountInfoMeta();
    }

    //주소 변경 event
    klaytn.on('accountsChanged', function(accounts) {
      //로그아웃?
      console.log('주소 변경 event : '+accounts);
      App.setAccountInfoMeta();
    })

    //this.depositTest();
  },

  /**
   * metamask network switch
   */
  switchMetamaskNetwork: async function() {

    //baobab testnet
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x3e9' }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x3e9',
                chainName: 'Baobab',
                nativeCurrency: {
                  name: 'Klaytn',
                  symbol: 'KLAY',
                  decimals: 18
                },
                rpcUrls: ['https://kaikas.baobab.klaytn.net:8651/'],
                blockExplorerUrls: ['https://baobab.scope.klaytn.com/']
              },
            ],
          });
        } catch (addError) {
          // handle "add" error
        }
      }
      // handle other "switch" errors
    }
  },


  /**
   * switch metamask network to cypress(klaytn)
   */
  switchMetamaskNetworkToCypress: async function() {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2019' }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x2019',
                chainName: 'cypress',
                nativeCurrency: {
                  name: 'Klaytn',
                  symbol: 'KLAY',
                  decimals: 18
                },
                rpcUrls: ['https://kaikas.baobab.klaytn.net:8651/'],
                blockExplorerUrls: ['https://scope.klaytn.com']
              },
            ],
          });
        } catch (addError) {
          // handle "add" error
        }
      }
      // handle other "switch" errors
    }
  },
  /**
   * select event
   */
  selectEvent: async function() {

    const selected = $('#selectbox option:selected').val();
    
    //reset

    //form
    $('#contentTitle').text('');
    $('#fromDiv').hide();
    $('#toDiv').hide();
    $('#contractDiv').hide();
    $('#memoDiv').hide();
    $('#gasDiv').hide();
    $('#valueDiv').hide();
    
    //button
    $('#sendBtnDiv').hide();
    $('#valueTransferMemoBtnDiv').hide();
    

    if(selected == 'sendKlay') {
      $('#contentTitle').text('Send Klay');
      $('#fromDiv').show();
      $('#toDiv').show();
      $('#gasDiv').show();
      $('#valueDiv').show();
      $('#sendBtnDiv').show();
      
    }else if(selected == 'tokenTransfer') {
      $('#contentTitle').text('token Transfer');
      $('#fromDiv').show();
      $('#toDiv').show();
      $('#contractDiv').show();
      $('#gasDiv').show();
      $('#valueDiv').show();
      $('#sendBtnDiv').show();

    }else if(selected == 'valueTransferMemo'){
      $('#contentTitle').text('Value Transfer with Memo');
      $('#fromDiv').show();
      $('#toDiv').show();
      $('#memoDiv').show();
      $('#gasDiv').show();
      $('#valueDiv').show();
      $('#valueTransferMemoBtnDiv').show();
    }
    
  },

  setAccountInfo: async function() {
    const { klaytn } = window
    if (klaytn === undefined) return

    const account = klaytn.selectedAddress
    const balance = await caver.klay.getBalance(account)

    $('#from').val(account);
    $('#from').val(account);

    $('#address').text(account);
    $('#balance').text(caver.utils.fromPeb(balance, 'KLAY')+' KLAY');

  },
  setAccountInfoMeta: async function() {
    const { ethereum } = window
    if (ethereum === undefined) return

    const account = ethereum.selectedAddress
    const balance = await web3.eth.getBalance(account)

    console.log(balance+'  --');

    $('#from').val(account);
    $('#from').val(account);

    $('#address').text(account);
    $('#balance').text(web3.utils.fromWei(balance)+' KLAY');

  }
  
  
};

window.App = App;

window.addEventListener("load", function () { 
  App.start();
});

var opts = {
  lines: 10, // The number of lines to draw
  length: 30, // The length of each line
  width: 17, // The line thickness
  radius: 45, // The radius of the inner circle
  scale: 1, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  color: '#5bc0de', // CSS color or array of colors
  fadeColor: 'transparent', // CSS color or array of colors
  speed: 1, // Rounds per second
  rotate: 0, // The rotation offset
  animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
  direction: 1, // 1: clockwise, -1: counterclockwise
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  className: 'spinner', // The CSS class to assign to the spinner
  top: '50%', // Top position relative to parent
  left: '50%', // Left position relative to parent
  shadow: '0 0 1px transparent', // Box-shadow for the lines
  position: 'absolute' // Element positioning
};