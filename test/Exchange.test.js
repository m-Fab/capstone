import { tokens, EVM_REVERT, ETHER_ADDRESS } from './helpers.js'
const Token = artifacts.require("./Token");
const Exchange = artifacts.require("./Exchange");

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Exchange', ([deployer, feeAccount, user1, user2]) => {
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

    beforeEach(async () => {
      result = await exchange.depositEther({ from: user1, value: amount })
    })

    describe('success', async () => {
      it('tracks the ether deposit', async () => {
        const balance = await exchange.tokens(ETHER_ADDRESS, user1)
        balance.toString().should.equal(amount.toString(), 'balance of user1')
      })

      it('emits a Deposit event', async () => {
        const event = result.logs[0].event
        const logs = result.logs[0].args
        event.should.equal('Deposit')
        logs._token.toString().should.equal(ETHER_ADDRESS, '_token of Deposit event')
        logs._user.toString().should.equal(user1, '_user of Deposit event')
        logs._amount.toString().should.equal(amount.toString(), '_amount of Deposit event')
        logs._balance.toString().should.equal(amount.toString(), '_balance of Deposit event')
      })
    })
  })

  describe('withdrawing Ether', () => {
    let amount = tokens(1)

    beforeEach(async () => {
      // Deposit Ether first
      result = await exchange.depositEther({ from: user1, value: amount })
    })

    describe('success', async () => {
      beforeEach(async () => {
        // Withdraw Ether
        result = await exchange.withdrawEther(amount, { from: user1 })
      })

      it('withdraw Ether funds', async () => {
        const balance = await exchange.tokens(ETHER_ADDRESS, user1)
        balance.toString().should.equal('0', 'balance of user1')
      })

      it('emits a Withdraw event', async () => {
        const event = result.logs[0].event
        const logs = result.logs[0].args
        event.should.equal('Withdraw')
        logs._token.toString().should.equal(ETHER_ADDRESS, '_token of Withdraw event')
        logs._user.toString().should.equal(user1, '_user of Withdraw event')
        logs._amount.toString().should.equal(amount.toString(), '_amount of Withdraw event')
        logs._balance.toString().should.equal('0', '_balance of Withdraw event')
      })
    })

    describe('failure', async () => {
      it('rejects withdraws for insufficient balances', async () => {
        await exchange.withdrawEther(tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT);
      })
    })
  })

  describe('depositing tokens', () => {
    let amount = tokens(10)

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
        logs._user.toString().should.equal(user1, '_user of Deposit event')
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

  describe('withdrawing tokens', () => {
    let amount = tokens(10)

    describe('success', async () => {
      beforeEach(async () => {
        // Deposit tokens first
        await token.approve(exchange.address, amount, { from: user1 })
        await exchange.depositToken(token.address, amount, { from: user1 })
        // Witdraw tokens
        result = await exchange.withdrawToken(token.address, amount, { from: user1 })
      })

      it('withdraw token funds', async () => {
        const balance = await exchange.tokens(token.address, user1)
        balance.toString().should.equal('0', 'balance of user1')
      })

      it('emits a Withdraw event', async () => {
        const event = result.logs[0].event
        const logs = result.logs[0].args
        event.should.equal('Withdraw')
        logs._token.toString().should.equal(token.address, '_token of Withdraw event')
        logs._user.toString().should.equal(user1, '_user of Withdraw event')
        logs._amount.toString().should.equal(amount.toString(), '_amount of Withdraw event')
        logs._balance.toString().should.equal('0', '_balance of Withdraw event')
      })
    })

    describe('failure', async () => {
      it('rejects withdraws for insufficient balances', async () => {
        await exchange.withdrawToken(token.address, tokens(100), { from: user1 }).should.be.rejectedWith(EVM_REVERT);
      })

      it('rejects Ether withdraws', async () => {
        await exchange.withdrawToken(ETHER_ADDRESS, amount, { from: user1 }).should.be.rejectedWith(EVM_REVERT);
      })
    })
  })

  describe('checking balances', async () => {
    beforeEach(async () => {
      await exchange.depositEther({ from: user1, value: tokens(1) })
    })

    it('returns user balance', async () => {
      result = await exchange.balanceOf(ETHER_ADDRESS, user1)
      result.toString().should.equal(tokens(1).toString(), 'balance of user1')
    })
  })

  describe('making orders', async () => {
    let orderCount

    beforeEach(async () => {
      result = await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, tokens(1), { from: user1 })
    })

    it('tracks the newly created order', async () => {
      orderCount = await exchange.orderCount()
      orderCount.toString().should.equal('1', 'orderCount')
      const order = await exchange.orders('1')
      order.id.toString().should.equal('1', 'id of the order')
      order.user.should.equal(user1, 'user of the order')
      order.tokenGet.should.equal(token.address, 'tokenGet of the order')
      order.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet of the order')
      order.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive of the order')
      order.amountGive.toString().should.equal(tokens(1).toString(), 'amountGive of the order')
      order.timestamp.toString().length.should.be.at.least(1, 'timestamp of the order')
    })

    it('emits a Order event', async () => {
      const event = result.logs[0].event
      const logs = result.logs[0].args
      event.should.equal('Order')
      logs._id.toString().should.equal(orderCount.toString(), '_id of Order event')
      logs._user.should.equal(user1, '_user of Order event')
      logs._tokenGet.should.equal(token.address, '_tokenGet of Order event')
      logs._amountGet.toString().should.equal(tokens(1).toString(), '_amountGet of Order event')
      logs._tokenGive.should.equal(ETHER_ADDRESS, '_tokenGive of Order event')
      logs._amountGive.toString().should.equal(tokens(1).toString(), '_amountGive of Order event')
      logs._timestamp.toString().length.should.be.at.least(1, '_timestamp of Order event')
    })
  })

  describe('order actions', async () => {

    beforeEach(async () => {
      // Deposit Ether first
      await exchange.depositEther({ from: user1, value: tokens(1) })
      // Give some tokens to user2
      await token.transfer(user2, tokens(100), { from: deployer })
      // User2 deposits tokens on the exchange
      await token.approve(exchange.address, tokens(2), { from: user2 })
      await exchange.depositToken(token.address, tokens(2), { from: user2 })
      // User1 buy tokens with Ether
      await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, tokens(1), { from: user1 })
    })

    describe('filling orders', async () => {

      describe('success', async () => {
        beforeEach(async () => {
          // User2 fills order
          result = await exchange.fillOrder('1', { from: user2 })
        })

        it('executes the trade & charges fees', async () => {
          let balance
          balance = await exchange.balanceOf(token.address, user1)
          balance.toString().should.equal(tokens(1).toString(), 'token balance of user1')
          balance = await exchange.balanceOf(ETHER_ADDRESS, user2)
          balance.toString().should.equal(tokens(1).toString(), 'ether balance of user2')
          balance = await exchange.balanceOf(ETHER_ADDRESS, user1)
          balance.toString().should.equal('0', 'ether balance of user1')
          balance = await exchange.balanceOf(token.address, user2)
          balance.toString().should.equal(tokens(0.9).toString(), 'token balance of user2 (fees applied)')
          const feeAccount = await exchange.feeAccount()
          balance = await exchange.balanceOf(token.address, feeAccount)
          balance.toString().should.equal(tokens(0.1).toString(), 'token balance of feeAccount')
        })

        it('updates filled orders', async () => {
          const orderFilled = await exchange.orderFilled(1)
          orderFilled.should.equal(true)
        })

        it('emits a Trade event', async () => {
          const event = result.logs[0].event
          const logs = result.logs[0].args
          event.should.equal('Trade')
          logs._id.toString().should.equal('1', '_id of Trade event')
          logs._user.should.equal(user1, '_user of Trade event')
          logs._tokenGet.should.equal(token.address, '_tokenGet of Trade event')
          logs._amountGet.toString().should.equal(tokens(1).toString(), '_amountGet of Trade event')
          logs._tokenGive.should.equal(ETHER_ADDRESS, '_tokenGive of Trade event')
          logs._amountGive.toString().should.equal(tokens(1).toString(), '_amountGive of Trade event')
          logs._feeAmount.toString().should.equal(tokens(0.1).toString(), '_feeAmount of Trade event')
          logs._userFill.should.equal(user2, '_userFill of Trade event')
          logs._timestamp.toString().length.should.be.at.least(1, '_timestamp of Trade event')
        })
      })

      describe('failure', async () => {
        it('rejects invalid order ids', async () => {
          const invalidOrderId = 9999;
          await exchange.fillOrder(invalidOrderId, { from: user2 }).should.be.rejectedWith(EVM_REVERT)
        })

        it('rejects already-filled orders', async () => {
          // Fill the order
          await exchange.fillOrder('1', { from: user2 }).should.be.fulfilled
          // Try to fill it again
          await exchange.fillOrder('1', { from: user2 }).should.be.rejectedWith(EVM_REVERT)
        })

        it('rejects cancelled orders', async () => {
          // Cancel the order
          await exchange.cancelOrder('1', { from: user1 }).should.be.fulfilled
          // Try to fill the order
          await exchange.fillOrder('1', { from: user2 }).should.be.rejectedWith(EVM_REVERT)
        })
      })

    })

    describe('cancelling orders', async () => {

      describe('success', async () => {
        beforeEach(async () => {
          result = await exchange.cancelOrder('1', { from: user1 })
        })

        it('updates cancelled orders', async () => {
          const orderCancelled = await exchange.orderCancelled('1')
          orderCancelled.should.equal(true)
        })

        it('emits a Cancel event', async () => {
          const event = result.logs[0].event
          const logs = result.logs[0].args
          event.should.equal('Cancel')
          logs._id.toString().should.equal('1', '_id of Cancel event')
          logs._user.should.equal(user1, '_user of Cancel event')
          logs._tokenGet.should.equal(token.address, '_tokenGet of Cancel event')
          logs._amountGet.toString().should.equal(tokens(1).toString(), '_amountGet of Cancel event')
          logs._tokenGive.should.equal(ETHER_ADDRESS, '_tokenGive of Cancel event')
          logs._amountGive.toString().should.equal(tokens(1).toString(), '_amountGive of Cancel event')
          logs._timestamp.toString().length.should.be.at.least(1, '_timestamp of Cancel event')
        })
      })

      describe('failure', async () => {
        it('rejects invalid order ids', async () => {
          const invalidOrderId = 9999;
          await exchange.cancelOrder(invalidOrderId, { from: user1 }).should.be.rejectedWith(EVM_REVERT)
        })

        it('rejects unauthorized cancelations', async () => {
          // Try to cancel the order from another user
          await exchange.cancelOrder('1', { from: user2 }).should.be.rejectedWith(EVM_REVERT)
        })
      })

    })
  })
})
