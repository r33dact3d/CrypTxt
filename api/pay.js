const { HandCashConnect } = require('@handcash/handcash-connect');

const handCashConnect = new HandCashConnect({
  appId: process.env.HANDCASH_APP_ID,
  appSecret: process.env.HANDCASH_APP_SECRET,
});

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    // Handle login redirect
    const redirectUrl = handCashConnect.getRedirectionUrl();
    return res.status(200).json({ redirectUrl });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { authToken, action, encryptedMessage } = req.body;

  if (!authToken) {
    return res.status(401).json({ error: 'No auth token provided' });
  }

  const account = handCashConnect.getAccountFromAuthToken(authToken);

  try {
    if (action === 'getProfile') {
      const profile = await account.profile.getPublicProfile();
      return res.status(200).json({ handle: profile.publicInfo.handle });
    }

    if (action === 'sendMessage') {
      if (!encryptedMessage) {
        return res.status(400).json({ error: 'No encrypted message provided' });
      }

      // Payment
      const paymentParameters = {
        destination: 'Styraks@handcash.io', // Set to styraks as requested
        currencyCode: 'BSV',
        sendAmount: 0.0001, // 100 Satoshis
      };
      const paymentResult = await account.wallet.pay(paymentParameters);

      // Blockchain write
      const dataParameters = {
        format: 'utf8',
        content: encryptedMessage,
      };
      const dataResult = await account.data.write(dataParameters);

      return res.status(200).json({
        transactionId: paymentResult.transactionId,
        dataId: dataResult.id,
      });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('API error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
