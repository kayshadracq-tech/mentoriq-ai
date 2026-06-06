let currentChatId = null;
let selectedChatId = null;
let longPressTimer = null;

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

/* CHAT CREATE */
function newChat() {
  const chats = getChats();

  const id = Date.now();
  chats.unshift({
    id,
    title: "New Chat",
    messages: []
  });

  saveChats(chats);
  currentChatId = id;

  renderChats();
  renderMessages();

  closeSidebar();
  document.getElementById("msg").focus();
}

/* RENDER CHAT LIST */
function renderChats() {
  const list = document.getElementById("chatList");
  const chats = getChats();

  list.innerHTML = "";

  chats.forEach(c => {
    const div = document.createElement("div");

    div.className = "chat-item" + (c.id === currentChatId ? " active" : "");
    div.innerText = c.title;

    // CLICK
    div.onclick = () => {
      currentChatId = c.id;
      renderChats();
      renderMessages();
      closeSidebar();
    };

    // LONG PRESS → OPEN MENU (NOT DELETE)
    div.onmousedown = () => {
      longPressTimer = setTimeout(() => {
        openMenu(c.id);
      }, 700);
    };

    div.onmouseup = () => clearTimeout(longPressTimer);
    div.ontouchstart = () => {
      longPressTimer = setTimeout(() => openMenu(c.id), 700);
    };
    div.ontouchend = () => clearTimeout(longPressTimer);

    list.appendChild(div);
  });
}

/* MENU CONTROL */
function openMenu(id) {
  selectedChatId = id;
  document.getElementById("menu").classList.remove("hidden");
}

function closeMenu() {
  document.getElementById("menu").classList.add("hidden");
}

/* DELETE CHAT */
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

/* RENAME CHAT */
function renameChat() {
  let chats = getChats();
  const chat = chats.find(c => c.id === selectedChatId);

  const name = prompt("Rename chat:", chat.title);
  if (name) chat.title = name;

  saveChats(chats);
  closeMenu();
  renderChats();
}

/* MESSAGES */
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

  if (!currentChatId) newChat();

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

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    chat.messages.push({ role: "ai", text: data.reply });
    saveChats(chats);
    renderMessages();

  } catch {
    chat.messages.push({ role: "ai", text: "Error connecting to AI" });
    saveChats(chats);
    renderMessages();
  }
}

/* INIT */
newChat();
renderChats();
