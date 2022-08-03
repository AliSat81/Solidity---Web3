import {tokens,EVM_REVERT} from './helpers'

const Token = artifacts.require('./Token')
require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Token',([deployer,receiver,exchange])=> {
    const name = 'DApp Token'
    const symbol = "DAPP"
    const decimals = '18'
    const totalSupply = tokens(1000000).toString()
    
    let token 
    beforeEach(async() =>{
        token = await Token.new()
    })
    
    describe('deployment',()=>{
        it('tracks the name',async ()=>{
            let result = await token.name()
            result.should.equal(name)
        })
        it('tracks the symbol',async ()=>{
            let result = await token.symbol()
            result.should.equal(symbol)
        })
        it('tracks the decimals',async ()=>{
            let result = await token.decimals()
            result.toString().should.equal(decimals)
        })
        it('tracks the total supply',async ()=>{
            let result = await token.totalSupply()
            result.toString().should.equal(totalSupply.toString())
        })
        it('assingns the total supply to the deployer',async()=>{
            let result = await token.balanceOf(deployer)
            result.toString().should.equal(totalSupply.toString())
        })
    })

    describe('sending tokens',()=>{
        let result , amount  
        describe('success',()=>{
            beforeEach(async() =>{
                amount = tokens(100).toString()
                result = await token.transfer(receiver,amount , {from: deployer})
            })
            it("transfer token balances",async ()=>{
                let balanceOf 
                //sender
                balanceOf = await token.balanceOf(deployer)
                balanceOf.toString().should.equal(tokens(999900).toString())
                //reciver
                balanceOf = await token.balanceOf(receiver)
                balanceOf.toString().should.equal(amount.toString())
            })
            it('emits a Transfer event',async ()=>{
                let log = result.logs[0]
                log.event.should.equal('Transfer')
                let event = log.args
                event._from.toString().should.equal(deployer,'sender address is correct')
                event._to.toString().should.equal(receiver,'receiver address is correct')
                event._value.toString().should.equal(amount,'value is correct')
            })
        })
        describe('failure',() =>{
            it('rejects insufficient balances',async()=>{
                let invalidAmaunt
                // 100 million - greater than total supply
                invalidAmaunt = tokens(100000000)
                await token.transfer(receiver,invalidAmaunt,{from : deployer}).should.be.rejectedWith(EVM_REVERT)
                // attemot transfer tokens , when you have none
                invalidAmaunt = tokens(10)//receiver have none
                await token.transfer(deployer,invalidAmaunt,{from : receiver}).should.be.rejectedWith(EVM_REVERT)
            })
            it('rejects , invalid receiver address',async()=>{
                await token.transfer(0x0,amount,{from:deployer}).should.be.rejected
            })
        })
    })
    describe('approving tokens',()=>{
        let amount , result
        beforeEach(async() =>{
            amount = tokens(100).toString()
            result = await token.approve(exchange,amount , {from: deployer})
        })
        describe('success',()=>{
            it('allocates an allowance for delegated token spending on exchange',async ()=>{
                const allowance = await token.allowance(deployer,exchange)
                allowance.toString().should.equal(amount.toString())
            })
            it('emits an Approval event',async()=>{
                let log = result.logs[0]
                log.event.should.equal('Approval')
                let event = log.args
                event._owner.toString().should.equal(deployer,'owner address is correct')
                event._spender.toString().should.equal(exchange,'exchange address is correct')
                event._value.toString().should.equal(amount,'value is correct')
            })
        })
        describe('failure',()=>{
            it('rejects invalid spenders',async ()=>{
                await token.approve(0x0,amount,{from:deployer}).should.be.rejected
            })
        })
    })
    describe('delegated token transfers',()=>{
        let result , amount  
        beforeEach(async ()=>{
            amount= tokens(100)
            await token.approve(exchange,amount,{from:deployer})
        })
        describe('success',async()=>{
            beforeEach(async()=>{
                result= await token.transferFrom(deployer,receiver,amount,{from:exchange})
            })
            it("transfer token balances",async ()=>{
                let balanceOf 
                //sender
                balanceOf = await token.balanceOf(deployer)
                balanceOf.toString().should.equal(tokens(999900).toString())
                //reciver
                balanceOf = await token.balanceOf(receiver)
                balanceOf.toString().should.equal(amount.toString())
            })
            it('resets the allowance',async ()=>{
                const allowance = await token.allowance(deployer,exchange)
                allowance.toString().should.equal('0')
            })
            it('emits a Transfer event',async ()=>{
                let log = result.logs[0]
                log.event.should.equal('Transfer')
                let event = log.args
                event._from.toString().should.equal(deployer,'sender address is correct')
                event._to.toString().should.equal(receiver,'receiver address is correct')
                event._value.toString().should.equal(amount.toString(),'value is correct')
            })
        })
        describe('failure',() =>{
            it('rejects insufficient balances',async()=>{
                let invalidAmaunt
                // 100 million - greater than total supply - Too many tokens
                invalidAmaunt = tokens(100000000)
                await token.transferFrom(deployer,receiver,invalidAmaunt,{from : exchange}).should.be.rejectedWith(EVM_REVERT)
            })
            it('rejects , invalid receiver address',async()=>{
                await token.transfer(deployer,0x0,amount,{from:exchange}).should.be.rejected
            })
        })
    })
})