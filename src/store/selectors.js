import { get, reject, groupBy } from 'lodash'
import moment from 'moment'
import { createSelector } from 'reselect'
import { GREEN, RED, ETHER_ADDRESS, tokens } from '../helpers'

// Accounts and Smart Contracts
const account = state => get(state, 'web3.account')
export const accountSelector = createSelector(account, a => a)

const tokenLoaded = state => get(state, 'token.loaded', false)
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl)

const exchangeLoaded = state => get(state, 'exchange.loaded', false)
export const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el)

const exchange = state => get(state, 'exchange.contract', false)
export const exchangeSelector = createSelector(exchange, e => e)

export const contractsLoadedSelector = createSelector(
	tokenLoaded,
	exchangeLoaded,
	(tl, el) => (tl && el)
)

// All Orders
const allOrdersLoaded = state => get(state, 'exchange.allOrders.loaded', false)
const allOrders = state => get(state, 'exchange.allOrders.data', [])

// Cancelled Orders
const cancelledOrdersLoaded = state => get(state, 'exchange.cancelledOrders.loaded', false)
export const cancelledOrdersLoadedSelector = createSelector(cancelledOrdersLoaded, loaded => loaded)

const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
export const cancelledOrdersSelector = createSelector(cancelledOrders, o => o)

// Filled Orders
const filledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false)
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

const filledOrders = state => get(state, 'exchange.filledOrders.data', [])
export const filledOrdersSelector = createSelector(
	filledOrders,
	(orders) => {
		orders = orders.sort((a,b) => a._timestamp - b._timestamp) // ascending for price comparison
		orders = decorateFilledOrders(orders)
		orders = orders.sort((a,b) => b._timestamp - a._timestamp) // descending for display
		return orders
	}
)

// My Filled Orders
export const myFilledOrdersSelector = createSelector(
	account,
	filledOrders,
	(account, orders) => {
		orders = orders.filter((o) => o._user === account || o._userFill === account)
		orders = orders.sort((a,b) => a._timestamp - b._timestamp)
		orders = decorateMyFilledOrders(orders, account)
		return orders
	}
)

// Order Book
const openOrders = state => {
	const all = allOrders(state)
	const cancelled = cancelledOrders(state)
	const filled = filledOrders(state)

	const openOrders = reject(all, (order) => {
		const orderFilled = filled.some((o) => o._id === order._id)
		const orderCancelled = cancelled.some((o) => o._id === order._id)
		return(orderFilled || orderCancelled)
	})

	return openOrders
}

const orderBookLoaded = state => cancelledOrdersLoaded(state) && filledOrdersLoaded(state) && allOrdersLoaded(state)
export const orderBookLoadedSelector = createSelector(orderBookLoaded, loaded => loaded)

export const orderBookSelector = createSelector(
	openOrders,
	(orders) => {
		orders = decorateOrderBookOrders(orders)
		orders = groupBy(orders, 'orderType')
		const buyOrders = get(orders, 'buy', [])
		const sellOrders = get(orders, 'sell', [])
		orders = {
			...orders,
			buyOrders: buyOrders.sort((a,b) => b.tokenPrice - a.tokenPrice),
			sellOrders: sellOrders.sort((a,b) => a.tokenPrice - b.tokenPrice)
		}
		return orders
	}
)

// My Open Orders
export const myOpenOrdersSelector = createSelector(
	account,
	openOrders,
	(account, orders) => {
		orders = orders.filter((o) => o._user === account)
		orders = orders.sort((a,b) => a._timestamp - b._timestamp)
		orders = decorateMyOpenOrders(orders)
		return orders
	}
)

// Decorate Filled Orders
const decorateFilledOrders = (orders) => {
	let previousOrder = orders[0] // Track previous order
	return (
		orders.map((order) => {
			order = decorateOrder(order)
			order = decorateFilledOrder(order, previousOrder)
			previousOrder = order // Update previous order once decorated
			return order
		})
	)
}

const decorateFilledOrder = (order, previousOrder) => {
	return ({
		...order,
		tokenPriceClass: tokenPriceClass(order.tokenPrice, order._id, previousOrder)
	})
}

// Decorate My Filled orders
const decorateMyFilledOrders = (orders, account) => {
	return(
		orders.map((order) => {
			order = decorateOrder(order)
			order = decorateMyFilledOrder(order, account)
			return order
		})
	)
}

const decorateMyFilledOrder  = (order, account) => {
	let orderType

	if(order._user === account) {
		orderType = order._tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
	} else {
		orderType = order._tokenGive === ETHER_ADDRESS ? 'sell' : 'buy'
	}

	return({
		...order,
		orderType,
		orderTypeClass: (orderType === 'buy' ? GREEN : RED),
		orderSign: (orderType === 'buy' ? '+' : '-')
	})
}

// Decorate My Open Orders
const decorateMyOpenOrders = (orders) => {
	return(
		orders.map((order) => {
			order = decorateOrder(order)
			order = decorateMyOpenOrder(order)
			return order
		})
	)
}

const decorateMyOpenOrder = (order) => {
	let orderType = (order._tokenGive === ETHER_ADDRESS ? 'buy' : 'sell')

	return({
		...order,
		orderType,
		orderTypeClass: (orderType === 'buy' ? GREEN : RED)
	})
}

// Decorate Order Books Orders
const decorateOrderBookOrders = (orders) => {
	return(
		orders.map((order) => {
			order = decorateOrder(order)
			order = decorateOrderBookOrder(order)
			return order
		})
	)
}

const decorateOrderBookOrder = (order) => {
	const orderType = order._tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
	return({
		...order,
		orderType,
		orderTypeClass: (orderType === 'buy' ? GREEN : RED),
		orderFillClass: (orderType === 'buy' ? 'sell' : 'buy')
	})
}

// Decorate
const decorateOrder = (order) => {
	let etherAmount
	let tokenAmount

	if(order._tokenGive === ETHER_ADDRESS) {
		etherAmount = order._amountGive
		tokenAmount = order._amountGet
	} else {
		etherAmount = order._amountGet
		tokenAmount = order._amountGive
	}

	const precision = 100000 // 5 decimals
	let tokenPrice = (etherAmount / tokenAmount)
	tokenPrice = Math.round(tokenPrice * precision) / precision

	return ({
		...order,
		etherAmount: tokens(etherAmount),
		tokenAmount: tokens(tokenAmount),
		tokenPrice,
		formattedTimestamp: moment.unix(order._timestamp).format('h:mm:ss a M/D')
	})
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
	if (previousOrder._id === orderId) {
		return GREEN
	} else if (previousOrder.tokenPrice <= tokenPrice) {
		return GREEN
	} else {
		return RED
	}
}
