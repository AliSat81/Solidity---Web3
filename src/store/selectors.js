import { createSelector } from "reselect"
import { get, groupBy, maxBy, reject , minBy} from 'lodash'
import { ETHER_ADDRESS , tokens, ether, GREEN, RED ,formatBalance} from '../helpers'
import moment from "moment"
import { etherDepositAmountChanged } from "./actions"


const account = (state) => get(state ,'web3.account',false)
export const accountSelector = createSelector(account, a => a )

const web3 = (state) => get(state ,'web3.connection',false)
export const web3Selector = createSelector(web3, w => w )

const tokenLoaded = (state) => get(state ,'token.loaded' ,false)
export const tokenLoadedSelector = createSelector(tokenLoaded ,t => t)

const exchangeLoaded = (state) => get(state ,'exchange.loaded' ,false)
export const exchangeLoadedSelector = createSelector(exchangeLoaded ,el => el)

const token = (state) => get(state ,'token.contract')
export const tokenSelector = createSelector(token ,e => e)

const exchange = (state) => get(state ,'exchange.contract')
export const exchangeSelector = createSelector(exchange ,e => e)

export const contractsLoadedSelector = createSelector(
    tokenLoaded ,
    exchangeLoaded ,
    (tl ,el) => (tl && el)
)

//All Orders
const allOrdersLoaded = (state) => get(state ,'exchange.allOrders.loaded',false)
export const allOrdersLoadedSelector = createSelector(allOrdersLoaded , loaded => loaded)
const allOrders = state => get(state ,'exchange.allOrders.data',[])
export const allOrdersSelector = createSelector(allOrders ,o => o)

//Cancel Orders
const cancelledOrdersLoaded = (state) => get(state ,'exchange.cancelledOrders.loaded',false)
export const cancelledOrdersLoadedSelector = createSelector(cancelledOrdersLoaded , loaded => loaded)
const cancelledOrders = (state) => get(state ,'exchange.cancelledOrders.data',[])
export const cancelledOrdersSelector = createSelector(cancelledOrders ,o => o)

//Fill Orders
const filledOrdersLoaded = (state) => get(state ,'exchange.filledOrders.loaded',false)
export const filledOrdersLoadedSelector = createSelector(
    filledOrdersLoaded,
    loaded => loaded
)
const filledOrders = (state) => get(state ,'exchange.filledOrders.data',[])
export const filledOrdersSelector = createSelector(
    filledOrders ,
    orders => {
        //Sort orders by date ascending for display for price comparison
        orders.sort((a,b) => a._timestamp - b._timestamp )
        //Decorate the orders
        orders = decorateFilledOrders(orders)
        //Sort orders by date decending for display
        orders.sort((a,b) => b._timestamp - a._timestamp)
        return orders
    }
)
const decorateFilledOrders = (orders) => {
    let previousOrder = orders[0]
    return( 
        orders.map( (order) => {
            order = decorateOrder(order)
            order = decorateFilledOrder(order , previousOrder)
            previousOrder = order
            return order
        })
    )
}
const decorateOrder = (order) =>{
    let etherAmount , tokenAmount
    if(order._tokenGive === ETHER_ADDRESS){
        etherAmount = order._amountGive
        tokenAmount = order._amountGet
    } else {
        etherAmount = order._amountGet
        tokenAmount = order._amountGive
    }
    let precision = 100000
    let tokenPrice =  etherAmount / tokenAmount
    tokenPrice = Math.round(tokenPrice * precision ) / precision
    return ({
        ...order ,
        etherAmount : ether(etherAmount) ,
        tokenAmount : tokens(tokenAmount) ,
        tokenPrice ,
        formattedTimestamp : moment.unix(order._timestamp).format('h:mm:ss a M/D') ,
        formattedTimestamp2 : moment.unix(order._timestamp).format('h:mm:ss A')
    })
}
const decorateFilledOrder = (order ,previousOrder) => {
    return({
        ...order ,
        tokenPriceClass: tokenPriceClass(order.tokenPrice ,order._id ,previousOrder) 
    })
}
const tokenPriceClass = (tokenPrice , orderId ,previousOrder) => {
    if(previousOrder._id === orderId){
        return GREEN
    }
    if(previousOrder.tokenPrice <= tokenPrice){
        return GREEN 
    } else {
        return RED
    }
}

const openOrders = (state) => {
    const all = allOrders(state)
    const closedOrders = filledOrders(state).concat(cancelledOrders(state))
    //Remove closed orders from all orders
    const openOrders = all.filter(orders => !closedOrders.find(order => (order._id === orders._id )))
    return openOrders
}

//Order Book
const orderBookLoaded = (state) => allOrdersLoaded(state) && cancelledOrdersLoaded(state) && filledOrdersLoaded(state)
export const orderBookLoadedSelector = createSelector(orderBookLoaded , loaded => loaded)

export const orderBookSelector = createSelector(
    openOrders ,
    orders => {
        orders = decorateOrderBookOrders(orders)
        //Group orders by orderType
        orders = groupBy(orders ,'orderType')
        //Fetch buy orders
        const buyOrders = get(orders , 'buy', [])
        //sort buy order by token price
        orders = {
            ...orders ,
            buyOrders : buyOrders.sort( (a,b) => b.tokenPrice - a.tokenPrice )
        }
        //For Sell orders
        const sellOrders = get(orders , 'sell', [])
        orders = {
            ...orders ,
            sellOrders : sellOrders.sort( (a,b) => b.tokenPrice - a.tokenPrice )
        }
        return orders
    }
)

const decorateOrderBookOrders = (orders) => {
    return (
        orders.map((order) =>{
            order = decorateOrder(order)
            order = decorateOrderBookOrder(order)
            return order
        })
    )
}

const decorateOrderBookOrder = (order) => {
    //Specifies Buy or Sell 
    const orderType = order._tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
    return({
        ...order ,
        orderType ,
        orderTypeClass : orderType === 'buy' ? GREEN : RED  ,
        orderFillAction : orderType === 'buy' ? 'sell': 'buy'
    })
}


export const myFilledOrdersLoadedSelector = createSelector(filledOrdersLoaded ,loaded=>loaded) 

export const myFilledOrdersSelector = createSelector(
    account ,
    filledOrders ,
    (account ,orders) => {
        // console.log(account)
        // debugger
        //Find our orders
        orders = orders.filter(o=>o._user === account || o._userFill === account)
        //Sort date ascending
        orders = orders.sort((a,b)=>a._timestamp - b._timestamp)
        //Decorate Orders
        orders = decorateMyFilledOrders(orders ,account)
        // console.log(orders)
        // debugger
        return orders
    }
)

const decorateMyFilledOrders = (orders ,account) => {
    return (
        orders.map((order) =>{
            order = decorateOrder(order)
            order = decorateMyFilledOrder(order ,account )
            return order
        })
    )
}


const decorateMyFilledOrder = (order , account) => {
    const myOrder = order._user === account
    // console.log(order._user===account)
    // debugger
    let orderType
    if(myOrder){
        orderType = order._tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
    } else {
        orderType = order._tokenGive === ETHER_ADDRESS ? 'sell' : 'buy'
    }
    return({
        ...order ,
        orderType ,
        orderTypeClass : (orderType === 'buy' ? GREEN : RED  ),
        orderSign : (orderType === 'buy' ? '+': '-')
    })
}

export const myOpenOrdersLoadedSelector = createSelector(orderBookLoaded ,loaded => loaded)
export const myOpenOrdersSelector = createSelector(
    account ,
    openOrders ,
    (account ,orders) => {
        //Find our orders
        orders = orders.filter(o=>o._user === account)
        //Decorate Orders
        orders = decorateMyOpenOrders(orders)
        //Sort date descending
        orders = orders.sort((a,b)=>b._timestamp - a._timestamp)
        // console.log(orders)
        // debugger
        return orders
    }
)

const decorateMyOpenOrders = (orders , account) => {
    return (
        orders.map((order) =>{
            order = decorateOrder(order)
            order = decorateMyOpenOrder(order ,account )
            return order
        })
    )
}

const decorateMyOpenOrder = (order , account) => {
    let orderType = order._tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
    return({
        ...order ,
        orderType ,
        orderTypeClass : (orderType === 'buy' ? GREEN : RED)  
    })
}

export const priceChartLoadedSelector = createSelector(filledOrdersLoaded ,loaded=>loaded) 

export const priceChartSelector = createSelector(
    filledOrders ,
    (orders) => {
        //Sort date ascending
        orders = orders.sort((a,b)=>a._timestamp - b._timestamp)
        //Decorate Orders
        orders = orders.map((o) => decorateOrder(o))
        //Get last 2 order for final price and price change
        let secondLastOrder , lastOrder 
        [secondLastOrder,lastOrder]=orders.slice(orders.length -2 ,orders.length)
        const lastPrice = get(lastOrder, 'tokenPrice', 0)
        const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)
        //console.log(orders)
        return ({
            lastPrice ,
            lastPriceChange :(lastPrice >= secondLastPrice ? '+' : '-') ,
            series: [{
                data : buildGraphData(orders)
            }]
        })
    }
)

const buildGraphData = (orders) => {
    
    //Group the orders by hours
    orders = groupBy(orders , o => moment.unix(o._timestamp).startOf('hour').format())
    //Get each hours where data exist
    const hours = Object.keys(orders)
    //Build the graph series
    const graphData = hours.map( (hour) => {
        //Fetch all the orthers from current hour
        const group = orders[hour]
        //Calculate price values - open ,high ,low ,close
        const open = group[0] //first order
        const high = maxBy(group ,'tokenPrice')// high price
        const low = minBy(group ,'tokenPrice')// low price
        const close = group[group.length -1] // last order
        return({
            x: new Date(hour),
            y:[open.tokenPrice ,high.tokenPrice ,low.tokenPrice ,close.tokenPrice ]
        })
    })
    return graphData
}

const orderCancelling = (state) => get(state ,'exchange.orderCancelling',false)
export const orderCancellingSelector = createSelector(orderCancelling , status => status)

const orderFilling = (state) => get(state ,'exchange.orderFilling',false)
export const orderFillingSelector = createSelector(orderFilling , status => status)


// BALANCES
const balancesLoading = (state) => get(state ,'exchange.balancesLoading',true)
export const balancesLoadingSelector = createSelector(balancesLoading , status => status)



const etherBalance = state => get(state,'web3.balance' ,0)
export const etherBalanceSelector = createSelector(
    etherBalance , 
    balance => {
        return formatBalance(balance)
    }
)

const tokenBalance = state => get(state,'token.balance' ,0)
export const tokenBalanceSelector = createSelector(
    tokenBalance , 
    balance => {
        return formatBalance(balance)
    }
)

const exchangeEtherBalance = state => get(state,'exchange.etherBalance' ,0)
export const exchangeEtherBalanceSelector = createSelector(
    exchangeEtherBalance , 
    balance => {
        return formatBalance(balance)
    }
)

const exchangeTokenBalance = state => get(state,'exchange.tokenBalance' ,0)
export const exchangeTokenBalanceSelector = createSelector(
    exchangeTokenBalance , 
    balance => {
        return formatBalance(balance)
    }
)
    
const etherDepositAmount = state => get(state ,'exchange.etherDepositAmount',null)
export const etherDepositAmountSelector = createSelector(etherDepositAmount ,amount => amount)

const etherWithdrawAmount = state => get(state ,'exchange.etherWithdrawAmount',null)
export const etherWithdrawAmountSelector = createSelector(etherWithdrawAmount ,amount => amount)

const tokenDepositAmount = state => get(state ,'exchange.tokenDepositAmount',null)
export const tokenDepositAmountSelector = createSelector(tokenDepositAmount ,amount => amount)

const tokenWithdrawAmount = state => get(state ,'exchange.tokenWithdrawAmount',null)
export const tokenWithdrawAmountSelector = createSelector(tokenWithdrawAmount ,amount => amount)

const buyOrder = state => get(state ,'exchange.buyOrder',{})
export const buyOrderSelector = createSelector(buyOrder ,order => order)

const sellOrder = state => get(state ,'exchange.sellOrder',{})
export const sellOrderSelector = createSelector(sellOrder ,order => order)


