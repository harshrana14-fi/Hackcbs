// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract Counter {
    uint256 public x;

    function inc() public {
        x += 1;
    }

    function incBy(uint256 y) public {
        require(y > 0, "y must be greater than 0");
        x += y;
    }
}