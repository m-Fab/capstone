import Web3 from 'web3'
import Token from '../abis/Token.json'
import Exchange from '../abis/Exchange.json'
import { 
	web3Loaded,
	web3AccountLoaded,
	tokenLoaded,
	exchangeLoaded
} from './actions'

export const loadWeb3 = (dispatch) => {
	if(typeof window.ethereum!=='undefined') {
		const web3 = new Web3(Web3.givenProvider || 'HTTP://127.0.0.1:7545');
		dispatch(web3Loaded(web3))
		return web3
	} else {
		window.alert('Please install Metamask')
		window.location.assign("https://metamask.io/")
		return null
	}
}

export const loadAccount = async (web3, dispatch) => {
	const accounts = await web3.eth.getAccounts()
	const account = accounts[0]
	if(typeof account !== 'undefined') {
		dispatch(web3AccountLoaded(account))
		return account
	} else {
		window.alert('Please login with Metamask')
		return null
	}
	
}

export const loadToken = async (web3, dispatch) => {
	try {
		var Contract = require('web3-eth-contract');
	  const networkId = await web3.eth.net.getId();
	  const network = await Token.networks[networkId].address;
	  var contract = new Contract(Token.abi, network);
	  dispatch(tokenLoaded(contract))
		return contract
	} catch(err) {
		window.alert('Contract not deployed to the current network. Please select another network with Metamask.')
		return null
	}
}

export const loadExchange = async (web3, dispatch) => {
	try {
		var Contract = require('web3-eth-contract');
	  const networkId = await web3.eth.net.getId();
	  const network = await Exchange.networks[networkId].address;
	  var contract = new Contract(Exchange.abi, network);
	  dispatch(exchangeLoaded(contract))
		return contract
	} catch(err) {
		window.alert('Contract not deployed to the current network. Please select another network with Metamask.')
		return null
	}
}
