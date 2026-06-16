let deferredPrompt;
let currentChatId = null;
let selectedChatId = null;
let pressTimer = null;

/* STORAGE */
function getChats() {
  return JSON.parse(localStorage.getItem("chats") || "[]");
}

function saveChats(chats) {
  localStorage.setItem("chats", JSON.stringify(chats));
}

/* CREATE CHAT */
window.newChat = function () {
  const chats = getChats();

  const id = Date.now();

  chats.push({
    id,
    title: "New Chat",
    messages: []
  });

  saveChats(chats);

  currentChatId = id;

  renderChats();
  renderMessages();

  closeSidebar();
  updatePlaceholder();
}

/* RENDER CHATS */
function renderChats() {
  const list = document.getElementById("chatList");
  const chats = getChats();

  list.innerHTML = "";

  chats.forEach(c => {
    const div = document.createElement("div");
    div.className = "chat-item";
    div.innerText = c.title;

    /* CLICK */
div.onclick = () => {
  currentChatId = c.id;
  localStorage.setItem("lastChatId", c.id);
  renderMessages();
  updatePlaceholder();
  closeSidebar();
};

    /* LONG PRESS */
    div.onmousedown = (e) => startPress(e, c.id);
    div.onmouseup = stopPress;
    div.onmouseleave = stopPress;

    div.ontouchstart = (e) => startPress(e, c.id);
    div.ontouchend = stopPress;

    list.appendChild(div);
  });
}

/* LONG PRESS FIX */
function startPress(e, id) {
  selectedChatId = id;

  const target = e.target.closest(".chat-item");
  if (!target) return;

  pressTimer = setTimeout(() => {
    showMenu(target);
  }, 600);
}

function stopPress() {
  clearTimeout(pressTimer);
}

/* MENU */
function showMenu(target) {
  const menu = document.getElementById("menu");
  const rect = target.getBoundingClientRect();

  menu.style.display = "flex";
  menu.style.visibility = "visible";
  menu.style.opacity = "1";
  menu.style.pointerEvents = "auto";

  const menuWidth = 140;
  const menuHeight = 120;

  let left = rect.left;
  let top = rect.bottom;

  // prevent overflow right
  if (left + menuWidth > window.innerWidth) {
    left = window.innerWidth - menuWidth - 10;
  }

  // prevent overflow bottom
  if (top + menuHeight > window.innerHeight) {
    top = rect.top - menuHeight;
  }

  menu.style.left = left + "px";
  menu.style.top = top + "px";
}

function hideMenu() {
  const menu = document.getElementById("menu");
  if (!menu) return;

  menu.style.display = "none";
  menu.style.visibility = "hidden";
  menu.style.opacity = "0";
  menu.style.left = "0px";
  menu.style.top = "0px";
  menu.style.pointerEvents = "none";
}

/* CHAT ACTIONS */
window.openChat = function (e) {
  if (e) e.stopPropagation();

  currentChatId = selectedChatId;
  renderMessages();
  hideMenu();
}

window.renameChat = function (e) {
  if (e) e.stopPropagation();

  const chats = getChats();
  const chat = chats.find(c => c.id === selectedChatId);

  const name = prompt("Rename chat:", chat.title);
  if (name) {
    chat.title = name;
    saveChats(chats);
    renderChats();
  }

  hideMenu();
}

window.deleteChat = function (e) {
  if (e) e.stopPropagation();

  let chats = getChats();
  chats = chats.filter(c => c.id !== selectedChatId);

  saveChats(chats);

  if (currentChatId === selectedChatId) {
    currentChatId = null;
    document.getElementById("chat").innerHTML = "";
  }

  renderChats();
  hideMenu();
}

/* CLOSE MENU OUTSIDE */
document.addEventListener("click", (e) => {
  const menu = document.getElementById("menu");

  if (!menu.contains(e.target) && !e.target.closest(".chat-item")) {
    hideMenu();
  }
});


function updatePlaceholder() {
  const input = document.getElementById("msg");

  const chats = getChats();
  const chat = chats.find(c => c.id === currentChatId);

  if (!chat || chat.messages.length === 0) {
    input.placeholder = "Ask MentorIQ AI...";
  } else {
    input.placeholder = "Reply to MentorIQ AI...";
  }
}


function formatText(text) {
  marked.setOptions({
    breaks: true
  });

  return marked.parse(text);
}

/* MESSAGES */
function renderMessages() {
  const chats = getChats();
  const chat = chats.find(c => c.id === currentChatId);

  const box = document.getElementById("chat");
  box.innerHTML = "";

  if (!chat) {
    updatePlaceholder();
    return;
  }

  chat.messages.forEach(m => {
    const isUser = m.role === "user";

    box.innerHTML += `
      <div class="msg ${isUser ? "user-msg" : "ai-msg"}">
        <div class="bubble">
          ${formatText(m.text)}
        </div>
      </div>
    `;
  });

  box.scrollTop = box.scrollHeight;

  // ✅ update placeholder depending on chat state
  updatePlaceholder();
}



  /* SEND */
window.send = async function () {
  const input = document.getElementById("msg");
  const text = input.value.trim();
  if (!text) return;

  if (!currentChatId) newChat();

  const chats = getChats();
  const chat = chats.find(c => c.id === currentChatId);

  /* =========================
     STEP 4 - AI IMAGE ENGINE DETECTOR
  ========================= */

  const lowerText = text.toLowerCase();

  window.aiMode = {
    generateImage:
      lowerText.includes("generate image") ||
      lowerText.includes("create image") ||
      lowerText.includes("draw") ||
      lowerText.includes("image of"),

    editImage:
      lowerText.includes("edit image") ||
      lowerText.includes("modify") ||
      lowerText.includes("enhance") ||
      lowerText.includes("change background"),

    signature: true
  };

  /* =========================
     STEP 3 - AI UPLOAD ENGINE HOOK
  ========================= */

  let uploadPayload = null;

  if (window.pendingUpload) {
    const upload = window.pendingUpload;

    let uploadNote = "";

    if (upload.type === "image") {
      uploadNote = "[User uploaded an image for AI analysis]";
    } 
    else if (upload.type === "video") {
      uploadNote = "[User uploaded a video for AI processing]";
    } 
    else {
      uploadNote = "[User uploaded a file/document]";
    }

    // Inject system context once
    chat.messages.push({
      role: "system",
      text: uploadNote
    });

    uploadPayload = upload;

    window.lastUpload = upload;
    window.pendingUpload = null;
  }

  /* USER MESSAGE */
  chat.messages.push({ role: "user", text });

  /* CHAT TITLE */
  if (chat.title === "New Chat") {
    chat.title = text.slice(0, 25);
  }

  saveChats(chats);
  renderChats();
  renderMessages();

  input.value = "";

  const msg = document.getElementById("msg");

  msg.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 160) + "px";
  });

  /* =========================
     FINAL UPLOAD SNAPSHOT
  ========================= */

  window.lastUpload = uploadPayload;

  /* =========================
     API REQUEST (STEP 4 ENHANCED)
  ========================= */

  const res = await fetch("https://mentoriq-ai.onrender.com/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: text,
      upload: uploadPayload,
      aiMode: window.aiMode,
      system: {
        brand: "Zed MentorIQ AI",
        signature: "Zed-AI-Render",
        style: "educational-clean-modern"
      }
    })
  });

  const data = await res.json();

  /* =========================
     RESPONSE HANDLER (TEXT + IMAGE READY)
  ========================= */

  if (data.imageUrl) {
    chat.messages.push({
      role: "ai",
      text: data.reply || "Generated Image:"
    });

    chat.messages.push({
      role: "ai",
      text: `![Generated Image](${data.imageUrl})`
    });
  } 
  else {
    chat.messages.push({
      role: "ai",
      text: data.reply
    });
  }

  saveChats(chats);
  renderMessages();
  updatePlaceholder();
};
   

/* SIDEBAR CONTROL (FIXED) */
window.toggleSidebar = function () {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("overlay").classList.toggle("show");
}

window.closeSidebar = function () {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}

  /* =========================
   UPLOAD BUTTON TRIGGER (FIXED + SAFE)
========================= */

window.openUpload = function () {
  const input = document.getElementById("fileInput");

  if (!input) {
    console.error("❌ fileInput not found");
    return;
  }

  input.value = ""; // allow same file reselect
  input.click();
};


/* =========================
   FORCE UI RESET SAFELY
========================= */

function forceResetUI() {
  const menu = document.getElementById("menu");

  if (menu) {
    menu.style.display = "none";
    menu.style.visibility = "hidden";
    menu.style.opacity = "0";
    menu.style.left = "0px";
    menu.style.top = "0px";
  }
}

/* safe DOM boot */
document.addEventListener("DOMContentLoaded", () => {
  forceResetUI();
  hideMenu();
});


/* =========================
   MENU SAFETY FIX (GLOBAL GUARANTEE)
========================= */

function hideMenu() {
  const menu = document.getElementById("menu");
  if (!menu) return;

  menu.style.display = "none";
  menu.style.visibility = "hidden";
  menu.style.opacity = "0";
  menu.style.pointerEvents = "none";
  menu.style.left = "0px";
  menu.style.top = "0px";
}


/* =========================
   INIT (UNCHANGED BUT SAFE)
========================= */

function init() {
  const chats = getChats();
  const isFirstLoad = !sessionStorage.getItem("appSessionStarted");

  if (isFirstLoad) {
    sessionStorage.setItem("appSessionStarted", "true");

    currentChatId = null;
    localStorage.removeItem("lastChatId");
  } else {
    if (chats.length > 0) {
      const lastChatId = localStorage.getItem("lastChatId");
      const exists = chats.find(c => c.id == lastChatId);

      currentChatId = exists
        ? exists.id
        : chats[chats.length - 1].id;
    } else {
      const id = Date.now();

      chats.push({
        id,
        title: "New Chat",
        messages: []
      });

      saveChats(chats);
      currentChatId = id;
    }
  }

  renderChats();
  renderMessages();
}

init();


/* =========================
   INSTALL BUTTON (CLEANED)
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const installBtn = document.getElementById("installBtn");

  if (!installBtn) return;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = "block";
  });

  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) {
      showGuide();
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  });

  setTimeout(() => {
    installBtn.style.display = "block";
  }, 2000);
});


/* =========================
   INSTALL GUIDE FIX
========================= */

window.showGuide = function () {
  const guide = document.getElementById("installGuide");
  if (guide) guide.style.display = "block";
};

window.closeGuide = function () {
  const guide = document.getElementById("installGuide");
  if (guide) guide.style.display = "none";
};


/* =========================
   SERVICE WORKER (SAFE)
========================= */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("✔ SW registered"))
      .catch(err => console.error("SW error:", err));
  });
}


/* =========================
   FILE UPLOAD HANDLER (FIXED CORE ISSUE)
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("fileInput");

  if (!input) {
    console.error("❌ fileInput missing in HTML");
    return;
  }

  input.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    console.log("📁 FILE SELECTED:", file.name);

    /* =========================
       🔥 FIX: SHOW VISUAL FEEDBACK (YOU LOST THIS EARLIER)
    ========================= */

    const chatBox = document.getElementById("chat");

const msg = {
  role: "user",
  text: `📎 Uploaded: ${file.name}`
};

chat.messages.push(msg);
saveChats(chats);
renderMessages();

      chatBox.appendChild(msg);
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    /* =========================
       FILE READ
    ========================= */

    const reader = new FileReader();

    reader.onload = function (event) {
      const fileData = event.target.result;

      let fileType = "file";

      if (file.type.startsWith("image/")) {
        fileType = "image";
      } else if (file.type.startsWith("video/")) {
        fileType = "video";
      } else if (
        file.type.includes("pdf") ||
        file.type.includes("word") ||
        file.type.includes("text")
      ) {
        fileType = "document";
      }

      window.pendingUpload = {
        name: file.name,
        mimeType: file.type,
        size: file.size,
        type: fileType,
        data: fileData
      };

      console.log("✅ Upload ready for AI:", window.pendingUpload);
    };

    /* =========================
       READ FILE SAFELY
    ========================= */

    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  });
});



