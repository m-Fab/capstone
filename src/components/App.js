import React, { Component } from 'react'
import { connect } from 'react-redux'
import './App.css'
import Navbar from './Navbar'
import Content from './Content'
// import Web3 from 'web3' // Not needed if using Redux (which is not working in local...)
import { 
  loadWeb3, // Redux not working in local - see https://www.gitmemory.com/issue/ethereum/web3.js/2665/687164093
  loadAccount,
  loadToken,
  loadExchange
} from '../store/interactions'
import { contractsLoadedSelector } from '../store/selectors/selectorsWeb3.js'

class App extends Component {
  componentDidMount() {
    this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    // Redux not working in local - see https://www.gitmemory.com/issue/ethereum/web3.js/2665/687164093
    const web3 = await loadWeb3(dispatch)
    // Normal
    // const web3 = new Web3(Web3.givenProvider || 'HTTP://127.0.0.1:7545')

    // Redux
    const account = await loadAccount(web3, dispatch)
    if(!account) {
      window.alert('Please login with Metamask.')
      return
    }
    const token = await loadToken(web3, dispatch)
    if(!token) {
      window.alert('Token Smart Contract not deployed to the current network. Please select another network with Metamask.')
      return
    }
    const exchange = await loadExchange(web3, dispatch)
    if(!exchange) {
      window.alert('Exchange Smart Contract not deployed to the current network. Please select another network with Metamask.')
      return
    }
  }

  render() {
    return (
      <div>
        <Navbar />
        { this.props.contractsLoaded ? <Content /> : <div className="content text-white">Loading...</div> }
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    contractsLoaded: contractsLoadedSelector(state)
  }
}

export default connect(mapStateToProps)(App)
