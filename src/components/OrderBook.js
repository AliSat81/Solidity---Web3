import React, { Component } from 'react'
import { OverlayTrigger , Tooltip } from 'react-bootstrap'
import { connect } from 'react-redux'
import { 
    orderBookSelector ,
    orderBookLoadedSelector ,
    orderFillingSelector ,
    exchangeSelector ,
    accountSelector 
    } from '../store/selectors'
import Spinner from './Spinner'
import { fillOrder } from '../store/intractions'

const renderOrder = (order ,props) => {
    const { dispatch ,exchange ,account } = props
    return (
        <OverlayTrigger 
            key={order._id}
            overlay={
                <Tooltip id={order._id} className="position-absolute">
                Click here to <strong>{order.orderFillAction}</strong>
                </Tooltip>
            }
            >
        <tr key={order._id}
                className ='order-book-order '
                onClick ={ e =>{
                    fillOrder(dispatch ,exchange ,order ,account)
                }}
                >
            <td >{order.tokenAmount}</td>
            <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
            <td >{order.etherAmount}</td>
        </tr>
         </OverlayTrigger> 
    )
}

const showOrderBook = (props) => {
    const {orderBook} = props
    return(
            <tbody>
                { orderBook.sellOrders.map(order => renderOrder(order ,props ))}
                <tr>
                    <th >DAPP</th>
                    <th >DAPP/ETH</th>
                    <th >ETH</th>
                </tr>
                { orderBook.buyOrders.map(order => renderOrder(order ,props ))}
            </tbody>
    )
}

class OrderBook extends Component {
  render() {
    return (
    <div className="vertical">
        <div className="card bg-dark text-white">
            <div className="card-header">
                <strong>Order Book</strong>
            </div>
            <div className="card-body order-book" style={{marginTop: '5px',marginBottom: '5px',marginLeft: '10px',marginRight: '10px'}}>
                <table className='tabale table-dark table-sm' style={{width:'100%'}}>
                    {this.props.showOrderBook ? showOrderBook(this.props) : <Spinner type='table'/>}
                </table>
            </div>
        </div>
    </div>
    )
  }
}

function mapStateToProps(state){
    const orderBookLoaded = orderBookLoadedSelector(state)
    const orderFilling = orderFillingSelector(state)
    return{
        orderBook : orderBookSelector(state) ,
        showOrderBook : orderBookLoaded && !orderFilling ,
        exchange : exchangeSelector(state) ,
        account : accountSelector(state) 

    }
}

export default connect(mapStateToProps)(OrderBook)