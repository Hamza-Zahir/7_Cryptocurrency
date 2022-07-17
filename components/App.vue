<template>
  <div>
    <div
      class="bg-dark text-light p-2 d-flex justify-content-around align-items-center"
    >
      <h2 class="">DApp Token ICO Sele</h2>
      <div
        class="btn btn-primary"
        :class="CurrentAccount && ChainId != 97 ? 'btn-warning' : ''"
        @click="
          () => {
            connectMetamask();
          }
        "
      >
        {{
          CurrentAccount && ChainId == 97
            ? `${CurrentAccount.slice(0, 5)}...${CurrentAccount.slice(
                CurrentAccount.length - 4
              )}`
            : CurrentAccount && ChainId != 97
            ? "network erore"
            : " Conect Wallet"
        }}
      </div>
    </div>
    <div class="col-10 mx-auto mt-4 p-2">
      <div class="border p-2 my-2 rounded">
        <h5>introducting "DApp Token" (BDAPP)!</h5>

        <div class="mt-3">
          <div class="d-flex my-2">
            <span style="width: 160px" class="text-right mr-2">
              <b>Token Price :</b>
            </span>
            0.001 <b class="ml-1"> BNB </b>
          </div>
          <div class="d-flex my-2">
            <span style="width: 160px" class="text-right mr-2"
              ><b>Token Sold :</b></span
            >
            {{ tokenSold ? tokenSold : "--" }} <b class="ml-1"> BDAPP </b>
          </div>

          <div class="d-flex my-2">
            <span style="width: 160px" class="text-right mr-2">
              <b>Total Supply :</b></span
            >
            {{ TotalSupply ? TotalSupply : "----" }} <b class="ml-1"> BDAPP </b>
          </div>

          <div class="d-flex my-2">
            <span style="width: 160px" class="text-right mr-2">
              <b>Max Total Supply :</b></span
            >
            {{ maxTotalSupply ? maxTotalSupply : "----" }}
            <b class="ml-1"> BDAPP </b>
          </div>
          <div v-if="CurrentAccount" class="d-flex my-2">
            <span style="width: 160px" class="text-right mr-2"
              ><b>You Currently Have :</b></span
            >
            {{ userBlance }} <b class="ml-1"> BDAPP </b>.
          </div>
        </div>
      </div>
      <div v-if="tokenSold" class="sold-box my-3 border rounded text-center">
        {{ `Token Sold: ${(100 / TotalSupply) * tokenSold}% BDAPP` }}
        <div
          class="rounded sold"
          :style="`width: ${(100 / TotalSupply) * tokenSold}%`"
        ></div>
      </div>
      <div class="border d-flex rounded my-3">
        <input
          type="number"
          name=""
          :value="amountTokens"
          id=""
          class="col"
          placeholder="BDAPP"
          @input="
            (e) => {
              amountTokens = e.target.value;
            }
          "
        />
        <div
          class="btn btn-primary"
          @click="
            () => {
              BuyTokens();
            }
          "
        >
          Buy Tokens
        </div>
      </div>
      <div class="notice-bg p-3">
        <span>NOTICE:</span> This token sale uses Binance Smart Chain Testnet
        Network with fake BNB
      </div>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import plugins from "../plugins/index";

export default {
  data() {
    return {
      amountTokens: "",
    };
  },
  computed: {
    ...mapGetters(["CurrentAccount"]),
    ...mapGetters(["ChainId"]),
    ...mapGetters("contractdata", ["TotalSupply"]),
    ...mapGetters("contractdata", ["maxTotalSupply"]),
    ...mapGetters("contractdata", ["tokenSold"]),
    ...mapGetters(["userBlance"]),
  },
  mounted() {
    this.checkWalletIsConnected();
    this.getContractData();
    this.getProfits();
  },
  methods: {
    ...mapActions(["checkWalletIsConnected"]),
    ...mapActions(["connectMetamask"]),
    ...mapActions("contractdata", ["getContractData"]),
    ...mapActions("contractdata", ["getProfits"]),
    ...mapMutations(["setUserBlance"]),

    async handelFile(file) {
      const added = await client.add(file);
      this.ipfsHash = added[0].hash;
    },
    async BuyTokens() {
      try {
        if (!this.CurrentAccount) {
          window.alert("pleas connect your wallet");
        } else if (this.CurrentAccount && this.ChainId !== 97) {
          window.alert("pleas change network");
        } else if (
          this.CurrentAccount &&
          this.ChainId == 97 &&
          this.amountTokens
        ) {
          await plugins
            .buyTokens(this.CurrentAccount, this.amountTokens)
            .then(async () => {
              this.amountTokens = "";

              const blunce = await plugins.getUserBalance(this.CurrentAccount);
              this.setUserBlance(blunce);
              await this.getContractData();
            });
        }
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>
<style scoped>
.notice-bg {
  background: rgb(130, 240, 255);
  color: #1930ff;
  border-radius: 10px;
}
.notice-bg span {
  font-weight: bold;
}
.notice-bg span::before {
  content: "i";
  background: #20d3f3;
  color: #03a5c2;
  margin-right: 5px;
  width: 17px;
  height: 17px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
}
input {
  border: none;
  outline: none;
  background: #c6f2f8;
}
.sold-box{
  position: relative;
}
.sold{
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: #12bfc5;
  z-index: -1;
}
</style>
