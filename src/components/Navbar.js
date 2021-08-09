import React, { Component } from 'react'
import { connect } from 'react-redux'
import { accountSelector } from '../store/selectors'

class Navbar extends Component {
  render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark">
        <a className="navbar-brand" href="/#">Capstone token exchange</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="/#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle Navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
          <a className="nav-link small" href={`https://etherscan.io/address/${this.props.account}`} target="_blank" rel="noreferrer">
            {this.props.account}
          </a>
          </li>
        </ul>
      </nav>
    )
  }
}

function mapStateToProps(state) {
  return {
    account: accountSelector(state)
  }
}

export default connect(mapStateToProps)(Navbar)
