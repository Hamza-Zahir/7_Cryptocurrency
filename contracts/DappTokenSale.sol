// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./DappToken.sol";

contract DappTokenSale is DappToken {
    address admin;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address buyer, uint256 amount);

    constructor() {
        admin = msg.sender;
        tokenPrice = 1000000000000000; //BNB in wei
    }

    function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        require(balanceOf[address(this)] >= _numberOfTokens);
        // require(transfer(msg.sender, _numberOfTokens));
        balanceOf[address(this)] -= _numberOfTokens;
        balanceOf[msg.sender] += _numberOfTokens;
        tokensSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }

    function getProfits() public {
        require(msg.sender == admin);
        payable(admin).transfer(address(this).balance);
    }

     function endSale() public {
          require(msg.sender == admin);
        balanceOf[msg.sender] += balanceOf[address(this)];
        balanceOf[address(this)] = 0;
          // require(transfer(admin, balanceOf[address(this)]));

          // UPDATE: Let's not destroy the contract here
          // Just transfer the balance to the admin
          // payable(admin).transfer(address(this).balance);
      }
}
