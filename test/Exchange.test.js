import { now } from 'moment'
import {ether,tokens,EVM_REVERT,ETHER_ADDRESS} from './helpers'
const Token = artifacts.require('./Token')
const Exchange = artifacts.require('./Exchange')
require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Exchange',([deployer,feeAccount,user1,user2])=> {
    let exchange
    let token
    const feePercent = 10

    beforeEach(async() =>{
        //Deploy Token
        token = await Token.new()
        //Transfer some tokens to user1
        token.transfer(user1, tokens(10), {from: deployer})
        //Deploy Exchange
        exchange = await Exchange.new(feeAccount,feePercent)
    })
    
    describe('deployment',()=>{
        it('tracks the fee account',async ()=>{
            const result = await exchange.feeAccount()
            result.should.equal(feeAccount)
        })
        it('tracks the fee percent',async ()=>{
            const result = await exchange.feePercent()
            result.toString().should.equal(feePercent.toString())
        })
    })
    describe('fallback',()=>{
       it('reverts when Ether is sent',async()=>{
            await exchange.sendTransaction({from :user1,value : ether(1)}).should.rejectedWith(EVM_REVERT) 
       }) 
    })
    describe('depositing Ether',()=>{
        let result
        let amount = ether(1) 
        beforeEach(async()=>{
            result = await exchange.depositEther({from : user1 , value: amount })
        })
        it('tracks the Ether deposit',async() =>{
            let balance = await exchange.tokens(ETHER_ADDRESS,user1)
            balance.toString().should.eql(amount.toString())
        })
        it('emits a "Deposit" event',()=>{
            let log = result.logs[0]
            log.event.should.equal('Deposit')
            let event = log.args
            event._token.toString().should.equal(ETHER_ADDRESS,'token address address is correct')
            event._user.toString().should.equal(user1,'user address is correct')
            event._amount.toString().should.equal(amount.toString(),'amount is correct')
            event._balance.toString().should.equal(amount.toString(),'balance is correct')
        })
    })
    describe('withdrawing Ether',()=>{
        let result 
        let amount = ether(1)
        beforeEach(async()=>{
            result = await exchange.depositEther({ from : user1 , value : amount})
        })
        describe('success',()=>{
            beforeEach(async()=>{
                result = await exchange.withdrawEther(amount ,{ from: user1 })
            })
            it('withdraw Ether funds',async()=>{
                let balance = await exchange.tokens(ETHER_ADDRESS,user1)
                balance.toString().should.eql('0')
            })
            it('emits a "Withdraw" event', ()=>{
                let log = result.logs[0]
                log.event.should.equal('Withdraw')
                let event = log.args
                event._token.toString().should.equal(ETHER_ADDRESS,'token address address is correct')
                event._user.toString().should.equal(user1,'user address is correct')
                event._amount.toString().should.equal(amount.toString(),'amount is correct')
                event._balance.toString().should.equal('0','balance is correct')
            })
        })
        describe('failure',()=>{
            it('rejects withdraws for insufficient balances',async()=>{
                await exchange.withdrawEther(ether(100),{ from: user1 }).should.rejectedWith(EVM_REVERT)
            })
        })
    })
    describe('depositing tokens',()=>{
        let result
        let amount
        describe('success',()=>{
            beforeEach(async()=>{
                amount = tokens(10)
                await token.approve(exchange.address,amount,{from : user1})
                result = await exchange.depositToken(token.address,amount,{ from : user1})
            })

            it('tracks the token deposit',async() =>{
                //Check exchange token balances
                let balance 
                balance = await token.balanceOf(exchange.address)
                balance.toString().should.equal(amount.toString())
                //Check tokens on exchange
                balance = await exchange.tokens(token.address,user1)
                balance.toString().should.equal(amount.toString())
            })
            it('emits a Deposit event', ()=>{
                let log = result.logs[0]
                log.event.should.equal('Deposit')
                let event = log.args
                event._token.toString().should.equal(token.address,'token address address is correct')
                event._user.toString().should.equal(user1,'user address is correct')
                event._amount.toString().should.equal(amount.toString(),'amount is correct')
                event._balance.toString().should.equal(amount.toString(),'balance is correct')
            })
        })
        describe('failure',()=>{
            it('rejects Ether deposit' , async()=>{
                await exchange.depositToken(ETHER_ADDRESS,tokens(10),{from : user1 }).should.rejectedWith(EVM_REVERT)
            })
            it('fails when no tokens are approved',async()=>{
                //Dont approve any tokens before depositing 
                await exchange.depositToken(token.address,tokens(10),{from : user1}).should.rejectedWith(EVM_REVERT)
            })
        })
    })
    describe('withdrawing tokens',()=>{
        let result 
        let amount = tokens(10)
        describe('success',()=>{
            beforeEach(async()=>{
                await token.approve(exchange.address,amount,{from: user1})
                await exchange.depositToken(token.address,amount,{from : user1})
                result = await exchange.withdrawToken(token.address,amount,{from :user1})
            })
            it('withdraw token funds',async()=>{
                let balance = await exchange.tokens(token.address,user1)
                balance.toString().should.eql('0')
            })
            it('emits a "Withdraw" event', ()=>{
                let log = result.logs[0]
                log.event.should.equal('Withdraw')
                let event = log.args
                event._token.toString().should.equal(token.address,'token address address is correct')
                event._user.toString().should.equal(user1,'user address is correct')
                event._amount.toString().should.equal(amount.toString(),'amount is correct')
                event._balance.toString().should.equal('0','balance is correct')
            })
        })
        describe('failure',()=>{
            it('rejects Ether withdraws',async()=>{
                await exchange.withdrawToken(ETHER_ADDRESS,amount,{ from: user1 }).should.rejectedWith(EVM_REVERT)
            })
            //withdraw without any deposit
            it('fails for insufficient balances',async()=>{
                await exchange.withdrawToken(token.address,amount,{ from: user1 }).should.rejectedWith(EVM_REVERT)
            })
        })
    })
    describe('checking balances',()=>{
        let amount = ether(1) , result
        beforeEach(async() =>{
            await exchange.depositEther({from : user1 , value : amount })
        })
        it('returns user balance',async()=>{
            result = await exchange.balanceOf(ETHER_ADDRESS,user1)
            result.toString().should.eql(amount.toString())
        })
    })
    describe('making orders',()=>{
        let result
        beforeEach(async()=>{
            result = await exchange.makeOrder(token.address , tokens(1) ,ETHER_ADDRESS, ether(1), {from : user1})
        })
        it('tracks the newly created order',async ()=>{
            let orderCount = await exchange.orderCount()
            orderCount.toString().should.equal('1')
            let order = await exchange.orders('1')
            order.id.toString().should.equal('1')
            order.user.toString().should.equal(user1,'user is correct')
            order.tokenGet.should.equal(token.address,'tokenGet is correct')
            order.amountGet.toString().should.equal(tokens(1).toString(),'amountGet is correct')
            order.tokenGive.should.equal(ETHER_ADDRESS,'tokenGive is correct')
            order.amountGive.toString().should.equal(ether(1).toString(),'amountGive is correct')
            order.timestamp.toString().should.have.lengthOf(10)
        })
        it('emits an "Order" event',()=>{
            let log = result.logs[0]
            log.event.should.equal('Order')
            let event = log.args
            event._id.toString().should.equal('1')
            event._user.toString().should.equal(user1,'user is correct')
            event._tokenGet.should.equal(token.address,'tokenGet is correct')
            event._amountGet.toString().should.equal(tokens(1).toString(),'amountGet is correct')
            event._tokenGive.should.equal(ETHER_ADDRESS,'tokenGive is correct')
            event._amountGive.toString().should.equal(ether(1).toString(),'amountGive is correct')
            event._timestamp.toString().should.have.lengthOf(10)
        })
    })
    describe('order actions',()=>{
        beforeEach(async ()=>{
            //user1 deposit Ether
            await exchange.depositEther({ from: user1, value: ether(1) })
            //give tokens to user2
            await token.transfer(user2 ,tokens(100) , { from: deployer })
            //user2 deposits tokens only
            await token.approve(exchange.address, tokens(2), { from: user2 })
            await exchange.depositToken(token.address ,tokens(2), { from: user2 })
            //user1 makes an order to by tokens with Ether
            await exchange.makeOrder(token.address ,tokens(1) ,ETHER_ADDRESS ,ether(1) ,{ from: user1 })
        })
        describe('filling orders',()=>{
            let result
            describe('suucess',()=>{
                beforeEach(async()=>{
                    //user2 fills order
                    result = await exchange.fillOrder('1' ,{ from: user2 })
                })
                it('execute the trade and charge fees',async()=>{
                    let balance
                    balance = await exchange.balanceOf(token.address ,user1)
                    balance.toString().should.equal(tokens(1).toString() ,'user1 recived tokens')
                    balance = await exchange.balanceOf(ETHER_ADDRESS ,user2)
                    balance.toString().should.equal(tokens(1).toString() ,'user2 recived Ether')
                    balance = await exchange.balanceOf(ETHER_ADDRESS ,user1)
                    balance.toString().should.equal('0' ,'user2 Ether deducted')
                    balance = await exchange.balanceOf(token.address ,user2)
                    balance.toString().should.equal(tokens(0.9).toString() ,'user2 tokens deducted with fee applied')
                    balance = await exchange.balanceOf(token.address ,feeAccount)
                    balance.toString().should.equal(tokens(0.1).toString() ,'feeAccount recived fee')
                })
                it('updates filled orders',async()=>{
                    let orderFilled = await exchange.orderFilled(1)
                    orderFilled.should.equal(true)
                })
                it('emits a "Trade" event',async()=>{
                    let log = result.logs[0]
                    log.event.should.equal('Trade')
                    let event = log.args
                    event._id.toString().should.equal('1')
                    event._user.toString().should.equal(user1,'user is correct')
                    event._tokenGet.should.equal(token.address,'tokenGet is correct')
                    event._amountGet.toString().should.equal(tokens(1).toString(),'amountGet is correct')
                    event._tokenGive.should.equal(ETHER_ADDRESS,'tokenGive is correct')
                    event._amountGive.toString().should.equal(ether(1).toString(),'amountGive is correct')
                    event._userFill.should.equal(user2 ,'userFill is correct')
                    event._timestamp.toString().should.have.lengthOf(10)    
                })
            })
            describe('failure',()=>{
                it('rejects invalid order ids',async()=>{
                    let invalidOrderId = 99999
                    await exchange.fillOrder(invalidOrderId, { from: user2 }).should.be.rejectedWith(EVM_REVERT)
                })
                it('rejects already-filled orders',async()=>{
                    //Fill the order
                    await exchange.fillOrder('1' ,{ from: user2 }).should.be.fulfilled
                    //Try to fill it again
                    await exchange.fillOrder('1' ,{ from: user2 }).should.be.rejectedWith(EVM_REVERT)
                })
                it('rejects cancelled orders',async()=>{
                    //Cancel the order
                    await exchange.cancelOrder('1' ,{ from: user1 }).should.be.fulfilled
                    //Try to fill the order
                    await exchange.fillOrder('1' ,{ from: user2 }).should.be.rejectedWith(EVM_REVERT)
                })
            })
        })
        describe('cancelling orders',()=>{
            let result 
            describe('success',()=>{
                beforeEach(async()=>{
                    result = await exchange.cancelOrder('1',{ from: user1 })
                })
                it('updates cancelled orders', async()=>{
                    let orderCancelled = await exchange.orderCancelled(1)
                    orderCancelled.should.equal(true)
                })
                it('emits an "Cancel" event',()=>{
                    let log = result.logs[0]
                    log.event.should.equal('Cancel')
                    let event = log.args
                    event._id.toString().should.equal('1')
                    event._user.toString().should.equal(user1,'user is correct')
                    event._tokenGet.should.equal(token.address,'tokenGet is correct')
                    event._amountGet.toString().should.equal(tokens(1).toString(),'amountGet is correct')
                    event._tokenGive.should.equal(ETHER_ADDRESS,'tokenGive is correct')
                    event._amountGive.toString().should.equal(ether(1).toString(),'amountGive is correct')
                    event._timestamp.toString().should.have.lengthOf(10)
                })
            })
            describe('failure',()=>{
                 it('rejects invalid order ids',async()=>{
                    let invalidOrderId = 99999
                    await exchange.cancelOrder(invalidOrderId, { from: user1 }).should.be.rejectedWith(EVM_REVERT)
                 })
                 it('rejects unaouthorized cancelations',async()=>{
                    // Try to cancel an order from another user
                    await exchange.cancelOrder('1',{ from: user2 }).should.be.rejectedWith(EVM_REVERT)
                })
            })
        })
    })
})