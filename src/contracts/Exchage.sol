pragma solidity >=0.4.22 <0.9.0;
import "./Token.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
//SPDX-License-Identifier: UNLICENSED
contract Exchange {
    using SafeMath for uint;

    address public feeAccount ;
    uint256 public feePercent ;
    address constant ETHER = address(0);
    mapping(address => mapping(address => uint256)) public tokens ;

    constructor(address _feeAccount , uint256 _feePercent){
        feeAccount = _feeAccount ;
        feePercent = _feePercent ;
    }
    event Deposit (address _token ,address _user ,uint256 _amount ,uint256 _balance );
    event Withdraw (address _token ,address _user ,uint256 _amount ,uint256 _balance );

    fallback() external {
        revert();
    }
    function depositEther() payable public {
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
        emit Deposit(ETHER , msg.sender , msg.value , tokens[ETHER][msg.sender]);
    }
    function withdrawEther(uint256 _amount) public {
        require( tokens[ETHER][msg.sender] >= _amount );
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
        payable(msg.sender).transfer(_amount);
        emit Withdraw(ETHER , msg.sender , _amount , tokens[ETHER][msg.sender]);
    }
    function depositToken(address _token, uint256 _amount) public {
        require(_token != ETHER );
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender]= tokens[_token][msg.sender].add(_amount);
        emit Deposit(_token , msg.sender , _amount , tokens[_token][msg.sender]);
    }
    function withdrawToken(address _token ,uint256 _amount) public {
        require((_token != ETHER));
        require(tokens[_token][msg.sender] >= _amount);
        tokens[_token][msg.sender]= tokens[_token][msg.sender].sub(_amount);
        require(Token(_token).transfer(msg.sender, _amount));
        emit Withdraw(_token , msg.sender , _amount , tokens[_token][msg.sender]);
    }
    function balanceOf(address _token,address _user) public view returns (uint256){
        return tokens[_token][_user];
    }
}