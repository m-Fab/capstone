export const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000"

export const DECIMALS = (10**18)

export const tokens = (wei) => {
  if(wei) {
  	return(wei / DECIMALS)
  }
}

export const GREEN = 'success'

export const RED = 'danger'

export const formatBalance = (balance) => {
  const precision = 100 // 2 Decimals
  balance = tokens(balance)
  balance = Math.round(balance * precision) / precision
  return balance
}