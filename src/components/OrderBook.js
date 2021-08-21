import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'
import Spinner from './Spinner'
import { fillOrder } from '../store/interactions'
import {
  orderBookSelector,
  orderBookLoadedSelector,
  orderFillingSelector
} from '../store/selectors/selectorsOrders'
import {
  exchangeSelector,
  accountSelector
} from '../store/selectors/selectorsWeb3'

const showOrderBook = (props) => {
  const { orderBook } = props
  return(
    <tbody>
      { orderBook.sellOrders.map((order) => renderOrder(order, props)) }
      <tr>
        <th>FMFP</th>
        <th>FMFP/ETH</th>
        <th>ETH</th>
      </tr>
      { orderBook.buyOrders.map((order) => renderOrder(order, props)) }
    </tbody>
  )
}

const renderOrder = (order, props) => {
  const { exchange, account, dispatch } = props
  return(
    <OverlayTrigger
      key={ order._id }
      placement='top'
      overlay={
        <Tooltip id={ order._id }>
          { `Click here to ${ order.orderFillAction }` }
        </Tooltip>
      }
    >
      <tr 
        key={ order._id }
        className="order-book-order"
        onClick={
          (e) => fillOrder(exchange, order, account, dispatch)
        }
      >
        <td>{ order.tokenAmount }</td>
        <td className={ `text-${ order.orderTypeClass }` }>{ order.tokenPrice }</td>
        <td>{ order.etherAmount }</td>
      </tr>
    </OverlayTrigger>
  )
}

class OrderBook extends Component {
  render() {
    return (
      <div className="vertical">
        <div className="card text-white">
          <div className="card-header">
            Order Book
          </div>
          <div className="card-body">
            <table className="table table-dark table-sm small">
              { this.props.showOrderBook ? showOrderBook(this.props) : <Spinner type="table" /> }
            </table>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const orderBookLoaded = orderBookLoadedSelector(state)
  const orderFilling = orderFillingSelector(state)

  return {
    orderBook: orderBookSelector(state),
    showOrderBook: (orderBookLoaded && !orderFilling),
    exchange: exchangeSelector(state),
    account: accountSelector(state)
  }
}

export default connect(mapStateToProps)(OrderBook)