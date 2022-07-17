const DappToken = artifacts.require("./DappToken.sol");
const DappTokenSale = artifacts.require("./DappTokenSale.sol");

contract("DappTokenSale", (accounts) => {
  var tokenSaleInstance;
  var admin = accounts[0];
  var buyer = accounts[1];
  var tokenPrice = 1000000000000000; // in wei
  var tokensAvailable = 750000;
  var numberOfTokens;
  before(async () => {
    await DappToken.deployed().then(async (instance) => {
      await DappTokenSale.deployed().then((instance) => {
        tokenSaleInstance = instance;
      });
    });
  });
  it("deploys successfully", async () => {
    const address = await tokenSaleInstance.address;
    assert.notEqual(address, 0x0);
    assert.notEqual(address, "");
    assert.notEqual(address, null);
    assert.notEqual(address, undefined);
  });
  it("initializes the contract with the correct values", async () => {
    await tokenSaleInstance.tokenPrice().then((price) => {
      assert.equal(price, tokenPrice, "token price is correct");
    });
  });

  it("facilitates token buying", async () => {
    const tokenSaleInstanceAddres = await tokenSaleInstance.address;

    await tokenSaleInstance
      .transfer(tokenSaleInstanceAddres, tokensAvailable, { from: admin })
      .then(async (receipt) => {
        const balanceOfAdmin = await tokenSaleInstance.balanceOf(admin);
        const balanceOfContract = await tokenSaleInstance.balanceOf(
          tokenSaleInstanceAddres
        );
        assert.equal(balanceOfAdmin.toNumber(), 250000);
        assert.equal(balanceOfContract.toNumber(), 750000);
      });
    numberOfTokens = 10;
    await tokenSaleInstance
      .buyTokens(numberOfTokens, {
        from: buyer,
        value: numberOfTokens * tokenPrice,
      })
      .then((receipt) => {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
          receipt.logs[0].event,
          "Sell",
          'should be the "Sell" event'
        );
        assert.equal(
          receipt.logs[0].args.buyer,
          buyer,
          "logs the account that purchased the tokens"
        );
        assert.equal(
          receipt.logs[0].args.amount,
          numberOfTokens,
          "logs the number of tokens purchased"
        );
      });
    await tokenSaleInstance.tokensSold().then((amount) => {
      assert.equal(
        amount.toNumber(),
        numberOfTokens,
        "increments the number of tokens sold"
      );
    });
    await tokenSaleInstance.balanceOf(buyer).then((balance) => {
      assert.equal(balance.toNumber(), numberOfTokens);
    });
    await tokenSaleInstance
      .balanceOf(tokenSaleInstanceAddres)
      .then(function (balance) {
        assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
      });
    // Try to buy tokens different from the ether value
    await tokenSaleInstance
      .buyTokens(numberOfTokens, {
        from: buyer,
        value: 1,
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "msg.value must equal number of tokens in wei"
        );
      });
    await tokenSaleInstance
      .buyTokens(800000, {
        from: buyer,
        value: numberOfTokens * tokenPrice,
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "cannot purchase more tokens than available"
        );
      });
  });

  it("get all Profits", async () => {
    // Try to get Profits from account other than the admin
    await tokenSaleInstance
      .getProfits({ from: buyer })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf(
            "revert" >= 0,
            "must be admin to end get Profits"
          )
        );
      });
    const old_Admin_balance = await web3.eth.getBalance(admin);
    const old_Contract_balance = await web3.eth.getBalance(
      tokenSaleInstance.address
    );
    // Check that the contract has balance
    assert.equal(
      old_Contract_balance,
      tokenPrice * numberOfTokens,
      "contract must has balance"
    );
    // get Profits as admin
    await tokenSaleInstance.getProfits({ from: admin });
    const new_Admin_balance = await web3.eth.getBalance(admin);
    const new_Contract_balance = await web3.eth.getBalance(
      tokenSaleInstance.address
    );
    assert.equal(new_Contract_balance, 0, "contract balance must be 0");

    assert(
      Number(new_Admin_balance) > Number(old_Admin_balance),
      "new_Admin_balance must be > old_Admin_balance "
    );
  });

  it("ends token sale", async () => {
    // Try to end sale from account other than the admin
    await tokenSaleInstance
      .endSale({ from: buyer })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert" >= 0, "must be admin to end sale")
        );
      });
    // End sale as admin
    await tokenSaleInstance.endSale({ from: admin });
    const contractBalance = await tokenSaleInstance.balanceOf(
      tokenSaleInstance.address
    );

    const adminBalance = await tokenSaleInstance.balanceOf(admin);
    const totalSupply = await tokenSaleInstance.totalSupply();
    const tokensSold = await tokenSaleInstance.tokensSold();
    const LastBalansOfAdmin = totalSupply.toNumber() - tokensSold.toNumber();
    assert.equal(
      contractBalance.toNumber(),
      0,
      "balance Of tokenSaleInstance must be 0"
    );

    assert.equal(
      adminBalance.toNumber(),
      LastBalansOfAdmin,
      "balance Of admin must be 999990"
    );
  });
});
