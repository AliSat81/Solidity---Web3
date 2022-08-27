import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Chart from 'react-apexcharts'
import { chartOptions } from './PriceChart.config'
import { priceChartLoadedSelector , priceChartSelector } from '../store/selectors'
import Spinner from './Spinner'

const priceSymbol = (lastPriceChange ,lastPrice) => {
    let output 
    if(lastPriceChange === '+'){
        output=<span className='text-success'>&emsp;&#9650;<strong>{' '+lastPrice}</strong></span>
    }else {
        output=<span className='text-danger'>&emsp;&#9660;<strong>{' '+lastPrice}</strong></span>
    }        
    return output

}
const showPriceChart =(priceChart) => {
    return(
        <Fragment>
        <div className="card-header">
            <div style={{width: '30%' ,float: 'left'}} >
                <strong>Price Chart</strong>
            </div>
            <div className='text-white text-end' style={{width: '70%', float: 'right' ,paddingRight: '10px'}}>
                {'DAPP/ETH'}{priceSymbol(priceChart.lastPriceChange, priceChart.lastPrice)}
            </div>
        </div>
        <Chart className='price-chart' options={chartOptions} series={priceChart.series} type='candlestick' width='98%' height='85%'/>
        </Fragment>
    )
}

class PriceChart extends Component {
  render() {
    return (
    <div className="card bg-dark text-white">
        {this.props.priceChartLoaded ? showPriceChart(this.props.priceChart) : <Spinner />}
    </div>
    )
  }
}

function mapStateToProps(state){
    return{
        priceChartLoaded : priceChartLoadedSelector(state),
        priceChart : priceChartSelector(state)
    }
}
export default connect(mapStateToProps)(PriceChart)