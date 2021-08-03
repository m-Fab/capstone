import { tokens, evm_revert } from './helpers.js'
const Token = artifacts.require("./Token");

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Token', ([deployer, receiver]) => {
  const name = 'FMauro Token'
  const symbol = 'FMA'
  const decimals = '18'
  const totalSupply = tokens(1000000)
  let token
  let result

  beforeEach(async () => {
    token = await Token.new()
  })

  describe('deployment', () => {
    it('tracks the name', async () => {
      result = await token.name()
      result.should.equal(name)
    })

    it('tracks the symbol', async () => {
      result = await token.symbol()
      result.should.equal(symbol)
    })

    it('tracks the decimals', async () => {
      result = await token.decimals()
      result.toString().should.equal(decimals)
    })

    it('tracks the total supply', async () => {
      result = await token.totalSupply()
      result.toString().should.equal(totalSupply.toString())
    })

    it('assigns the total supply to the deployer', async () => {
      result = await token.balanceOf(deployer)
      result.toString().should.equal(totalSupply.toString())
    })
  })

  describe('sending tokens', () => {
    let amount
    let result
    let event
    let logs

    describe('success', async () => {
      beforeEach(async () => {
        amount = tokens(100)
        result = await token.transfer(receiver, amount, {from: deployer})
      })

      it('transfer token balances', async () => {
        result = await token.balanceOf(deployer)
        result.toString().should.equal((tokens(999900)).toString(), 'balance of deployer')
        result = await token.balanceOf(receiver)
        result.toString().should.equal((tokens(100)).toString(), 'balance of receiver')
      })

      it('emits a Transfer event', async () => {
        event = result.logs[0].event
        logs = result.logs[0].args
        event.should.equal('Transfer')
        logs.from.toString().should.equal(deployer, 'from of Transfer event')
        logs.to.toString().should.equal(receiver, 'to of Transfer event')
        logs.value.toString().should.equal(amount.toString(), 'value of Transfer event')
      })
    })

    describe('failure', async () => {
      it('reject insufficient balances', async () => {
        let invalidAmount
        invalidAmount = tokens(10000000) // 10 million - greater than total supply
        await token.transfer(receiver, invalidAmount, { from: deployer }).should.be.rejectedWith(evm_revert);
        invalidAmount = tokens(10) // recipient has no tokens
        await token.transfer(deployer, invalidAmount, { from: receiver }).should.be.rejectedWith(evm_revert);
      })

      it('reject invalid recipients', async () => {
        await token.transfer(0x0, amount, { from: deployer }).should.be.rejected;
      })
    })
  })
})
