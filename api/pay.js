const { HandCashConnect } = require('@handcash/handcash-connect');
const handCashConnect = new HandCashConnect({
  appId: process.env.HANDCASH_APP_ID,
  appSecret: process.env.HANDCASH_APP_SECRET,
});

module.exports = async (req, res) => {
  const { authToken, message } = req.body;
  const account = handCashConnect.getAccountFromAuthToken(authToken);

  // Test payment
  const paymentParameters = {
    destination: 'yourhandle$handcash.io', // Your HandCash handle
    currencyCode: 'BSV',
    sendAmount: 0.0001, // 100 Satoshis
  };
  const paymentResult = await account.wallet.pay(paymentParameters);

  // Test data write
  const dataParameters = {
    format: 'utf8',
    content: message, // Encrypted message from client
  };
  const dataResult = await account.data.write(dataParameters);

  res.json({
    txId: paymentResult.transactionId,
    dataId: dataResult.id,
  });
};
