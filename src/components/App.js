import React ,{ Component } from 'react';
import './App.css';
import { connect } from 'react-redux';
import { accountSelector, contractsLoadedSelector  } from '../store/selectors';
import Navbar from './Navbar';
import Content from './Content';
import { loadWeb3 ,
          loadAccount ,
          loadToken ,
          loadExchange 
        } 
        from '../store/intractions';

class App extends Component {
    componentWillMount(){
      this.localBlockchainData(this.props.dispatch)
    }
    componentDidMount(){
      window.ethereum.on('accountsChanged', ()=>{
        window.location.reload()
      })
      window.ethereum.on('chainChanged', ()=>{
        window.location.reload()
      })
    }
    async localBlockchainData(dispatch){
      const web3 = loadWeb3(dispatch)
      const networkId = await web3.eth.net.getId()
      const accounts = await loadAccount(web3 ,dispatch)
      const token = await loadToken(web3 ,networkId ,dispatch)
      if(!token){
        window.alert('Token contract not deployed to the current network. Please select another network with Metamask')
      return
    }
      const exchange = await loadExchange(web3 ,networkId ,dispatch)
      if(!exchange){
        window.alert('Token contract not deployed to the current network. Please select another network with Metamask')
      return
    }
    }
  render(){
    return (
      <div>
        <Navbar />
        {this.props.contractsLoaded ? <Content /> : <div className='content'></div>}
      </div>
    );
  }
}

function mapStateToProps(state){
  return{
    accountLoaded : accountSelector(state) ,
    contractsLoaded : contractsLoadedSelector(state)
  }
}

export default connect(mapStateToProps)(App);
