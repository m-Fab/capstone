import Web3 from 'web3'
import Token from '../abis/Token.json'
import Exchange from '../abis/Exchange.json'
import { 
	web3Loaded,
	web3AccountLoaded,
	tokenLoaded,
	exchangeLoaded,
	cancelledOrdersLoaded,
	filledOrdersLoaded,
	allOrdersLoaded,
	orderCancelling,
	orderCancelled
} from './actions'

export const loadWeb3 = (dispatch) => {
	if(typeof window.ethereum!=='undefined') {
		const web3 = new Web3(Web3.givenProvider || 'HTTP://127.0.0.1:7545')
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
		console.log('Please login with Metamask')
		return null
	}
	
}

export const loadToken = async (web3, dispatch) => {
	try {
		var Contract = require('web3-eth-contract')
		Contract.setProvider('HTTP://127.0.0.1:7545')
	  const networkId = await web3.eth.net.getId()
	  const network = await Token.networks[networkId].address
	  var contract = new Contract(Token.abi, network)
	  dispatch(tokenLoaded(contract))
		return contract
	} catch(err) {
		console.log('Contract not deployed to the current network. Please select another network with Metamask.')
		return null
	}
}

export const loadExchange = async (web3, dispatch) => {
	try {
		var Contract = require('web3-eth-contract')
		Contract.setProvider('HTTP://127.0.0.1:7545')
	  const networkId = await web3.eth.net.getId()
	  const network = await Exchange.networks[networkId].address
	  var contract = new Contract(Exchange.abi, network)
	  dispatch(exchangeLoaded(contract))
		return contract
	} catch(err) {
		console.log('Contract not deployed to the current network. Please select another network with Metamask.')
		return null
	}
}

export const loadAllOrders = async (exchange, dispatch) => {
	// Cancelled Orders
	const cancelStream = await exchange.getPastEvents('Cancel', { fromBlock: 0, toBlock: 'latest' })
	const cancelledOrders = cancelStream.map((event) => event.returnValues)
	dispatch(cancelledOrdersLoaded(cancelledOrders))

	// Traded Orders
	const tradeStream = await exchange.getPastEvents('Trade', { fromBlock: 0, toBlock: 'latest' })
	const filledOrders = tradeStream.map((event) => event.returnValues)
	dispatch(filledOrdersLoaded(filledOrders))

	// All Orders
	const orderStream = await exchange.getPastEvents('Order', { fromBlock: 0, toBlock: 'latest' })
	const allOrders = orderStream.map((event) => event.returnValues)
	dispatch(allOrdersLoaded(allOrders))
}

export const cancelOrder = (exchange, order, account, dispatch) => {
	exchange.methods.cancelOrder(order._id).send({ from: account })
	.on('transactionHash', (hash) => {
		dispatch(orderCancelling())
	})
	.on('error', (error) => {
		console.log(error)
		window.alert('There was an error for cancelling!')
	})
}

export const subscribeToEvents = async (exchange, dispatch) => {
	exchange.events.Cancel({}, (error, event) => {
		dispatch(orderCancelled(event.returnValues))
	})
	.on('error', (error) => {
		console.log(error)
		window.alert('There was an error while subscribing to cancelling event!')
	})
}
