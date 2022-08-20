import React, { Component } from 'react'
import { loadAllOrders , subscribeToEvents } from '../store/intractions'
import {connect} from 'react-redux'
import { allOrdersLoadedSelector, balancesLoadingSelector, exchangeSelector , orderCancellingSelector, orderFillingSelector } from '../store/selectors' 
import Trades from './Trades'
import OrderBook from './OrderBook'
import Spinner from './Spinner'
import MyTransactions from './MyTransactions'
import PriceChart from './PriceChart'
import Balance from './Balance'
import NewOrder from './NewOrder'

class Content extends Component {
  componentWillMount(){
    this.loadBlockchainData(this.props)
  }
  async loadBlockchainData(props){    
    const { exchange , dispatch } = props
    // debugger
    await loadAllOrders( exchange , dispatch )
    await subscribeToEvents( exchange , dispatch )
  }
  render() {
    if(this.props.orderFilling || this.props.orderCancelling || this.props.balancesLoading){
      this.loadBlockchainData(this.props)
    }
    return (
        <div className="content">
            <div className="vertical-split">
              {this.props.allOrdersLoaded ? <Balance /> : <Spinner/>}
              {this.props.allOrdersLoaded ? <NewOrder /> : <Spinner/>}
            </div>
            {this.props.allOrdersLoaded ? <OrderBook /> : <Spinner/>}
            <div className="vertical-split">
              {this.props.allOrdersLoaded ? <PriceChart /> : <Spinner/>}
              {this.props.allOrdersLoaded  ? <MyTransactions /> : <Spinner/>}
            </div>
          <Trades />
        </div>
    )
  }
}

function mapStateToProps(state){
  return {
      exchange : exchangeSelector(state) ,
      allOrdersLoaded : allOrdersLoadedSelector(state) ,
      orderCancelling : orderCancellingSelector(state) ,
      orderFilling: orderFillingSelector(state) ,
      balancesLoading : balancesLoadingSelector(state)
  }
}

export default connect(mapStateToProps)(Content)