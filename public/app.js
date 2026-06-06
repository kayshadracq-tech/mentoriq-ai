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
function newChat() {
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
      renderMessages();
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

  if (!e.currentTarget) return;

  const target = e.currentTarget;

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
  menu.style.display = "none";
}

/* CHAT ACTIONS */
function openChat(e) {
  e.stopPropagation();

  currentChatId = selectedChatId;
  renderMessages();
  hideMenu();
}

function renameChat(e) {
  e.stopPropagation();

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

function deleteChat(e) {
  e.stopPropagation();

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

/* MESSAGES */
function renderMessages() {
  const chats = getChats();
  const chat = chats.find(c => c.id === currentChatId);

  const box = document.getElementById("chat");
  box.innerHTML = "";

  if (!chat) return;

  chat.messages.forEach(m => {
    const isUser = m.role === "user";

    box.innerHTML += `
      <div class="msg ${isUser ? "user-msg" : "ai-msg"}">
        <div class="bubble">
          ${m.text}
        </div>
      </div>
    `;
  });

  box.scrollTop = box.scrollHeight;
}

/* SEND */
async function send() {
  const input = document.getElementById("msg");
  const text = input.value.trim();
  if (!text) return;

  if (!currentChatId) newChat();

  const chats = getChats();
  const chat = chats.find(c => c.id === currentChatId);

  chat.messages.push({ role: "user", text });

  if (chat.title === "New Chat") {
    chat.title = text.slice(0, 25);
  }

  saveChats(chats);
  renderChats();
  renderMessages();

  input.value = "";

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  });

  const data = await res.json();

  chat.messages.push({ role: "ai", text: data.reply });

  saveChats(chats);
  renderMessages();
}

/* SIDEBAR CONTROL (FIXED) */
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("overlay").classList.toggle("show");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}


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

document.addEventListener("DOMContentLoaded", () => {
  forceResetUI();
  hideMenu();
});

/* INIT */
function init() {
  const chats = getChats();

  if (chats.length > 0) {
    currentChatId = chats[chats.length - 1].id;
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

  renderChats();
  renderMessages();
}

init();

document.addEventListener("DOMContentLoaded", () => {
  hideMenu();
});

