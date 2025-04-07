const { HandCashConnect } = require('@handcash/handcash-connect');

const handCashConnect = new HandCashConnect({
  appId: process.env.HANDCASH_APP_ID,
  appSecret: process.env.HANDCASH_APP_SECRET
});

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const redirectUrl = handCashConnect.getRedirectionUrl();
      console.log('Redirect URL generated:', redirectUrl);
      res.status(200).json({ redirectUrl });
    } catch (error) {
      console.error('Error generating redirect URL:', error.message);
      res.status(500).json({ error: 'Failed to generate login URL' });
    }
  } else if (req.method === 'POST') {
    try {
      const { authToken } = req.body;
      if (!authToken) {
        return res.status(400).json({ error: 'authToken required' });
      }
      const account = handCashConnect.getAccountFromAuthToken(authToken);
      const paymentParameters = {
        payments: [{
          destination: 'app', // Pay to your app’s wallet
          currencyCode: 'SAT',
          sendAmount: 100
        }],
        description: 'CrypTxt Message'
      };
      const paymentResult = await account.wallet.pay(paymentParameters);
      console.log('Payment successful:', paymentResult);
      res.status(200).json({ transactionId: paymentResult.transactionId });
    } catch (error) {
      console.error('Payment error:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
  }
};
