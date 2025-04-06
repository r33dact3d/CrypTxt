console.log("script.js loaded");

const secretKey = "mySuperSecretKey123";
let lastEncryptedMessage = "";
const appId = "67f14bb216cc6685cf32451d"; // Your App ID—double-check it’s exact
let authToken = null;
let freeMessagesLeft = 5;

// Handle auth token from URL
const urlParams = new URLSearchParams(window.location.search);
authToken = urlParams.get("authToken");
if (authToken) {
  document.getElementById("loginButton").style.display = "none";
  document.getElementById("paymentStatus").innerText = "Payment Status: Logged in";
}

function login() {
  const redirectUrl = window.location.href; // Repl.it URL
  // Manual URL per HandCash docs: https://app.handcash.io/#/authorizeApp?appId=${appId}
  const connectUrl = `https://app.handcash.io/#/authorizeApp?appId=${appId}&redirectUrl=${encodeURIComponent(redirectUrl)}`;
  console.log("Open this in a new tab: " + connectUrl);
  document.getElementById("status").innerText = "Status: Check console for HandCash login URL, then paste authToken back here!";
  // window.location.href = connectUrl; // Disabled for Repl.it—uncomment later
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
    // Placeholder for payment logic (we’ll add tomorrow with Vercel)
    document.getElementById("status").innerText = `Status: Encrypted: ${encrypted} (Payment coming soon - authToken: ${authToken})`;
    document.getElementById("paymentStatus").innerText = "Payment Status: Logged in, payment TBD";
    document.getElementById("message").value = "";
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