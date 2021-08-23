import React, { Component } from 'react'
import { connect } from 'react-redux'
import Spinner from './Spinner'
import { 
  filledOrdersSelector,
  filledOrdersLoadedSelector
} from '../store/selectors/selectorsOrders'

const showFilledOrders = (filledOrders) => {
  return(
    <tbody>
      { filledOrders.map((order) => {
        return(
          <tr className={ `order-${order._id}` } key={ order._id }>
            <td className='text-muted'>{ order.formattedTimestamp }</td>
            <td>{ order.tokenAmount }</td>
            <td className={ `text-${ order.tokenPriceClass }` }>{ order.tokenPrice }</td>
          </tr>
        )
      }) }
    </tbody>
  )
}

class Trades extends Component {
  render() {
    return (
      <div className="vertical">
        <div className="card text-white">
          <div className="card-header">
            Trades
          </div>
          <div className="card-body">
            <table className="table table-dark table-sm small">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>FMFP</th>
                  <th>FMFP/ETH</th>
                </tr>
              </thead>
              { this.props.filledOrdersLoaded ? showFilledOrders(this.props.filledOrders) : <Spinner type="table" /> }
            </table>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    filledOrdersLoaded: filledOrdersLoadedSelector(state),
    filledOrders: filledOrdersSelector(state),
  }
}

export default connect(mapStateToProps)(Trades)
