export const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000"
export const GREEN = 'success' // For bootstrap 
export const RED = 'danger'    // For bootstrap
export const DECIMALS = (10**18)
export const ether = (Wei) => {
    if(Wei){
        return(Wei/DECIMALS)
    }
}
export const tokens = ether

export function formatBalance (balance) {
    // console.log(balance)
    // debugger
    const precision = 1000 // 3 decimal places
    balance = ether(balance)
    balance = Math.round( balance * precision) / precision

    return balance
}