import { result } from 'lodash'
import Web3 from 'web3'
import {ether,tokens,EVM_REVERT,ETHER_ADDRESS} from './helpers'
const Token = artifacts.require('./Token')
const Exchange = artifacts.require('./Exchange')
require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Exchange',([deployer,feeAccount,user1])=> {
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
       it('reverts when Erher is sent',async()=>{
            await exchange.sendTransaction({from :user1,value : ether(1)}).should.rejectedWith(EVM_REVERT) 
       }) 
    })
    describe('depositing Ether',async ()=>{
        let result
        let amount = ether(1) 
        beforeEach(async()=>{
            result = await exchange.depositEther({from : user1 , value: amount })
        })
        it('tracks the Ether deposit',async() =>{
            let balance = await exchange.tokens(ETHER_ADDRESS,user1)
            balance.toString().should.eql(amount.toString())
        })
        it('emits a "Deposit" event',async ()=>{
            let log = result.logs[0]
            log.event.should.equal('Deposit')
            let event = log.args
            event._token.toString().should.equal(ETHER_ADDRESS,'token address address is correct')
            event._user.toString().should.equal(user1,'user address is correct')
            event._amount.toString().should.equal(amount.toString(),'amount is correct')
            event._balance.toString().should.equal(amount.toString(),'balance is correct')
        })
    })
    describe('withdrawing Ether',async()=>{
        let result 
        let amount = ether(1)
        beforeEach(async()=>{
            result = await exchange.depositEther({ from : user1 , value : amount})
        })
        describe('success',async()=>{
            beforeEach(async()=>{
                result = await exchange.withdrawEther(amount ,{ from: user1 })
            })
            it('withdraw Ether funds',async()=>{
                let balance = await exchange.tokens(ETHER_ADDRESS,user1)
                balance.toString().should.eql('0')
            })
            it('emits a "Withdraw" event',async ()=>{
                let log = result.logs[0]
                log.event.should.equal('Withdraw')
                let event = log.args
                event._token.toString().should.equal(ETHER_ADDRESS,'token address address is correct')
                event._user.toString().should.equal(user1,'user address is correct')
                event._amount.toString().should.equal(amount.toString(),'amount is correct')
                event._balance.toString().should.equal('0','balance is correct')
            })
        })
        describe('failure',async()=>{
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
            it('emits a Deposit event',async ()=>{
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
    describe('withdrawing tokens',async()=>{
        let result 
        let amount = tokens(10)
        describe('success',async()=>{
            beforeEach(async()=>{
                await token.approve(exchange.address,amount,{from: user1})
                await exchange.depositToken(token.address,amount,{from : user1})
                result = await exchange.withdrawToken(token.address,amount,{from :user1})
            })
            it('withdraw token funds',async()=>{
                let balance = await exchange.tokens(token.address,user1)
                balance.toString().should.eql('0')
            })
            it('emits a "Withdraw" event',async ()=>{
                let log = result.logs[0]
                log.event.should.equal('Withdraw')
                let event = log.args
                event._token.toString().should.equal(token.address,'token address address is correct')
                event._user.toString().should.equal(user1,'user address is correct')
                event._amount.toString().should.equal(amount.toString(),'amount is correct')
                event._balance.toString().should.equal('0','balance is correct')
            })
        })
        describe('failure',async()=>{
            it('rejects Ether withdraws',async()=>{
                await exchange.withdrawToken(ETHER_ADDRESS,amount,{ from: user1 }).should.rejectedWith(EVM_REVERT)
            })
            //withdraw without any deposit
            it('fails for insufficient balances',async()=>{
                await exchange.withdrawToken(token.address,amount,{ from: user1 }).should.rejectedWith(EVM_REVERT)
            })
        })
    })
    describe('checking balances',async()=>{
        let amount = ether(1) , result
        beforeEach(async() =>{
            await exchange.depositEther({from : user1 , value : amount })
        })
        it('returns user balance',async()=>{
            result = await exchange.balanceOf(ETHER_ADDRESS,user1)
            result.toString().should.eql(amount.toString())
        })
    })
})