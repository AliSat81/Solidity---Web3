import { Tabs , Tab } from 'react-bootstrap'
import React, { Component } from 'react'
import { connect } from 'react-redux/es/exports'
import { 
    etherDepositAmountChanged , 
    etherWithdrawAmountChanged , 
    tokenDepositAmountChanged , 
    tokenWithdrawAmountChanged
} from '../store/actions'
import { 
    loadBalances , 
    depositEther , 
    withdrawEther ,
    depositToken ,
    withdrawToken
} from '../store/intractions'
import { 
    web3Selector , 
    exchangeSelector, 
    tokenSelector, 
    accountSelector, 
    etherBalanceSelector, 
    tokenBalanceSelector, 
    exchangeEtherBalanceSelector, 
    exchangeTokenBalanceSelector, 
    balancesLoadingSelector ,
    etherDepositAmountSelector  ,
    etherWithdrawAmountSelector ,
    tokenWithdrawAmountSelector ,
    tokenDepositAmountSelector
} from '../store/selectors'
import Spinner from './Spinner'
//TODO : Change Tabs background color
//       Use Rang Form for deposit and withdraw
const showForm = (props) => {
    const { 
        etherBalance ,
        tokenBalance ,
        exchangeEtherBalance ,
        exchangeTokenBalance ,
        dispatch , 
        etherDepositAmount ,
        etherWithdrawAmount ,
        tokenDepositAmount ,
        tokenWithdrawAmount ,
        exchange ,
        token ,
        account ,
        web3
    } = props
    return(
        <Tabs defaultActiveKey = 'deposit' className='bg-dark mb-3' justify>
            <Tab eventKey='deposit' title='Deposit' className='bg-dark'>
                <table className='table table-dark table-sm small'>
                    <thead>
                        <tr>
                            <th>Token</th>
                            <th>Wallet</th>
                            <th>Exchange</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>ETH</strong></td>
                            <td>{etherBalance}</td>
                            <td>{exchangeEtherBalance}</td>
                        </tr>
                    </tbody>
                </table>
                <form className='row' onSubmit={(event)=>{
                    event.preventDefault()
                    depositEther(dispatch ,exchange , web3,etherDepositAmount ,account)
                }}>
                    <div className='input-group mb-3'>{/*style={{marginBottom :'10px' , minHeight: '38px'}}}*/}
                        <input
                        type='number'
                        step="0.001"
                        //max='20'
                        placeholder='ETH Amount'
                        onChange={(e)=>dispatch(etherDepositAmountChanged(e.target.value))}
                        className="form-control bg-dark text-white"
                        required />
                        <button type='submit' className='btn btn-outline-success btn-block'><strong>Deposit</strong></button>
                    </div>
                </form>
                <table className='table table-dark table-sm small'>
                    <tbody>
                        <tr>
                            <td><strong>DAPP</strong></td>
                            <td>{tokenBalance}</td>
                            <td>{exchangeTokenBalance}</td>
                        </tr>
                    </tbody>
                </table>
                <form className='row' onSubmit={(event)=>{
                    event.preventDefault()
                    depositToken(dispatch ,exchange , web3, token, tokenDepositAmount, account)
                }}>
                    <div className='input-group mb-3'style={{marginBottom :'10px' , minHeight: '38px'}}>
                        <input
                        type='number'
                        step="0.001"
                        //max='20'
                        placeholder='DAPP Amount'
                        onChange={(e)=>dispatch(tokenDepositAmountChanged(e.target.value))}
                        className="form-control bg-dark text-white"
                        required />
                    <button type='submit' className='btn btn-outline-success btn-block'><strong>Deposit</strong></button>
                    </div>
                </form>
            </Tab>
            <Tab eventKey='withdraw' title='Withdraw' className='bg-dark'>
            <table className='table table-dark table-sm small'>
                    <thead>
                        <tr>
                            <th>Token</th>
                            <th>Wallet</th>
                            <th>Exchange</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>ETH</strong></td>
                            <td>{etherBalance}</td>
                            <td>{exchangeEtherBalance}</td>
                        </tr>
                    </tbody>
                </table>
                <form className='row' onSubmit={(event)=>{
                    event.preventDefault()
                    withdrawEther(dispatch ,exchange , web3,etherWithdrawAmount ,account)
                }}>
                    <div className='input-group mb-3'style={{marginBottom :'10px' , minHeight: '38px'}}>
                        <input
                        type='number'
                        step="0.001"
                        //max='20'
                        placeholder='ETH Amount'
                        onChange={(e)=>dispatch(etherWithdrawAmountChanged(e.target.value))}
                        className="form-control bg-dark text-white"
                        required />
                        <button type='submit' className='btn btn-outline-danger btn-block'><strong>Withdraw</strong></button>
                    </div>
                </form>
                <table className='table table-dark table-sm small'>
                    <tbody>
                        <tr>
                            <td><strong>DAPP</strong></td>
                            <td>{tokenBalance}</td>
                            <td>{exchangeTokenBalance}</td>
                        </tr>
                    </tbody>
                </table>
                <form className='row' onSubmit={(event)=>{
                    event.preventDefault()
                    withdrawToken(dispatch ,exchange , web3, token, tokenWithdrawAmount, account)
                }}>
                    <div className='input-group mb-3'style={{marginBottom :'10px' , minHeight: '38px'}}>
                        <input
                        type='number'
                        step="0.001"
                        //max='20'
                        placeholder='DAPP Amount'
                        onChange={(e)=>dispatch(tokenWithdrawAmountChanged(e.target.value))}
                        className="form-control bg-dark text-white"
                        required />
                        <button type='submit' className='btn btn-outline-danger btn-block'><strong>Withdraw</strong></button>
                    </div>
                </form>
            </Tab>
        </Tabs>
    )
}
class Balance extends Component {
    componentWillMount(){
        this.loadBlockchainData()
      }
      async loadBlockchainData(){    
        const {dispatch ,web3 , exchange, token, account} = this.props
        // debugger
        await loadBalances(dispatch ,web3 , exchange, token, account)
      }
  render() {
    if(!this.props.balancesLoading){
        this.loadBlockchainData()
    }
    return (
        <div className="card bg-dark text-white">
            <div className="card-header">
                <strong>Balance</strong>
            </div>
            <div className="card-body">
                {!this.props.balancesLoading ? showForm(this.props) : <Spinner />}
            </div>
        </div>
    )
  }
}

function mapStateToProps(state){
    return{
        web3 : web3Selector(state) ,
        exchange : exchangeSelector(state) , 
        token : tokenSelector(state) , 
        account : accountSelector(state) ,
        etherBalance : etherBalanceSelector(state) ,
        tokenBalance : tokenBalanceSelector(state) ,
        exchangeEtherBalance : exchangeEtherBalanceSelector(state) ,
        exchangeTokenBalance : exchangeTokenBalanceSelector(state) ,
        balancesLoading : balancesLoadingSelector(state),
        etherDepositAmount : etherDepositAmountSelector(state) ,
        etherWithdrawAmount : etherWithdrawAmountSelector(state) ,
        tokenDepositAmount : tokenDepositAmountSelector(state) ,
        tokenWithdrawAmount : tokenWithdrawAmountSelector(state)         
    }
}
export default connect(mapStateToProps)(Balance)