const DappToken = artifacts.require("./DappToken.sol");

contract("DappToken", (accounts) => {
  let tokenInstance;
  before(async () => {
    await DappToken.deployed().then(async (instance) => {
      tokenInstance = instance;
    });
  });

  it("deploys successfully", async () => {
    const address = await tokenInstance.address;
    assert.notEqual(address, 0x0);
    assert.notEqual(address, "");
    assert.notEqual(address, null);
    assert.notEqual(address, undefined);
  });

  it("initializes the contract with the correct values", async () => {
    const name = await tokenInstance.name();
    const symbol = await tokenInstance.symbol();
    const standard = await tokenInstance.standard();
    assert.equal(name, "DApp Token", "has the correct name");
    assert.equal(symbol, "BDAPP", "has the correct symbol");
    assert.equal(standard, "DApp Token v1.0", "has the correct standard");
  });

  it("allocates the initial supply upon deployment", async () => {
    const totalSupply = await tokenInstance.totalSupply();
    const adminBalance = await tokenInstance.balanceOf(accounts[0]);
    assert.equal(
      totalSupply.toNumber(),
      1000000,
      "sets the total supply to 1,000,000"
    );
    assert.equal(
      adminBalance.toNumber(),
      1000000,
      "it allocates the initial supply to the admin account"
    );
  });

  it("transfers token ownership", async () => {
    // Test `require` statement first by transferring something larger than the sender's balance
    await tokenInstance
      .transfer(accounts[0], "99999999999999999999999", {
        from: accounts[1],
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "error message must contain revert"
        );
      });
    await tokenInstance
      .transfer(accounts[1], 250000, {
        from: accounts[0],
      })
      .then(function (receipt) {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
          receipt.logs[0].event,
          "Transfer",
          'should be the "Transfer" event'
        );
        assert.equal(
          receipt.logs[0].args._from,
          accounts[0],
          "logs the account the tokens are transferred from"
        );
        assert.equal(
          receipt.logs[0].args._to,
          accounts[1],
          "logs the account the tokens are transferred to"
        );
        assert.equal(
          receipt.logs[0].args._value,
          250000,
          "logs the transfer amount"
        );
      });

    const BalanceAcount1 = await tokenInstance.balanceOf(accounts[0]);
    const BalanceAcount2 = await tokenInstance.balanceOf(accounts[1]);

    assert.equal(
      BalanceAcount1.toNumber(),
      750000,
      "deducts the amount from the sending account"
    );
    assert.equal(
      BalanceAcount2.toNumber(),
      250000,
      "adds the amount to the receiving account"
    );
  });

  it("approves tokens for delegated transfer", async () => {
    await tokenInstance.approve.call(accounts[1], 100).then(function (success) {
      assert.equal(success, true, "it returns true");
    });
    await tokenInstance
      .approve(accounts[1], 100, { from: accounts[0] })
      .then(function (receipt) {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
          receipt.logs[0].event,
          "Approval",
          'should be the "Approval" event'
        );
        assert.equal(
          receipt.logs[0].args._owner,
          accounts[0],
          "logs the account the tokens are authorized by"
        );
        assert.equal(
          receipt.logs[0].args._spender,
          accounts[1],
          "logs the account the tokens are authorized to"
        );
        assert.equal(
          receipt.logs[0].args._value,
          100,
          "logs the transfer amount"
        );
      });
    await tokenInstance
      .allowance(accounts[0], accounts[1])
      .then(function (allowance) {
        assert.equal(
          allowance.toNumber(),
          100,
          "stores the allowance for delegated trasnfer"
        );
      });
  });

  it("handles delegated token transfers", async () => {
    const fromAccount = accounts[2];
    const toAccount = accounts[3];
    const spendingAccount = accounts[4];
    // Transfer some tokens to fromAccount
    await tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
    // Approve spendingAccount to spend 10 tokens form fromAccount
    await tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
    // Try transferring something larger than the sender's balance
    await tokenInstance
      .transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "cannot transfer value larger than balance"
        );
      });
    // Try transferring something larger than the approved amount
    await tokenInstance
      .transferFrom(fromAccount, toAccount, 20, { from: spendingAccount })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "cannot transfer value larger than approved amount"
        );
      });
    await tokenInstance.transferFrom
      .call(fromAccount, toAccount, 10, { from: spendingAccount })
      .then(function (success) {
        assert.equal(success, true);
      });
     await tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount })
    .then(function(receipt) {
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
        assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
        assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
        assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
      })
      const balanceOfFromAcount = await tokenInstance.balanceOf(fromAccount);
      const balanceOfToAccount = await tokenInstance.balanceOf(toAccount);

        assert.equal(balanceOfFromAcount.toNumber(), 90, 'deducts the amount from the sending account');
         assert.equal(balanceOfToAccount.toNumber(), 10, 'adds the amount from the receiving account');

   await tokenInstance.allowance(fromAccount, spendingAccount)
   .then(function(allowance) {
        assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance');
      });
  });
});
