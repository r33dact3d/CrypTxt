console.log("script.js loaded");
const secretKey = "mySuperSecretKey123"; // Replace with a secure key later
let lastEncryptedMessage = "";
const appId = "67f305d2c11903f64acea4f6";
let authToken = null;
let freeMessagesLeft = 5;

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  authToken = urlParams.get("authToken");
  if (authToken) {
    localStorage.setItem("authToken", authToken);
    document.getElementById("loginButton").classList.add("hidden");
    document.getElementById("paymentStatus").innerText = "Payment Status: Logged in";
    window.history.replaceState({}, document.title, "/");
    fetchUserProfile(authToken);
  }

  const loginButton = document.getElementById("loginButton");
  if (loginButton) {
    loginButton.addEventListener("click", async () => {
      console.log("Login button clicked");
      try {
        const response = await fetch("/api/pay", { method: "GET" });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          throw new Error("No redirect URL received");
        }
      } catch (error) {
        console.error("Login error:", error.message);
        document.getElementById("status").innerText = "Status: Login failed. Check console.";
      }
    });
  } else {
    console.error("Login button not found in DOM");
  }

  const testButton = document.getElementById("testButton");
  if (testButton) {
    testButton.addEventListener("click", sendTestMessage);
  }
});

async function fetchUserProfile(authToken) {
  try {
    const response = await fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authToken, action: "getProfile" }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    const handle = data.handle;
    document.getElementById("loginStatus").innerText = `Logged in as ${handle}`;
  } catch (error) {
    console.error("Profile fetch error:", error.message);
    document.getElementById("loginStatus").innerText = "Logged in as [Unknown]";
  }
}

async function sendMessage() {
  const message = document.getElementById("message").value;
  if (!message) {
    alert("Please type a message first!");
    return;
  }
  const encrypted = CryptoJS.AES.encrypt(message, secretKey).toString();
  lastEncryptedMessage = encrypted;
  if (freeMessagesLeft > 0) {
    freeMessagesLeft--;
    document.getElementById("status").innerText = `Status: Encrypted: ${encrypted} (Free left: ${freeMessagesLeft})`;
    document.getElementById("message").value = "";
  } else if (!authToken && !localStorage.getItem("authToken")) {
    document.getElementById("status").innerText = "Status: Login with HandCash to send more!";
  } else {
    try {
      const storedAuthToken = localStorage.getItem("authToken") || authToken;
      const response = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authToken: storedAuthToken,
          action: "sendMessage",
          encryptedMessage: encrypted,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      document.getElementById("status").innerText = `Status: Encrypted: ${encrypted} (TxID: ${data.transactionId}, DataID: ${data.dataId})`;
      document.getElementById("paymentStatus").innerText = "Payment Status: Paid 100 Satoshis";
      document.getElementById("message").value = "";
    } catch (error) {
      console.error("Payment error:", error.message);
      document.getElementById("status").innerText = `Status: Payment failed: ${error.message}`;
    }
  }
}

function decryptMessage() {
  if (!lastEncryptedMessage) {
    document.getElementById("status").innerText = "Status: No message to decrypt yet!";
    return;
  }
  const decrypted = CryptoJS.AES.decrypt(lastEncryptedMessage, secretKey).toString(CryptoJS.enc.Utf8);
  document.getElementById("status").innerText = `Status: Decrypted: ${decrypted}`;
}

async function sendTestMessage() {
  const plainMessage = "Hello, BSV! This is a test.";
  const encryptedMessage = CryptoJS.AES.encrypt(plainMessage, secretKey).toString();
  const storedAuthToken = localStorage.getItem("authToken") || authToken;

  if (!storedAuthToken) {
    document.getElementById("status").innerText = "Status: Please log in with HandCash first!";
    return;
  }

  try {
    const response = await fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authToken: storedAuthToken,
        action: "sendMessage",
        encryptedMessage: encryptedMessage,
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    console.log("Test Payment TxID:", data.transactionId);
    console.log("Test Data ID:", data.dataId);
    document.getElementById("status").innerText = `Status: Test
