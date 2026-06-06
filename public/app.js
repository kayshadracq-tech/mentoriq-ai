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

  pressTimer = setTimeout(() => {
    showMenu(e);
  }, 600);
}

function stopPress() {
  clearTimeout(pressTimer);
}

/* MENU */
function showMenu(e) {
  const menu = document.getElementById("menu");

  menu.style.display = "flex";
  menu.style.top = e.pageY + "px";
  menu.style.left = e.pageX + "px";
}

function hideMenu() {
  document.getElementById("menu").style.display = "none";
}

/* CHAT ACTIONS */
function openChat() {
  currentChatId = selectedChatId;
  renderMessages();
  hideMenu();
}

function renameChat() {
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

function deleteChat() {
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
  if (!e.target.closest(".menu") && !e.target.closest(".chat-item")) {
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
    box.innerHTML += `
      <p class="${m.role}">
        <b>${m.role === "user" ? "You" : "MentorIQ"}:</b>
        ${m.text}
      </p>
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

/* INIT */
newChat();
renderChats();
