let web3 = new web3js.myweb3(window.ethereum);
let addr;

const sttaddr = "0xf5a540b35CA6fb67AF8e3A80Fb9554D6d0aA5062";
const sttabi = [
  {
    "inputs": [],
    "name": "buyOnPresale",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

let sttcontract = new web3.eth.Contract(sttabi, sttaddr);

const loadweb3 = async () => {
  try {
    web3 = new web3js.myweb3(window.ethereum);
    console.log('Injected web3 detected.')
    sttcontract = new web3.eth.Contract(sttabi, sttaddr);
    let a = await ethereum.enable();
    addr = web3.utils.toChecksumAddress(a[0]);
    return (addr);

  } catch (error) {
    if (error.code === 4001) {
      console.log('Please connect to MetaMask.')
    } else {
      Swal.fire(
        'Connect Alert',
        'Please install Metamask!',
        'error'
      )
    }
  }
};

const getBalance = async () => {
  await loadweb3();
  await web3.eth.getBalance(web3.currentProvider.selectedAddress).then(response => document.querySelector('.ethBalance').innerHTML = `ETH: ${response}`)
  document.querySelector('.tokenBalance').innerHTML = `NPT: ${await sttcontract.methods.balanceOf(web3.currentProvider.selectedAddress).call()}`
}
getBalance()

//***************** our smart-contract integration *****************/

const buystt = async () => {
  await loadweb3();
  const chainId = await web3.eth.getChainId();
  if (addr == undefined) {
    Swal.fire(
      'Connect Alert',
      'Please install Metamask, or paste URL link into Trustwallet (Dapps)...',
      'error'
    )
  }
  if (chainId !== 4) {
    Swal.fire(
      'Connect Alert',
      'Please Connect on Rinkeby',
      'error'
    )
  }

  let ethval = document.getElementById("buyinput").value;
  if (ethval >= 0.001) {
    ethval = (ethval * Math.pow(10, 18));

    sttcontract.methods.buyOnPresale().send({ from: addr, value: ethval }).then(function (error, result) {
      getBalance()
      Swal.fire(
        'Success!',
        'Thank you for your purchase!',
        'info'
      )
    }, function (e, processedContract) {
      Swal.fire(
        'Error!',
        'Transaction rejected!',
        'error'
      )
    });
  } 
  else {
    Swal.fire(
      'Buy Alert',
      'Buy as low as 0.001 BNB.',
      'error'
    )
  }
}



//***************** adding our token to wallet *****************/

function addToWallet() {
  try {
    web3.currentProvider.sendAsync({
      method: 'wallet_watchAsset',
      params: {
        'type': 'ERC20',
        'options': {
          'address': '0xf5a540b35CA6fb67AF8e3A80Fb9554D6d0aA5062',
          'symbol': 'NPT',
          'decimals': '18'
        },
      },
      id: Math.round(Math.random() * 100000)
    }, function (err, data) {
      if (!err) {
        if (data.result) {
          console.log('Token added');
        } else {
          console.log(data);
          console.log('Some error');
        }
      } else {
        console.log(err.message);
      }
    });
  } catch (e) {
    console.log(e);
  }
}
