(() => {
  let existingSidebar = document.getElementById("smart-sidebar");

  if (existingSidebar) {
    existingSidebar.remove();
  } else {
    const sidebar = document.createElement("iframe");
    sidebar.src = chrome.runtime.getURL("index.html");
    sidebar.id = "smart-sidebar";
    sidebar.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 430px;
      height: 100vh;
      border: none;
      z-index: 100000;
      box-shadow: -2px 0 5px rgba(0,0,0,0.2);
      background: white;
      transition: transform 0.3s ease-in-out;
      transform: translateX(100%);
    `;

    document.body.appendChild(sidebar);

    // Animate Sidebar Opening
    setTimeout(() => {
      sidebar.style.transform = "translateX(0)";
    }, 10);
  }
})();
