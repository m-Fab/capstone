import React, { Component } from 'react'
import './App.css';
import Web3 from 'web3'
import Token from '../abis/Token.json'

class App extends Component{
  componentDidMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = new Web3(Web3.givenProvider || 'HTTP://127.0.0.1:7545');
    // const networks = await web3.eth.net.getNetworkType()
    // const accounts = await web3.eth.getAccounts()
    // console.log("web3", web3)
    // console.log("network", network)
    // console.log("accounts", accounts)

    var Contract = require('web3-eth-contract');
    // set provider for all later instances to use
    Contract.setProvider('HTTP://127.0.0.1:7545');

    const networkId = await web3.eth.net.getId();
    const network = await Token.networks[networkId].address;
    var contract = new Contract(Token.abi, network);
    // console.log(contract)

    const totalSupply = await contract.methods.totalSupply().call()
    console.log(totalSupply)
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

export default App;
