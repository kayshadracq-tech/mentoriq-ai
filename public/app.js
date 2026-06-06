let currentChatId = null;
let longPressTimer = null;

/* ===== STORAGE ===== */
function getChats() {
  return JSON.parse(localStorage.getItem("mentoriq_chats") || "[]");
}

function saveChats(chats) {
  localStorage.setItem("mentoriq_chats", JSON.stringify(chats));
}

/* ===== SIDEBAR ===== */
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("overlay").classList.toggle("show");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}

/* ===== NEW CHAT ===== */
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

/* ===== RENDER CHAT LIST ===== */
function renderChats() {
  const chats = getChats();
  const list = document.getElementById("chatList");

  list.innerHTML = "";

  chats.forEach(c => {
    const div = document.createElement("div");
    div.className = "chat-item" + (c.id === currentChatId ? " active-chat" : "");
    div.innerText = c.title;

    /* CLICK */
    div.onclick = () => {
      currentChatId = c.id;
      renderChats();
      renderMessages();
      closeSidebar();
      document.getElementById("msg").focus();
    };

    /* LONG PRESS DELETE */
    div.onmousedown = () => {
      longPressTimer = setTimeout(() => {
        deleteChat(c.id);
      }, 800);
    };

    div.onmouseup = () => clearTimeout(longPressTimer);
    div.ontouchstart = () => {
      longPressTimer = setTimeout(() => deleteChat(c.id), 800);
    };
    div.ontouchend = () => clearTimeout(longPressTimer);

    list.appendChild(div);
  });
}

/* ===== DELETE CHAT ===== */
function deleteChat(id) {
  let chats = getChats();
  chats = chats.filter(c => c.id !== id);

  saveChats(chats);

  if (currentChatId === id) {
    currentChatId = null;
    document.getElementById("chat").innerHTML = "";
  }

  renderChats();
}

/* ===== RENDER MESSAGES ===== */
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

/* ===== SEND MESSAGE ===== */
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

  } catch (err) {
    chat.messages.push({ role: "ai", text: "Connection error" });
    saveChats(chats);
    renderMessages();
  }
}

/* ===== INIT ===== */
newChat();
renderChats();
