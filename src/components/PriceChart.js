import React, { Component } from 'react'
import Chart from 'react-apexcharts'
import Spinner from './Spinner'
import { connect } from 'react-redux'
import { chartOptions } from './PriceChart.config'
import {
  filledOrdersLoadedSelector,
  priceChartSelector
} from '../store/selectors/selectorsOrders'

const showPriceChart = (priceChart) => {
  return(
    <div className="price-chart">
      <div className="price">
        <h4>FMFP/ETH &nbsp; { priceSymbol(priceChart.lastPriceChange) } &nbsp; { priceChart.lastPrice }</h4>
      </div>
      <Chart options={chartOptions} series={priceChart.series} type='candlestick' width='100%' height='100%'/>
    </div>
  )
}

const priceSymbol = (lastPriceChange) => {
  let output
  if(lastPriceChange === '+') {
    output = <span className="text-success">&#9650;</span>
  } else {
    output = <span className="text-danger">&#9660;</span>
  }
  return output
}

class PriceChart extends Component {
  render() {
    return (
      <div className="card text-white">
        <div className="card-header">
          Price Chart
        </div>
        <div className="card-body">
          { this.props.priceChartLoaded ? showPriceChart(this.props.priceChart) : <Spinner /> }
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    priceChartLoaded: filledOrdersLoadedSelector(state),
    priceChart: priceChartSelector(state)
  }
}

export default connect(mapStateToProps)(PriceChart)