const Token = artifacts.require("./Token");

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Token', (accounts) => {

  describe('deployment', () => {
    const name = 'FMauro Token'
    const symbol = 'FMA'
    const decimals = '18'
    const totalSupply = '1000000000000000000000000'
    let token
    let result

    beforeEach(async () => {
      token = await Token.new()
    })
    
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
      result.toString().should.equal(totalSupply)
    })

  })
})
