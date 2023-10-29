// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import {ITokenHub} from "../interfaces/ITokenHub.sol";

contract TokenHubMock is ITokenHub {

    function transferOut(
        address /*recipient*/,
        uint256 /*amount*/
    ) external payable override returns (bool) {
        return true;
    }

    function undelegate(
        uint256 amount
    ) external override returns (bool) {
        Address.sendValue(payable(msg.sender), amount);
        return true;
    }

}
