import React, { Component } from 'react'
import { connect } from 'react-redux'
import Web3 from 'web3' // Not needed if using Redux (which is not working in local...)
import Spinner from './Spinner'
import { Tabs, Tab } from 'react-bootstrap'
import {
  // web3Selector, // - see https://www.gitmemory.com/issue/ethereum/web3.js/2665/687164093
  exchangeSelector,
  tokenSelector,
  accountSelector,
  buyOrderSelector,
  sellOrderSelector
} from '../store/selectors'
import { 
  buyOrderAmountChanged,
  sellOrderAmountChanged,
  buyOrderPriceChanged,
  sellOrderPriceChanged
} from '../store/actions'
import { 
  makeBuyOrder,
  makeSellOrder
} from '../store/interactions'

const showForm = (props) => {
  // Redux not working in local - see https://www.gitmemory.com/issue/ethereum/web3.js/2665/687164093
  const web3 = new Web3(Web3.givenProvider || 'HTTP://127.0.0.1:7545')
  const { 
    exchange,
    token,
    account,
    buyOrder,
    sellOrder,
    showBuyTotal,
    showSellTotal,
    dispatch
  } = props

  return(
    <Tabs defaultActiveKey="buy" className="tab-dark text-white">
      <Tab eventKey="buy" title="Buy">
        <form onSubmit={(event) => {
          event.preventDefault()
          makeBuyOrder(web3, exchange, token, account, buyOrder, dispatch)
        }}>
          <div className="form-group small">
            <label>Buy Amount (FMFP)</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-sm bg-dark text-white"
                placeholder="Buy Amount"
                onChange={ (e) => dispatch(buyOrderAmountChanged( e.target.value )) }
                required
              />
            </div>
          </div>
          <div className="form-group small">
            <label>Buy Price</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-sm bg-dark text-white"
                placeholder="Buy Price"
                onChange={ (e) => dispatch(buyOrderPriceChanged( e.target.value )) }
                required
              />
            </div>
          </div>
          <div><button type="submit" className="btn btn-custom-dark btn-sm btn-block text-white">Buy Order</button></div>
          { showBuyTotal ? <div><small>Total: {buyOrder.amount * buyOrder.price} ETH</small></div> : null }
        </form>
      </Tab>
      <Tab eventKey="sell" title="Sell">
        <form onSubmit={(event) => {
          event.preventDefault()
          makeSellOrder(web3, exchange, token, account, sellOrder, dispatch)
        }}>
          <div className="form-group small">
            <label>Sell Amount (FMFP)</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-sm bg-dark text-white"
                placeholder="Sell Amount"
                onChange={ (e) => dispatch(sellOrderAmountChanged( e.target.value )) }
                required
              />
            </div>
          </div>
          <div className="form-group small">
            <label>Sell Price</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-sm bg-dark text-white"
                placeholder="Sell Price"
                onChange={ (e) => dispatch(sellOrderPriceChanged( e.target.value )) }
                required
              />
            </div>
          </div>
          <div><button type="submit" className="btn btn-custom-dark btn-sm btn-block text-white">Sell Order</button></div>
          { showSellTotal ? <div><small>Total: {sellOrder.amount * sellOrder.price} ETH</small></div> : null }
        </form>
      </Tab>
    </Tabs>
  )
}

class NewOrder extends Component {
  render() {
    return (
      <div className="card text-white">
        <div className="card-header">
          New Order
        </div>
        <div className="card-body">
          { this.props.showForm ? showForm(this.props) : <Spinner /> }
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const buyOrder = buyOrderSelector(state)
  const sellOrder = sellOrderSelector(state)

  return {
    // web3: web3Selector(state), // - see https://www.gitmemory.com/issue/ethereum/web3.js/2665/687164093
    exchange: exchangeSelector(state),
    token: tokenSelector(state),
    account: accountSelector(state),
    buyOrder,
    sellOrder,
    showForm: (!buyOrder.making && !sellOrder.making),
    showBuyTotal: (buyOrder.amount && buyOrder.price),
    showSellTotal: (sellOrder.amount && sellOrder.price)
  }
}

export default connect(mapStateToProps)(NewOrder)