import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tabs, Tab } from 'react-bootstrap'
import Spinner from './Spinner'
import { 
  loadBalances,
  depositEther,
  withdrawEther,
  depositToken,
  withdrawToken
} from '../store/interactions'
import {
  web3Selector,
  exchangeSelector,
  tokenSelector,
  accountSelector
} from '../store/selectors/selectorsWeb3'
import {
  etherDepositAmountSelector,
  etherWithdrawAmountSelector,
  tokenDepositAmountSelector,
  tokenWithdrawAmountSelector
} from '../store/selectors/selectorsOrders'
import {
  balancesLoadingSelector,
  etherBalanceSelector,
  tokenBalanceSelector,
  exchangeEtherBalanceSelector,
  exchangeTokenBalanceSelector
} from '../store/selectors/selectorsBalances'
import { 
  etherDepositAmountChanged,
  etherWithdrawAmountChanged,
  tokenDepositAmountChanged,
  tokenWithdrawAmountChanged
} from '../store/actions'

const showForm = (props) => {
  const {
    web3,
    etherBalance,
    tokenBalance,
    exchangeEtherBalance,
    exchangeTokenBalance,
    etherDepositAmount,
    etherWithdrawAmount,
    tokenDepositAmount,
    tokenWithdrawAmount,
    exchange,
    token,
    account,
    dispatch
  } = props

  return(
    <Tabs defaultActiveKey="deposit" className="tab-dark text-white">

      <Tab eventKey="deposit" title="Deposit">
        <table className="table table-dark table-sm small">
          <thead>
            <tr>
              <td>Token</td>
              <td>Wallet</td>
              <td>Exchange</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ETH</td>
              <td>{etherBalance}</td>
              <td>{exchangeEtherBalance}</td>
            </tr>
            <tr>
              <td>FMFP</td>
              <td>{tokenBalance}</td>
              <td>{exchangeTokenBalance}</td>
            </tr>
          </tbody>
        </table>

        <form className="row" onSubmit={(event) => {
          event.preventDefault()
          depositEther(web3, exchange, token, account, etherDepositAmount, dispatch)
        }}>
          <div className="col-12 col-sm pr-sm-2">
            <input
              type="text"
              placeholder="ETH Amount"
              onChange={ (e) => dispatch(etherDepositAmountChanged(e.target.value)) }
              className="form-control form-control-sm bg-dark text-white"
              required />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-custom-dark btn-block btn-sm text-white">Deposit</button>
          </div>
        </form>

        <form className="row" onSubmit={(event) => {
          event.preventDefault()
          depositToken(web3, exchange, token, account, tokenDepositAmount, dispatch)
        }}>
          <div className="col-12 col-sm pr-sm-2">
            <input
              type="text"
              placeholder="FMFP Amount"
              onChange={ (e) => dispatch(tokenDepositAmountChanged(e.target.value)) }
              className="form-control form-control-sm bg-dark text-white"
              required />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-custom-dark btn-block btn-sm text-white">Deposit</button>
          </div>
        </form>

      </Tab>

      <Tab eventKey="withdraw" title="Withdraw">
        <table className="table table-dark table-sm small">
          <thead>
            <tr>
              <td>Token</td>
              <td>Wallet</td>
              <td>Exchange</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ETH</td>
              <td>{etherBalance}</td>
              <td>{exchangeEtherBalance}</td>
            </tr>
            <tr>
              <td>FMFP</td>
              <td>{tokenBalance}</td>
              <td>{exchangeTokenBalance}</td>
            </tr>
          </tbody>
        </table>

        <form className="row" onSubmit={(event) => {
          event.preventDefault()
          withdrawEther(web3, exchange, token, account, etherWithdrawAmount, dispatch)
        }}>
          <div className="col-12 col-sm pr-sm-2">
            <input
              type="text"
              placeholder="ETH Amount"
              onChange={ (e) => dispatch(etherWithdrawAmountChanged(e.target.value)) }
              className="form-control form-control-sm bg-dark text-white"
              required />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-custom-dark btn-block btn-sm text-white">Withdraw</button>
          </div>
        </form>

        <form className="row" onSubmit={(event) => {
          event.preventDefault()
          withdrawToken(web3, exchange, token, account, tokenWithdrawAmount, dispatch)
        }}>
          <div className="col-12 col-sm pr-sm-2">
            <input
              type="text"
              placeholder="FMFP Amount"
              onChange={ (e) => dispatch(tokenWithdrawAmountChanged(e.target.value)) }
              className="form-control form-control-sm bg-dark text-white"
              required />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-custom-dark btn-block btn-sm text-white">Withdraw</button>
          </div>
        </form>

      </Tab>

    </Tabs>
  )
}

class Balance extends Component {
  render() {
    return (
      <div className="card text-white">
        <div className="card-header">
          Balance
        </div>
        <div className="card-body">
          { !this.props.balancesLoading ? showForm(this.props) : <Spinner /> }
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    web3: web3Selector(state), // Redux not working in local (Ganache) for web3 selector - see https://www.gitmemory.com/issue/ethereum/web3.js/2665/687164093
    exchange: exchangeSelector(state),
    token: tokenSelector(state),
    account: accountSelector(state),
    etherBalance: etherBalanceSelector(state),
    tokenBalance: tokenBalanceSelector(state),
    exchangeEtherBalance: exchangeEtherBalanceSelector(state),
    exchangeTokenBalance: exchangeTokenBalanceSelector(state),
    balancesLoading: balancesLoadingSelector(state),
    etherDepositAmount: etherDepositAmountSelector(state),
    etherWithdrawAmount: etherWithdrawAmountSelector(state),
    tokenDepositAmount: tokenDepositAmountSelector(state),
    tokenWithdrawAmount: tokenWithdrawAmountSelector(state)
  }
}

export default connect(mapStateToProps)(Balance)
