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
    document.getElementById("loginButton").style.display = "none";
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

  // Add test button listener
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
    free
