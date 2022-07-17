import Web3 from "web3";
import big from "big.js";
import dataCcontract from "../build/contracts/DappTokenSale.json";
const AbiCcontract = dataCcontract.abi;
const contractAddres = "0xAA5A5ec01ed9F160512B03Ae3416F3816f8f4E20";

const state = {
  TotalSupply: "",
  maxTotalSupply: "",
  tokenSold: "",
};

const getters = {
  TotalSupply: (state) => state.TotalSupply,
  maxTotalSupply: (state) => state.maxTotalSupply,
  tokenSold: (state) => state.tokenSold,
};
const actions = {
  async getContractData({ commit }) {
    try {
      const ethereum = await window.ethereum;
      if (ethereum) {
        const web3 = new Web3(Web3.givenProvider || ethereum);
        const DappTokenSaleContract = new web3.eth.Contract(
          AbiCcontract,
          contractAddres
        );
        const _contractBalance = await DappTokenSaleContract.methods
          .balanceOf(contractAddres)
          .call();
        const _tokenSold = await DappTokenSaleContract.methods
          .tokensSold()
          .call();
        const _maxTotalSupply = await DappTokenSaleContract.methods
          .totalSupply()
          .call();

        commit("setTokenSold", Number(_tokenSold));
        commit("setMaxTotalSupply", Number(_maxTotalSupply));
        const _totalSupply = big(_contractBalance).add(_tokenSold);
        commit("setTotalSupply", Number(_totalSupply));


      }
    } catch (error) {
      console.log(error);
    }
  },

  // async trunsfer(){
  //   const ethereum = await window.ethereum;
  //     const web3 = new Web3(Web3.givenProvider || ethereum);
  //     const DappTokenSaleContract = new web3.eth.Contract(
  //       AbiCcontract,
  //       contractAddres
  //     );
  //     await DappTokenSaleContract.methods.transfer(contractAddres, 800000).send(
  //       {
  //         from: "0x780c37F286DF1b1309c94828b53f50987635Ad31"
  //       }
  //     )
  // }
  // async getProfits(){
  //       const ethereum = await window.ethereum;
  //     const web3 = new Web3(Web3.givenProvider || ethereum);
  //     const DappTokenSaleContract = new web3.eth.Contract(
  //       AbiCcontract,
  //       contractAddres
  //     );
  //     await DappTokenSaleContract.methods.getProfits().send(
  //       {
  //         from: "0x780c37F286DF1b1309c94828b53f50987635Ad31"
  //       }
  //     )
  // }
};
const mutations = {
  setTotalSupply: (state, TotalSupply) => (state.TotalSupply = TotalSupply),
  setMaxTotalSupply: (state, maxTotalSupply) =>
    (state.maxTotalSupply = maxTotalSupply),
  setTokenSold: (state, tokenSold) => (state.tokenSold = tokenSold),
};

export default {
  state,
  getters,
  actions,
  mutations,
};
