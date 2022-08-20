pragma solidity >=0.4.22 <0.9.0;
import "./Token.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
//SPDX-License-Identifier: UNLICENSED
// TODO:
    // [X]Set the fee account
    // [X]Deposit Ether
    // [X]Withdraw Ether
    // [X]Deposit tokens
    // [X]Withdraw tokens
    // [X]Check balances
    // [X]Make order
    // [X]Cancel order
    // [X]Fill order
        // Fetch the order
        // Execute trade
        // Charge fees
        // Emit trade event
        // Mark order as filled
    // [X]Charge fees
contract Exchange {
    using SafeMath for uint;

    address public feeAccount ;
    uint256 public feePercent ;
    address constant ETHER = address(0);
    mapping(address => mapping(address => uint256)) public tokens ;
    mapping(uint256 => _Order ) public orders;
    uint256 public orderCount ;
    mapping(uint256 => bool) public orderCancelled ;
    mapping(uint256 => bool) public orderFilled ;
    struct _Order {
        uint256 id ;address user ;
        address tokenGet ;uint256 amountGet ;
        address tokenGive ;uint256 amountGive ;
        uint256 timestamp ;
    }

    constructor(address _feeAccount , uint256 _feePercent){
        feeAccount = _feeAccount ;
        feePercent = _feePercent ;
    }
    event Deposit  (address _token ,address _user ,uint256 _amount ,uint256 _balance );
    event Withdraw (address _token ,address _user ,uint256 _amount ,uint256 _balance );
    event Order    (uint256 _id ,address _user ,address _tokenGet ,uint256 _amountGet ,address _tokenGive ,uint256 _amountGive ,uint256 _timestamp );
    event Cancel   (uint256 _id ,address _user ,address _tokenGet ,uint256 _amountGet ,address _tokenGive ,uint256 _amountGive ,uint256 _timestamp );
    event Trade    (uint256 _id ,address _user ,address _tokenGet ,uint256 _amountGet ,address _tokenGive ,uint256 _amountGive ,address _userFill ,uint256 _timestamp );
    
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
        emit Withdraw(ETHER ,msg.sender ,_amount ,tokens[ETHER][msg.sender] );
    }
    function depositToken( address _token ,uint256 _amount ) public {
        require(_token != ETHER );
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender]= tokens[_token][msg.sender].add(_amount);
        emit Deposit( _token, msg.sender ,_amount ,tokens[_token][msg.sender] );
    }
    function withdrawToken( address _token ,uint256 _amount ) public {
        require((_token != ETHER));
        require(tokens[_token][msg.sender] >= _amount);
        tokens[_token][msg.sender]= tokens[_token][msg.sender].sub(_amount);
        require(Token(_token).transfer(msg.sender ,_amount));
        emit Withdraw(_token ,msg.sender ,_amount ,tokens[_token][msg.sender] );
    }
    function balanceOf( address _token ,address _user ) public view returns (uint256){
        return tokens[_token][_user];
    }
    function makeOrder( address _tokenGet ,uint256 _amountGet ,address _tokenGive ,uint256 _amountGive ) public {
        orderCount =  orderCount.add(1) ;
        orders[orderCount] = _Order(orderCount ,msg.sender ,_tokenGet ,_amountGet ,_tokenGive ,_amountGive ,block.timestamp );
        emit Order(orderCount ,msg.sender ,_tokenGet ,_amountGet ,_tokenGive ,_amountGive ,block.timestamp );
    }
    function cancelOrder(uint256 _id) public {
        _Order storage _order = orders[_id];
        require(address(_order.user)==msg.sender);
        require(_order.id == _id);
        orderCancelled[_id] = true ;
        emit Cancel(_order.id ,msg.sender ,_order.tokenGet ,_order.amountGet ,_order.tokenGive ,_order.amountGive ,block.timestamp );
    }
    function fillOrder( uint256 _id ) public {
        require(_id > 0 && _id <= orderCount,  'Error, wrong id');
        require(! orderFilled[_id] , 'Error, order already filled' );
        require(! orderCancelled[_id] , 'Error, order already cancelled');
        _Order storage _order = orders[_id];
        _trade(_order.id ,_order.user ,_order.tokenGet ,_order.amountGet ,_order.tokenGive ,_order.amountGive );
        orderFilled[_order.id] = true;
    }
    function _trade( uint256 _orderId ,address _user ,address _tokenGet ,uint256 _amountGet ,address _tokenGive ,uint256 _amountGive ) internal {
        uint256 _feeAmount = _amountGive.mul(feePercent).div(100);
        tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender].sub(_amountGet.add(_feeAmount));
        tokens[_tokenGet][_user] = tokens[_tokenGet][_user].add(_amountGet);
        tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount].add(_feeAmount);
        tokens[_tokenGive][_user] = tokens[_tokenGive][_user].sub(_amountGive);
        tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender].add(_amountGive);
        emit Trade( _orderId ,_user ,_tokenGet ,_amountGet ,_tokenGive ,_amountGive ,msg.sender ,block.timestamp );
    }
}

