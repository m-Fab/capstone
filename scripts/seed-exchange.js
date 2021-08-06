const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");

module.exports = async function(callback) {
	try {
		//////////////////////////////////////////////////////////////////////////////
		// Helpers
		const EVM_REVERT = 'VM Exception while processing transaction: revert'

		const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'

		const tokens =(n) => {
		  return new web3.utils.BN(
		    web3.utils.toWei(n.toString(), 'ether')
		  )
		}

		const wait = (seconds) => {
		  const milliseconds = seconds * 1000
		  return new Promise(resolve => setTimeout(resolve, milliseconds))
		}

		//////////////////////////////////////////////////////////////////////////////
		// Seed accounts
		// Fetch on blockchain
		console.log("Script Running...")
		const accounts = await web3.eth.getAccounts()
		console.log("Accounts fetched")
		const token = await Token.deployed()
		console.log("Token fetched", token.address)
		const exchange = await Exchange.deployed()
		console.log("Exchange fetched", exchange.address)

		// Give tokens to account[1] / user2
		const user1 = accounts[0]
		const user2 = accounts[1]
		let amount = 10000
		await token.transfer(user2, tokens(amount), { from: user1 })
		console.log(`Transferred ${amount} tokens from ${user1} to ${user2}`)

		// Exchange set up
		amount = 1
		await exchange.depositEther({ from: user1, value: tokens(amount) })
		console.log(`Deposited ${amount} Ether from ${user1}`)
		amount = 10000
		await token.approve(exchange.address, tokens(amount), { from: user2 })
		console.log(`Approved ${amount} tokens from ${user2}`)
		await exchange.depositToken(token.address, tokens(amount), { from: user2 })
		console.log(`Deposited ${amount} tokens from ${user2}`)

		//////////////////////////////////////////////////////////////////////////////
		// Seed a cancel order
		let result
		let orderId
		result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, tokens(0.1), { from: user1 })
		console.log(`Made order from ${user1}`)
		orderId = result.logs[0].args._id
		await exchange.cancelOrder(orderId, { from: user1 })
		console.log(`Cancelled order from ${user1}`)

		//////////////////////////////////////////////////////////////////////////////
		// Seed filled orders
		result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, tokens(0.1), { from: user1 })
		console.log(`Made order from ${user1}`)
		orderId = result.logs[0].args._id
		await exchange.fillOrder(orderId, { from: user2 })
		console.log(`Filled order from ${user2}`)

		await wait(1)

		result = await exchange.makeOrder(token.address, tokens(50), ETHER_ADDRESS, tokens(0.01), { from: user1 })
		console.log(`Made order from ${user1}`)
		orderId = result.logs[0].args._id
		await exchange.fillOrder(orderId, { from: user2 })
		console.log(`Filled order from ${user2}`)

		await wait(1)

		result = await exchange.makeOrder(token.address, tokens(200), ETHER_ADDRESS, tokens(0.15), { from: user1 })
		console.log(`Made order from ${user1}`)
		orderId = result.logs[0].args._id
		await exchange.fillOrder(orderId, { from: user2 })
		console.log(`Filled order from ${user2}`)

		await wait(1)

		//////////////////////////////////////////////////////////////////////////////
		// Seed open orders

		// User1 makes 10 orders
		for(let i=0; i<10; i++) {
			result = await exchange.makeOrder(token.address, tokens(10*i), ETHER_ADDRESS, tokens(0.01*i), { from: user1 })
			await wait(1)
		}
		console.log(`Made open orders from ${user1}`)

		// User2 makes 10 orders
		for(let i=0; i<10; i++) {
			result = await exchange.makeOrder(ETHER_ADDRESS, tokens(0.01*i), token.address, tokens(10*i), { from: user2 })
			await wait(1)
		}
		console.log(`Made open orders from ${user2}`)

	} catch(err) {
		console.log(err)
	}

	callback()
}
