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
      console.error('Error generating redirect URL:', {
        message: error.message,
        stack: error.stack,
        appId: process.env.HANDCASH_APP_ID ? 'Set' : 'Missing',
        appSecret: process.env.HANDCASH_APP_SECRET ? 'Set' : 'Missing'
      });
      res.status(500).json({ error: 'Failed to generate login URL' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed. Use GET for login.' });
  }
};
