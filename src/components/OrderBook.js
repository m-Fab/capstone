import React, { Component } from 'react'
import { connect } from 'react-redux'
import Spinner from './Spinner'
import {
  orderBookSelector,
  orderBookLoadedSelector
} from '../store/selectors'

const showOrderBook = (orderBook) => {
  return(
    <tbody>
      { orderBook.sellOrders.map((order) => renderOrder(order)) }
      <tr>
        <th>FMFP</th>
        <th>FMFP/ETH</th>
        <th>ETH</th>
      </tr>
      { orderBook.buyOrders.map((order) => renderOrder(order)) }
    </tbody>
  )
}

const renderOrder = (order) => {
  return(
    <tr key={ order._id }>
      <td>{ order.tokenAmount }</td>
      <td className={ `text-${ order.orderTypeClass }` }>{ order.tokenPrice }</td>
      <td>{ order.etherAmount }</td>
    </tr>
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
              { this.props.showOrderBook ? showOrderBook(this.props.orderBook) : <Spinner type="table" /> }
            </table>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    orderBook: orderBookSelector(state),
    showOrderBook: orderBookLoadedSelector(state)
  }
}

export default connect(mapStateToProps)(OrderBook)