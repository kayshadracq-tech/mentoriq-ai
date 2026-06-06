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

/* NEW CHAT */
function newChat() {
  const chats = getChats();

  const id = Date.now();
  chats.unshift({ id, title: "New Chat", messages: [] });

  saveChats(chats);
  currentChatId = id;

  renderChats();
  renderMessages();

  closeSidebar();
  document.getElementById("msg").focus();
}

/* RENDER CHATS */
function renderChats() {
  const list = document.getElementById("chatList");
  const chats = getChats();

  list.innerHTML = "";

  chats.forEach(c => {
    const div = document.createElement("div");
    div.className = "chat-item" + (c.id === currentChatId ? " active" : "");
    div.innerText = c.title;

    div.onclick = () => {
      currentChatId = c.id;
      renderChats();
      renderMessages();
      closeSidebar();
    };

    div.onmousedown = () => {
      longPressTimer = setTimeout(() => openMenu(c.id), 700);
    };

    div.onmouseup = () => clearTimeout(longPressTimer);

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

/* INIT */
newChat();
renderChats();
