import React, { Component } from 'react'
import { connect } from 'react-redux'
import Spinner from './Spinner'
import { Tabs, Tab } from 'react-bootstrap'
import {
  exchangeSelector,
  accountSelector
} from '../store/selectors/selectorsWeb3'
import {
  filledOrdersLoadedSelector,
  myFilledOrdersSelector,
  orderBookLoadedSelector,
  myOpenOrdersSelector,
  orderCancellingSelector
} from '../store/selectors/selectorsOrders'
import { cancelOrder } from '../store/interactions'

const showMyFilledOrders = (myFilledOrders) => {
  return(
    <tbody>
      { myFilledOrders.map((order) => {
        return(
          <tr key={order._id}>
            <td className="text-muted">{ order.formattedTimestamp }</td>
            <td className={ `text-${ order.orderTypeClass }` }>{ order.orderSign }{ order.tokenAmount }</td>
            <td className={ `text-${ order.orderTypeClass }` }>{ order.tokenPrice }</td>
          </tr>
        )
      }) }
    </tbody>
  )
}

const showMyOpenOrders = (props) => {
  const { exchange, myOpenOrders, account, dispatch } = props
  return(
    <tbody>
      { myOpenOrders.map((order) => {
        return(
          <tr key={order._id}>
            <td className={ `text-${ order.orderTypeClass }` }>{ order.tokenAmount }</td>
            <td className={ `text-${ order.orderTypeClass }` }>{ order.tokenPrice }</td>
            <td className="text-muted cancel-order"
                onClick={(e) => {
                  cancelOrder(exchange, order, account, dispatch)
                }}
            >X</td>
          </tr>
        )
      }) }
    </tbody>
  )
}

class MyTransactions extends Component {
  render() {
    return (
      <div className="card text-white">
        <div className="card-header">
          My Transactions
        </div>
        <div className="card-body">
          <Tabs defaultActiveKey="trades" className="tab-dark text-white">
            <Tab eventKey="trades" title="Trades" className="tab-dark">
              <table className="table table-dark table-sm small">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>FMFP</th>
                    <th>FMFP/ETH</th>
                  </tr>
                </thead>
                { this.props.showMyFilledOrders ? showMyFilledOrders(this.props.myFilledOrders) : <Spinner type="table" /> }
              </table>
            </Tab>
            <Tab eventKey="orders" title="Orders" className="tab-dark">
              <table className="table table-dark table-sm small">
                <thead>
                  <tr>
                    <th>Amount</th>
                    <th>FMFP/ETH</th>
                    <th>Cancel</th>
                  </tr>
                </thead>
                { this.props.showMyOpenOrders ? showMyOpenOrders(this.props) : <Spinner type="table" /> }
              </table>
            </Tab>
          </Tabs>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const myOpenOrdersLoaded = orderBookLoadedSelector(state)
  const orderCancelling = orderCancellingSelector(state)

  return {
    myFilledOrders: myFilledOrdersSelector(state),
    showMyFilledOrders: filledOrdersLoadedSelector(state),
    myOpenOrders: myOpenOrdersSelector(state),
    showMyOpenOrders: (myOpenOrdersLoaded && !orderCancelling),
    exchange: exchangeSelector(state),
    account: accountSelector(state)
  }
}

export default connect(mapStateToProps)(MyTransactions)