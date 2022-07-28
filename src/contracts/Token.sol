pragma solidity >=0.4.22 <0.9.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
//SPDX-License-Identifier: UNLICENSED
contract Token {
    using SafeMath for uint;

    //Variables
    string public name = "DApp Token";
    string public symbol = "DAPP";
    uint256 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf ;

    //Evsnts
    event Transfer(address indexed from ,address indexed to , uint256 value);

    constructor () {
        totalSupply = 1000000 *(10**18);
        balanceOf[msg.sender]= totalSupply ;
    }

    function transfer(address _to,uint256 _value) public returns (bool success) {
        require(_to != address(0));
        require(balanceOf[msg.sender]>=_value);
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
        balanceOf[_to]= balanceOf[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true ;
    }
}