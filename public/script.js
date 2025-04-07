console.log("script.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const authToken = urlParams.get("authToken");
  if (authToken) {
    localStorage.setItem("authToken", authToken);
    document.getElementById("loginButton").classList.add("hidden");
    document.getElementById("paymentStatus").innerText = "Payment Status: Logged in";
    window.history.replaceState({}, document.title, "/");
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
});
