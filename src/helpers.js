import { 
  loadWeb3,
  loadAccount,
  loadToken,
  loadExchange,
  loadBalances
} from './store/interactions'

export const loadBlockchainData = async (dispatch) => {
  // Redux not working in local (Ganache) for web3 selector - see https://www.gitmemory.com/issue/ethereum/web3.js/2665/687164093
  const web3 = await loadWeb3(dispatch)

  const account = await loadAccount(web3, dispatch)
  if(!account) {
    window.alert('Please login with Metamask.')
    return
  }
  const token = await loadToken(web3, dispatch)
  if(!token) {
    window.alert('Token Smart Contract not deployed to the current network. Please select another network with Metamask.')
    return
  }
  const exchange = await loadExchange(web3, dispatch)
  if(!exchange) {
    window.alert('Exchange Smart Contract not deployed to the current network. Please select another network with Metamask.')
    return
  }

  await loadBalances(web3, exchange, token, account, dispatch)

  return
}

export const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000"

export const DECIMALS = (10**18)

export const tokens = (wei) => {
  if(wei) {
    return(wei / DECIMALS)
  }
}

export const GREEN = 'success'

export const RED = 'danger'

export const formatBalance = (balance) => {
  const precision = 100 // 2 Decimals
  balance = tokens(balance)
  balance = Math.round(balance * precision) / precision
  return balance
}
