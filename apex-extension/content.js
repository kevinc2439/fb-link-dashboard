// This is a simplified logic to watch for balance changes
let lastBalance = 0;

const observer = new MutationObserver(() => {
  // Targeting the SC balance element (Selectors vary by site)
  const balanceElem = document.querySelector('.sc-balance-value'); 
  if (balanceElem) {
    const currentBalance = parseFloat(balanceElem.innerText.replace(/[^0-9.]/g, ''));
    
    if (currentBalance !== lastBalance) {
      console.log("Telemetry Update:", currentBalance);
      // Send data to your Apex Dashboard
      chrome.runtime.sendMessage({
        type: "TELEMETRY_UPDATE",
        balance: currentBalance,
        timestamp: new Date().toISOString()
      });
      lastBalance = currentBalance;
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });