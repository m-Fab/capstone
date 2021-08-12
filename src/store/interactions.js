import Web3 from 'web3'
import Token from '../abis/Token.json'
import Exchange from '../abis/Exchange.json'
import { ETHER_ADDRESS } from '../helpers'
import { 
	web3Loaded,
	web3AccountLoaded,
	tokenLoaded,
	exchangeLoaded,
	cancelledOrdersLoaded,
	filledOrdersLoaded,
	allOrdersLoaded,
	orderCancelling,
	orderCancelled,
	orderFilling,
	orderFilled,
	etherBalanceLoaded,
	tokenBalanceLoaded,
	exchangeEtherBalanceLoaded,
	exchangeTokenBalanceLoaded,
	balancesLoaded,
	balancesLoading,
	buyOrderMaking,
	sellOrderMaking,
	orderMade
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
		console.error(error)
		window.alert('There was an error for cancelling!')
	})
}

export const fillOrder = (exchange, order, account, dispatch) => {
	exchange.methods.fillOrder(order._id).send({ from: account })
	.on('transactionHash', (hash) => {
		dispatch(orderFilling())
	})
	.on('error', (error) => {
		console.error(error)
		window.alert('There was an error for filling!')
	})
}

export const loadBalances = async (web3, exchange, token, account, dispatch) => {
	if(typeof account !== 'undefined') {
		const etherBalance = await web3.eth.getBalance(account)
		dispatch(etherBalanceLoaded(etherBalance))

		const tokenBalance = await token.methods.balanceOf(account).call()
		dispatch(tokenBalanceLoaded(tokenBalance))

		const exchangeEtherBalance = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call()
		dispatch(exchangeEtherBalanceLoaded(exchangeEtherBalance))

		const exchangeTokenBalance = await exchange.methods.balanceOf(token.options.address, account).call()
		dispatch(exchangeTokenBalanceLoaded(exchangeTokenBalance))

		dispatch(balancesLoaded())
	} else {
		window.alert('Please login with Metamask')
	}
}

export const depositEther = async (web3, exchange, token, account, amount, dispatch) => {
	exchange.methods.depositEther().send({ from: account, value: web3.utils.toWei(amount, 'ether') })
	.on('transactionHash', (hash) => {
		dispatch(balancesLoading())
	})
	.on('error', (error) => {
		console.error(error)
		window.alert('There was an error while depositing!')
	})
}

export const withdrawEther = async (web3, exchange, token, account, amount, dispatch) => {
	exchange.methods.withdrawEther(web3.utils.toWei(amount, 'ether')).send({ from: account })
	.on('transactionHash', (hash) => {
		dispatch(balancesLoading())
	})
	.on('error', (error) => {
		console.error(error)
		window.alert('There was an error while withdrawing!')
	})
}

export const depositToken = async (web3, exchange, token, account, amount, dispatch) => {
	amount = web3.utils.toWei(amount, 'ether')

	token.methods.approve(exchange.options.address, amount).send({ from: account })
	.on('transactionHash', (hash) => {
		exchange.methods.depositToken(token.options.address, amount).send({ from: account })
		.on('transactionHash', (hash) => {
			dispatch(balancesLoading())
		})
		.on('error', (error) => {
			console.error(error)
			window.alert('There was an error while depositing!')
		})
	})
}

export const withdrawToken = async (web3, exchange, token, account, amount, dispatch) => {
	exchange.methods.withdrawToken(token.options.address, web3.utils.toWei(amount, 'ether')).send({ from: account })
	.on('transactionHash', (hash) => {
		dispatch(balancesLoading())
	})
	.on('error', (error) => {
		console.error(error)
		window.alert('There was an error while withdrawing!')
	})
}

export const makeBuyOrder = async (web3, exchange, token, account, order, dispatch) => {
	const tokenGet = token.options.address
	const amountGet = web3.utils.toWei(order.amount, 'ether')
	const tokenGive = ETHER_ADDRESS
	const amountGive = web3.utils.toWei((order.amount * order.price).toString(), 'ether')

	exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({ from: account })
	.on('transactionHash', (hash) => {
		dispatch(buyOrderMaking())
	})
	.on('error', (error) => {
		console.error(error)
		window.alert('There was an error while making buy order!')
	})
}

export const makeSellOrder = async (web3, exchange, token, account, order, dispatch) => {
	const tokenGet = ETHER_ADDRESS
	const amountGet = web3.utils.toWei((order.amount * order.price).toString(), 'ether')
	const tokenGive = token.options.address
	const amountGive = web3.utils.toWei(order.amount, 'ether')

	exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({ from: account })
	.on('transactionHash', (hash) => {
		dispatch(sellOrderMaking())
	})
	.on('error', (error) => {
		console.error(error)
		window.alert('There was an error while making sell order!')
	})
}

export const subscribeToEvents = async (exchange, dispatch) => {
	exchange.events.Cancel({}, (error, event) => {
		dispatch(orderCancelled(event.returnValues))
	})
	.on('error', (error) => {
		console.error(error)
		window.alert('There was an error while subscribing to Cancel event!')
	})

	exchange.events.Trade({}, (error, event) => {
		dispatch(orderFilled(event.returnValues))
	})
	.on('error', (error) => {
		console.error(error)
		window.alert('There was an error while subscribing to Trade event!')
	})

	exchange.events.Deposit({}, (error, event) => {
		dispatch(balancesLoaded())
	})
	.on('error', (error) => {
		console.error(error)
		window.alert('There was an error while subscribing to Deposit event!')
	})

	exchange.events.Withdraw({}, (error, event) => {
		dispatch(balancesLoaded())
	})
	.on('error', (error) => {
		console.error(error)
		window.alert('There was an error while subscribing to Withdraw event!')
	})

	exchange.events.Order({}, (error, event) => {
		dispatch(orderMade(event.returnValues))
	})
	.on('error', (error) => {
		console.error(error)
		window.alert('There was an error while subscribing to Order event!')
	})
}