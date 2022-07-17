import Web3 from "web3";
import Big from "big.js";
import dataCcontract from "../build/contracts/DappTokenSale.json";
const AbiCcontract = dataCcontract.abi;
const contractAddres = "0xAA5A5ec01ed9F160512B03Ae3416F3816f8f4E20";

export default {
  async getUserBalance(_CurrentAccount) {
    try {
      const ethereum = window.ethereum;
      const web3 = new Web3(Web3.givenProvider || ethereum);
      const DappTokenSaleContract = new web3.eth.Contract(
        AbiCcontract,
        contractAddres
      );

      const _userBlance = await DappTokenSaleContract.methods
        .balanceOf(_CurrentAccount)
        .call();
      return Number(_userBlance);
    } catch (error) {
      console.log(error);
    }
  },
  async buyTokens(_CurrentAccount, _TokensAmount) {
    try {
      const ethereum = window.ethereum;
      const web3 = new Web3(Web3.givenProvider || ethereum);
      const DappTokenSaleContract = new web3.eth.Contract(
        AbiCcontract,
        contractAddres
      );
const _Amount = Big(_TokensAmount).times(0.001).times(10**18).toFixed()
      const _userBlance = await DappTokenSaleContract.methods
        .buyTokens(_TokensAmount)
        .send({
          from: _CurrentAccount,
          value: _Amount
        });
      return Number(_userBlance);
    } catch (error) {
      console.log(error);
    }
  },
};
