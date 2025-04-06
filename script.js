console.log("script.js loaded");

const secretKey = "mySuperSecretKey123"; // TODO: Replace with a secure, user-specific key later
let lastEncryptedMessage = "";
const appId = "67f14bb216cc6685cf32451d"; // Your HandCash appId
let authToken = null;
let freeMessagesLeft = 5;

// Handle authToken from URL redirect
const urlParams = new URLSearchParams(window.location.search);
authToken = urlParams.get("authToken");
if (authToken) {
  localStorage.setItem("authToken", authToken); // Store persistently
  document.getElementById("loginButton").style.display = "none";
  document.getElementById("paymentStatus").innerText = "Payment Status: Logged in";
  window.history.replaceState({}, document.title, "/"); // Clean URL
}

// Login with HandCash
document.getElementById("loginButton").addEventListener("click", async () => {
  try {
    const response = await fetch("/api/pay", { method: "GET" });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.redirectUrl) {
      console.log("Redirecting to:", data.redirectUrl);
      window.location.href = data.redirectUrl; // Redirect to HandCash
    } else {
      throw new Error("No redirect URL received");
    }
  } catch (error) {
    console.error("Login error:", error.message);
    document.getElementById("status").innerText = "Status: Login failed. Check console for details.";
  }
});

// Send encrypted message
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
  } else if (!authToken && !localStorage.getItem("authToken")) {
    document.getElementById("status").innerText = "Status: Login with HandCash to send more!";
  } else {
    try {
      const storedAuthToken = localStorage.getItem("authToken") || authToken;
      const response = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authToken: storedAuthToken })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      document.getElementById("status").innerText = `Status: Encrypted: ${encrypted} (Payment ID: ${data.transactionId})`;
      document.getElementById("paymentStatus").innerText = "Payment Status: Paid 100 Satoshis";
      document.getElementById("message").value = "";
    } catch (error) {
      console.error("Payment error:", error.message);
      document.getElementById("status").innerText = `Status: Payment failed: ${error.message}`;
    }
  }
}

// Decrypt last message
function decryptMessage() {
  if (lastEncryptedMessage === "") {
    document.getElementById("status").innerText = "Status: No message to decrypt yet!";
    return;
  }
  const decrypted = CryptoJS.AES.decrypt(lastEncryptedMessage, secretKey).toString(CryptoJS.enc.Utf8);
  document.getElementById("status").innerText = `Status: Decrypted: ${decrypted}`;
}
