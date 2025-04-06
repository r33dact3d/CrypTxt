console.log("script.js loaded");

const secretKey = "mySuperSecretKey123";
let lastEncryptedMessage = "";
const appId = "67f14bb216cc6685cf32451d";
let authToken = null;
let freeMessagesLeft = 5;

const urlParams = new URLSearchParams(window.location.search);
authToken = urlParams.get("authToken");
if (authToken) {
  document.getElementById("loginButton").style.display = "none";
  document.getElementById("paymentStatus").innerText = "Payment Status: Logged in";
}

async function login() {
  try {
    const response = await fetch('/api/pay', { method: 'GET' });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { connectUrl } = await response.json();
    console.log("Connect URL:", connectUrl);
    window.location.href = connectUrl;
  } catch (error) {
    console.error("Login error:", error);
    document.getElementById("status").innerText = "Status: Login failed. Check console for details.";
  }
}

async function sendMessage() {
  const message = document.getElementById("message").value;
  if (message === "") {
    alert("Please type a message first!");
    return;
  }

  const encrypted = CryptoJS.AES.encrypt(message, secretKey).toString();
  lastEncryptedMessage = encrypted;

  if (freeMessagesLeft > 0) {
    freeMessagesLeft--;
    document.getElementById("status").innerText = `Status: Encrypted: ${encrypted} (Free left: ${freeMessagesLeft})`;
    document.getElementById("message").value = "";
  } else if (!authToken) {
    document.getElementById("status").innerText = "Status: Login with HandCash to send more!";
  } else {
    try {
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authToken })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      document.getElementById("status").innerText = `Status: Encrypted: ${encrypted} (Payment ID: ${data.transactionId})`;
      document.getElementById("paymentStatus").innerText = "Payment Status: Paid 100 Satoshis";
      document.getElementById("message").value = "";
    } catch (error) {
      document.getElementById("status").innerText = `Status: Payment failed: ${error.message}`;
    }
  }
}

function decryptMessage() {
  if (lastEncryptedMessage === "") {
    document.getElementById("status").innerText = "Status: No message to decrypt yet!";
    return;
  }
  const decrypted = CryptoJS.AES.decrypt(lastEncryptedMessage, secretKey).toString(CryptoJS.enc.Utf8);
  document.getElementById("status").innerText = `Status: Decrypted: ${decrypted}`;
}
