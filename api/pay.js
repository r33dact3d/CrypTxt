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
      const { authToken, action, encryptedMessage } = req.body;
      if (!authToken) {
        return res.status(400).json({ error: 'authToken required' });
      }
      const account = handCashConnect.getAccountFromAuthToken(authToken);

      if (action === "getProfile") {
        const profile = await account.profile.getPublicProfile();
        console.log('Profile fetched:', profile);
        res.status(200).json({ handle: profile.publicInfo.handle });
      } else if (action === "sendMessage") {
        if (!encryptedMessage) {
          return res.status(400).json({ error: 'encryptedMessage required' });
        }
        // Pay 100 Satoshis to your HandCash handle
        const paymentParameters = {
          payments: [{
            destination: '$styraks', // Replace with your real HandCash handle (e.g., @crypTxtDev)
            currencyCode: 'SAT',
            sendAmount: 100
          }],
          description: 'CrypTxt Message'
        };
        const paymentResult = await account.wallet.pay(paymentParameters);
        console.log('Payment successful:', paymentResult);

        // Write encrypted message to BSV blockchain
        const dataResult = await account.data.write({
          appId: process.env.HANDCASH_APP_ID,
          data: encryptedMessage,
          format: 'text/plain'
        });
        console.log('Data written to blockchain:', dataResult);

        res.status(200).json({
          transactionId: paymentResult.transactionId,
          dataId: dataResult.id
        });
      } else {
        res.status(400).json({ error: 'Invalid action' });
      }
    } catch (error) {
      console.error('POST error:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
  }
};
