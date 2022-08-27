import { Tabs ,Tab } from 'react-bootstrap'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { 
    exchangeSelector ,
    accountSelector ,
    web3Selector ,
    buyOrderSelector ,
    sellOrderSelector,
    tokenSelector
   } from '../store/selectors'
import { 
    buyOrderAmountChanged , 
    //buyOrderMaking, 
    buyOrderPriceChanged , 
    sellOrderAmountChanged , 
    //sellOrderMaking, 
    sellOrderPriceChanged
    } from '../store/actions'
    import { makeBuyOrder , makeSellOrder } from '../store/intractions'
import Spinner from './Spinner'

const showForm = props => {
    const {
        dispatch ,
        buyOrder ,
        exchange ,
        token ,
        web3 ,
        account ,
        sellOrder 
    } = props
    return (
        <Tabs defaultActiveKey = 'buy' className='bg-dark mb-3' justify>
            <Tab eventKey='buy' title='Buy' className='bg-dark'>
                <form   onSubmit={(e)=>{
                        e.preventDefault()
                        makeBuyOrder(dispatch ,exchange ,token ,web3 ,buyOrder ,account)
                    }}>
                <div className='form-group small'>
                    <label>Buy Amount (DAPP)</label>
                    <div className='input-group'>
                        <input 
                        type='number'
                        step='0.01'
                        className='form-control form-control-sm bg-dark text-white'
                        placeholder='Buy Amount'
                        onChange={(e)=> dispatch( buyOrderAmountChanged (e.target.value))}
                        required
                        />
                    </div>
                    <label>Buy Price</label>
                    <div className='input-group'>
                        <input 
                        type='number'
                        step='0.00001'
                        className='form-control form-control-sm bg-dark text-white'
                        placeholder='Buy Price'
                        onChange={(e)=> dispatch( buyOrderPriceChanged (e.target.value))}
                        required
                        />
                    </div>
                    <small>Total : <strong>{(buyOrder.amount >=0 && buyOrder.price >=0 ? buyOrder.amount * buyOrder.price : '0' )}</strong> ETH</small>
                </div>
                <div className="d-grid gap-2">
                    <button type='submit' className='btn btn-outline-success btn-sm btn-block' style={{marginTop:'12px'}}><strong>Submit Order</strong></button>
                </div>
                </form>
            </Tab>
            <Tab eventKey='sell' title='Sell' className='bg-dark'>
            <form   onSubmit={(e)=>{
                        e.preventDefault()
                        makeSellOrder(dispatch ,exchange ,token ,web3 ,sellOrder ,account)
                    }}>
                <div className='form-group small'>
                    <label>Sell Amount (DAPP)</label>
                    <div className='input-group'>
                        <input 
                        type='number'
                        step='0.01'
                        className='form-control form-control-sm bg-dark text-white'
                        placeholder='Sell Amount'
                        onChange={(e)=> dispatch( sellOrderAmountChanged (e.target.value))}
                        required
                        />
                    </div>
                    <label>Sell Price</label>
                    <div className='input-group'>
                        <input 
                        type='number'
                        step='0.00001'
                        className='form-control form-control-sm bg-dark text-white'
                        placeholder='Sell Price'
                        onChange={(e)=> dispatch( sellOrderPriceChanged (e.target.value))}
                        required
                        />
                    </div>
                    <small>Total : <strong>{(sellOrder.amount >=0 && sellOrder.price >=0 ? sellOrder.amount * sellOrder.price : '0' )}</strong> ETH</small>
                </div>
                <div className="d-grid gap-2">
                    <button type='submit' className='btn btn-outline-danger btn-sm btn-block' style={{marginTop:'12px'}}><strong>Submit Order</strong></button>
                </div>
                </form>
            </Tab>            
        </Tabs>
    )
}
class NewOrder extends Component {
  render() {
    return (
    <div className="card bg-dark text-white">
        <div className="card-header">
          <strong>New Order</strong>
        </div>
        <div className="card-body">
            {( !this.props.buyOrder.making && !this.props.buyOrder.making ? showForm(this.props) : <Spinner />)}
        </div>
    </div>
    )
  }
}
function mapStateToProps(state){
    const buyOrder = buyOrderSelector(state) 
    const sellOrder = sellOrderSelector(state)
    return{
        exchange : exchangeSelector(state) ,
        account : accountSelector(state) ,
        web3 : web3Selector(state) ,
        buyOrder ,
        sellOrder ,
        showForm : !buyOrder && !sellOrder ,
        token : tokenSelector(state)
    }
}
export default connect(mapStateToProps)(NewOrder)