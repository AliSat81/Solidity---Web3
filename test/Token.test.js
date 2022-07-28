import {tokens,EVM_REVERT} from './helpers'

const Token = artifacts.require('./Token')
require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Token',([deployer,receiver])=> {
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
        let result 
        let amount = tokens(100).toString() 
        describe('success',async=>{
            beforeEach(async() =>{
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
            it('emits a transfer event',async ()=>{
                let log = result.logs[0]
                log.event.should.equal('Transfer')
                let event = log.args
                event.from.toString().should.equal(deployer,'sender address is correct')
                event.to.toString().should.equal(receiver,'receiver address is correct')
                event.value.toString().should.equal(amount,'value is correct')
            })
        })
        describe('failure',async() =>{
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
                await token.transfer(0x0,amount).should.be.rejected
            })
        })
    })
})