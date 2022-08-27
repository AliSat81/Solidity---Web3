import React, { Component } from 'react'
import {connect} from 'react-redux'
import Spinner from './Spinner'
import {
    filledOrdersLoadedSelector , 
    filledOrdersSelector,
    orderFillingSelector

} from '../store/selectors'

const showFilledOlders =(filledOrders)=>{
    return(
            <tbody className="table-group-divider">
                    {filledOrders.map((order)=>{
                        return (
                            <tr className={`order-${order._id}`} key={order._id}>
                            <td className='text-muted align-middle'>{order.formattedTimestamp2}</td>
                            <td className='align-middle'>{order.tokenAmount}</td>
                            <td className={`align-middle text-${order.tokenPriceClass}`}>{order.tokenPrice}</td>
                            </tr>
                        )
                    })}
            </tbody>
    )
}
class Trades extends Component {
  render() {
    return (
    <div className="vertical">
        <div className="card bg-dark text-white">
            <div className="card-header">
                <strong>Trades</strong>
            </div>
            <div className="card-body">
                <table className="table table-dark table-striped ">
                    <thead>
                        <tr>
                        <th scope="col">Time</th>
                        <th scope="col">DAPP</th>
                        <th scope="col">DAPP/ETH</th>
                        </tr>
                    </thead>
                    { this.props.filledOrdersLoaded  ? showFilledOlders(this.props.filledOrders) : <Spinner type='table'/> }{/*&& !this.props.orderFilling*/}
                </table>
            </div>
        </div>
    </div>
    )
  }
}


function mapStateToProps(state){
    return{
        filledOrdersLoaded : filledOrdersLoadedSelector(state),
        filledOrders : filledOrdersSelector(state),
        orderFilling : orderFillingSelector(state)
    }
}


export default connect(mapStateToProps)(Trades)

