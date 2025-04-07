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
      const { authToken, action } = req.body;
      if (!authToken) {
        return res.status(400).json({ error: 'authToken required' });
      }
      const account = handCashConnect.getAccountFromAuthToken(authToken);
      
      if (action === "getProfile") {
        const profile = await account.profile.getPublicProfile();
        console.log('Profile fetched:', profile);
        res.status(200).json({ handle: profile.publicInfo.handle });
      } else {
        // Placeholder for payment logic (to be expanded later)
        res.status(400).json({ error: 'Action not supported yet' });
      }
    } catch (error) {
      console.error('POST error:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
  }
};
