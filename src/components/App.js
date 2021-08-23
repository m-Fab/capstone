import React, { Component } from 'react'
import { connect } from 'react-redux'
import './App.css'
import Spinner from './Spinner'
import Navbar from './Navbar'
import Content from './Content'
import { loadBlockchainData } from '../helpers'
import { contractsLoadedSelector } from '../store/selectors/selectorsWeb3'

class App extends Component {
  componentDidMount() {
    loadBlockchainData(this.props.dispatch)
  }

  render() {
    return (
      <div>
        <Navbar />
        { this.props.contractsLoaded ? <Content /> : <Spinner /> }
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
