import { get } from 'lodash'
import moment from 'moment'
import { createSelector } from 'reselect'
import { GREEN, RED, ETHER_ADDRESS, tokens } from '../helpers'

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

const decorateFilledOrder = (order, previousOrder) => {
	return ({
		...order,
		tokenPriceClass: tokenPriceClass(order.tokenPrice, order._id, previousOrder)
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