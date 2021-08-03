export const evm_revert = 'VM Exception while processing transaction: revert'

export const tokens =(n) => {
  return new web3.utils.BN(
    web3.utils.toWei(n.toString(), 'ether')
  )
}