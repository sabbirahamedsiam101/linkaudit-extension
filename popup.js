document.getElementById('scanBtn').addEventListener('click', async () => {
    const loading = document.getElementById("loading");
    const results = document.getElementById("results");
    const brokenList = document.getElementById("brokenList");
    results.classList.add("hidden");
    brokenList.classList.add("hidden");
    loading.classList.remove("hidden");
  
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scanAndCheckLinks,
    }, (injectionResults) => {
      const result = injectionResults[0].result;
      loading.classList.add("hidden");
      results.classList.remove("hidden");
  
      document.getElementById("totalLinks").textContent = result.total;
      document.getElementById("dofollowCount").textContent = result.dofollow;
      document.getElementById("nofollowCount").textContent = result.nofollow;
      document.getElementById("internalCount").textContent = result.internal;
      document.getElementById("externalCount").textContent = result.external;
      document.getElementById("brokenCount").textContent = result.broken.length;
  
      if (result.broken.length > 0) {
        const list = document.getElementById("brokenLinks");
        list.innerHTML = "";
        result.broken.forEach(link => {
          const li = document.createElement("li");
          li.textContent = link;
          list.appendChild(li);
        });
        brokenList.classList.remove("hidden");
      }
    });
  });
  
  // this function runs inside the page context
  async function scanAndCheckLinks() {
    const links = document.querySelectorAll('a[href]');
    const currentDomain = location.hostname;
  
    let total = 0, dofollow = 0, nofollow = 0, internal = 0, external = 0;
    let broken = [];
  
    const checkLink = async (url) => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.status === 404;
      } catch {
        return true; // Consider broken if fetch fails
      }
    };
  
    for (let link of links) {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('javascript:') || href.startsWith('#')) continue;
  
      total++;
      const rel = link.getAttribute('rel');
      if (rel && rel.includes('nofollow')) {
        nofollow++;
      } else {
        dofollow++;
      }
  
      if (href.includes(currentDomain)) {
        internal++;
      } else {
        external++;
      }
  
      // broken checker
      const isBroken = await checkLink(href);
      if (isBroken) {
        broken.push(href);
        link.style.border = "2px dashed red";
      } else {
        link.style.border = "2px dashed green";
      }
    }
  
    return { total, dofollow, nofollow, internal, external, broken };
  }
  