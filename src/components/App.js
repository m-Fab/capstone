import React, { Component } from 'react'
import { connect } from 'react-redux'
import './App.css';
import Web3 from 'web3' // Not needed if using Redux (which is not working in local...)
import Token from '../abis/Token.json'
import { 
  loadWeb3,
  loadAccount,
  loadToken,
  loadExchange
} from '../store/interactions'

class App extends Component {
  componentDidMount() {
    this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    //Redux not working in local - see https://www.gitmemory.com/issue/ethereum/web3.js/2665/687164093
    // const web3 = await loadWeb3(dispatch)
    //Normal
    const web3 = new Web3(Web3.givenProvider || 'HTTP://127.0.0.1:7545');

    //Redux
    const account = await loadAccount(web3, dispatch)
    const token = await loadToken(web3, dispatch)
    const exchange = await loadExchange(web3, dispatch)

    //Brouillon
    // const totalSupply = await contract.methods.totalSupply().call()
    // console.log(totalSupply)
  }

  render() {
    return (
      <div>

        <nav className="navbar navbar-expand-lg navbar-dark">
          <a className="navbar-brand" href="/#">Capstone token exchange</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="/#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle Navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link" href="/#">Link 1</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/#">Link 2</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/#">Link 3</a>
              </li>
            </ul>
          </div>
        </nav>

        <div className="content">

          <div className="vertical-split">
            <div className="card text-white">
              <div className="card-header">
                Card Title
              </div>
              <div className="card-body">
                <p className="card-text"> Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="/#" className="card-link">Card link</a>
              </div>
            </div>
            <div className="card text-white">
              <div className="card-header">
                Card Title
              </div>
              <div className="card-body">
                <p className="card-text"> Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="/#" className="card-link">Card link</a>
              </div>
            </div>
          </div>

          <div className="vertical">
            <div className="card text-white">
              <div className="card-header">
                Card Title
              </div>
              <div className="card-body">
                <p className="card-text"> Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="/#" className="card-link">Card link</a>
              </div>
            </div>
          </div>

          <div className="vertical-split">
            <div className="card text-white">
              <div className="card-header">
                Card Title
              </div>
              <div className="card-body">
                <p className="card-text"> Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="/#" className="card-link">Card link</a>
              </div>
            </div>
            <div className="card text-white">
              <div className="card-header">
                Card Title
              </div>
              <div className="card-body">
                <p className="card-text"> Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="/#" className="card-link">Card link</a>
              </div>
            </div>
          </div>

          <div className="vertical">
            <div className="card text-white">
              <div className="card-header">
                Card Title
              </div>
              <div className="card-body">
                <p className="card-text"> Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="/#" className="card-link">Card link</a>
              </div>
            </div>
          </div>

        </div>

      </div>
    );
  }
}

function mapStateToProps(state) {
  return {

  }
}

export default connect(mapStateToProps)(App)
