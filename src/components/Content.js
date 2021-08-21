import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loadAllOrders, subscribeToEvents } from '../store/interactions'
import {
  web3Selector,
  exchangeSelector,
  tokenSelector,
  accountSelector
} from '../store/selectors/selectorsWeb3'
import Trades from './Trades'
import OrderBook from './OrderBook'
import MyTransactions from './MyTransactions'
import PriceChart from './PriceChart'
import Balance from './Balance'
import NewOrder from './NewOrder'

class Content extends Component {
  componentDidMount() {
    this.loadBlockchainData(this.props)
  }

  async loadBlockchainData(props) {
    const { web3, exchange, token, account, dispatch } = props
    await loadAllOrders(exchange, dispatch)
    await subscribeToEvents(web3, exchange, token, account, dispatch) // Not working in local (ganache) with web3 +1.* * see https://github.com/trufflesuite/ganache-cli/issues/257
  }

  render() {
    return (
      <div className="content">

        <div className="vertical-split">
          <Balance />
          <NewOrder />
        </div>

        <OrderBook />

        <div className="vertical-split">
          <PriceChart />
          <MyTransactions />
        </div>

        <Trades />

      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    web3: web3Selector(state),
    exchange: exchangeSelector(state),
    token: tokenSelector(state),
    account: accountSelector(state)
  }
}

export default connect(mapStateToProps)(Content)
