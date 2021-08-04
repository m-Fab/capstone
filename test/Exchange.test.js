import { tokens, EVM_REVERT, ETHER_ADDRESS } from './helpers.js'
const Token = artifacts.require("./Token");
const Exchange = artifacts.require("./Exchange");

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Exchange', ([deployer, feeAccount, user1]) => {
  let token
  let exchange
  const feePercent = 10
  let result

  beforeEach(async () => {
    // Deploy token
    token = await Token.new()
    // Transfer some tokens to user1
    token.transfer(user1, tokens(100), { from: deployer })
    // Deploy Exchange
    exchange = await Exchange.new(feeAccount, feePercent)
  })

  describe('deployment', () => {
    it('tracks the fee account', async () => {
      result = await exchange.feeAccount()
      result.should.equal(feeAccount)
    })

    it('tracks the fee percent', async () => {
      result = await exchange.feePercent()
      result.toString().should.equal(feePercent.toString())
    })
  })

  describe('fallback', () => {
    it('revert when Ether is sent', async () => {
      result = await exchange.sendTransaction({ value: 1, from: user1 }).should.be.rejectedWith(EVM_REVERT)
    })
  })

  describe('depositing Ether', () => {
    let amount = tokens(1)
    let result

      beforeEach(async () => {
        result = await exchange.depositEther({ from: user1, value: amount })
      })

    describe('success', async () => {
      it('tracks the ether deposit', async () => {
        let balance
        balance = await exchange.tokens(ETHER_ADDRESS, user1)
        balance.toString().should.equal(amount.toString(), 'balance of user1')
      })

      it('emits a Deposit event', async () => {
        const event = result.logs[0].event
        const logs = result.logs[0].args
        event.should.equal('Deposit')
        logs._token.toString().should.equal(ETHER_ADDRESS, '_token of Deposit event')
        logs._from.toString().should.equal(user1, '_from of Deposit event')
        logs._amount.toString().should.equal(amount.toString(), '_amount of Deposit event')
        logs._balance.toString().should.equal(amount.toString(), '_balance of Deposit event')
      })
    })
  })

  describe('depositing tokens', () => {
    let amount = tokens(10)
    let result

    describe('success', async () => {
      beforeEach(async () => {
        await token.approve(exchange.address, amount, { from: user1 })
        result = await exchange.depositToken(token.address, amount, { from: user1 })
      })

      it('tracks the token deposit', async () => {
        let balance
        balance = await token.balanceOf(exchange.address)
        balance.toString().should.equal(amount.toString(), 'balance of exchange')
        balance = await exchange.tokens(token.address, user1)
        balance.toString().should.equal(amount.toString(), 'balance of user1')
      })

      it('emits a Deposit event', async () => {
        const event = result.logs[0].event
        const logs = result.logs[0].args
        event.should.equal('Deposit')
        logs._token.toString().should.equal(token.address, '_token of Deposit event')
        logs._from.toString().should.equal(user1, '_from of Deposit event')
        logs._amount.toString().should.equal(amount.toString(), '_amount of Deposit event')
        logs._balance.toString().should.equal(amount.toString(), '_balance of Deposit event')
      })
    })

    describe('failure', async () => {
      it('rejects Ether deposits', async () => {
        await exchange.depositToken(ETHER_ADDRESS, amount, { from: user1 }).should.be.rejectedWith(EVM_REVERT);
      })

      it('fails when no tokens are approved', async () => {
        await exchange.depositToken(token.address, amount, { from: user1 }).should.be.rejectedWith(EVM_REVERT);
      })
    })
  })
})
