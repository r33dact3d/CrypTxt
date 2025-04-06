const HandcashConnect = require('@handcash/handcash-connect');

const handCashConnect = new HandcashConnect({
  appId: '67f14bb216cc6685cf32451d',
  appSecret: 'YOUR_APP_SECRET' // Replace this!
});

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const redirectUrl = `https://${req.headers.host}/`;
    const connectUrl = handCashConnect.getRedirectionUrl({ redirectUrl });
    res.status(200).json({ connectUrl });
  } else if (req.method === 'POST') {
    const { authToken } = req.body;
    const paymentParameters = {
      destination: "app:" + handCashConnect.appId,
      currencyCode: "BSV",
      amount: 0.000001,
      description: "CrypTxt Message"
    };
    try {
      const paymentResult = await handCashConnect.pay(authToken, paymentParameters);
      res.status(200).json({ transactionId: paymentResult.transactionId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
