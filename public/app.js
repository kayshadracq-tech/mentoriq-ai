let currentChatId = null;
let selectedChatId = null;
let longPressTimer = null;
let isLongPress = false;

/* STORAGE */
function getChats() {
  return JSON.parse(localStorage.getItem("chats") || "[]");
}

function saveChats(chats) {
  localStorage.setItem("chats", JSON.stringify(chats));
}

/* SIDEBAR */
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("overlay").classList.toggle("show");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}

/* NEW CHAT (FIXED: NO AUTO DUPLICATION) */
function newChat() {
  const chats = getChats();

  const id = Date.now();

  const chat = {
    id,
    title: "New Chat",
    messages: []
  };

  chats.unshift(chat);
  saveChats(chats);

  currentChatId = id;

  renderChats();
  renderMessages();

  closeSidebar();
  document.getElementById("msg").focus();
}

/* SELECT CHAT */
function selectChat(id) {
  currentChatId = id;
  renderChats();
  renderMessages();
  closeSidebar();
}

/* RENDER CHATS (FIXED LONG PRESS LOGIC) */
function renderChats() {
  const list = document.getElementById("chatList");
  const chats = getChats();

  list.innerHTML = "";

  chats.forEach(c => {
    const div = document.createElement("div");

    div.className = "chat-item" + (c.id === currentChatId ? " active" : "");
    div.innerText = c.title;

    /* CLICK (ONLY IF NOT LONG PRESS) */
    div.addEventListener("click", () => {
      if (isLongPress) {
        isLongPress = false;
        return;
      }
      selectChat(c.id);
    });

    /* LONG PRESS START */
    div.addEventListener("mousedown", () => {
      isLongPress = false;

      longPressTimer = setTimeout(() => {
        isLongPress = true;
        openMenu(c.id);
      }, 600);
    });

    div.addEventListener("mouseup", () => {
      clearTimeout(longPressTimer);
    });

    div.addEventListener("mouseleave", () => {
      clearTimeout(longPressTimer);
    });

    list.appendChild(div);
  });
}

/* MENU */
function openMenu(id) {
  selectedChatId = id;
  document.getElementById("menu").classList.remove("hidden");
}

function closeMenu() {
  document.getElementById("menu").classList.add("hidden");
}

/* DELETE */
function deleteChat() {
  let chats = getChats();

  chats = chats.filter(c => c.id !== selectedChatId);

  saveChats(chats);

  if (currentChatId === selectedChatId) {
    currentChatId = null;
    document.getElementById("chat").innerHTML = "";
  }

  closeMenu();
  renderChats();
}

/* RENDER MESSAGES */
function renderMessages() {
  const chats = getChats();
  const chat = chats.find(c => c.id === currentChatId);

  const box = document.getElementById("chat");
  box.innerHTML = "";

  if (!chat) return;

  chat.messages.forEach(m => {
    box.innerHTML += `
      <div class="${m.role}">
        <b>${m.role === "user" ? "You" : "MentorIQ"}:</b>
        ${m.text}
      </div>
    `;
  });

  box.scrollTop = box.scrollHeight;
}

/* SEND */
async function send() {
  const input = document.getElementById("msg");
  const message = input.value.trim();
  if (!message) return;

  if (!currentChatId) {
    newChat();
  }

  const chats = getChats();
  const chat = chats.find(c => c.id === currentChatId);

  chat.messages.push({ role: "user", text: message });

  if (chat.title === "New Chat") {
    chat.title = message.slice(0, 25);
  }

  saveChats(chats);

  renderChats();
  renderMessages();

  input.value = "";

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  const data = await res.json();

  chat.messages.push({ role: "ai", text: data.reply });

  saveChats(chats);
  renderMessages();
}

/* INIT (IMPORTANT FIX: NO REPEAT CHAT CREATION BUG) */
const existingChats = getChats();

if (existingChats.length === 0) {
  newChat();
} else {
  currentChatId = existingChats[0].id;
  renderChats();
  renderMessages();
}
