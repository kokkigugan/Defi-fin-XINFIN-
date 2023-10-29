//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

/**
 * @title XDC TokenHub interface
 * @dev Helps in transfers of XDC and XRC20 tokens
 */
interface ITokenHub {
    function transferOut(
        address recipient,
        uint256 amount
    ) external payable returns (bool);

    function undelegate(
        uint256 amount
    ) external returns (bool);

}
