import { ethers } from "ethers";

export function hashBid(amount, salt) {
  return ethers.solidityPackedKeccak256(
    ["uint256", "bytes32"],
    [amount, ethers.encodeBytes32String(salt)]
  );
}
