
let currentChatId = null;

function getChats() {
  return JSON.parse(
    localStorage.getItem("mentoriq_chats") || "[]"
  );
}

function saveChats(chats) {
  localStorage.setItem(
    "mentoriq_chats",
    JSON.stringify(chats)
  );
}

function toggleSidebar() {
  document
    .getElementById("sidebar")
    .classList
    .toggle("open");

  document
    .getElementById("overlay")
    .classList
    .toggle("show");
}

function closeSidebar() {

  document
    .getElementById("sidebar")
    .classList
    .remove("open");

  document
    .getElementById("overlay")
    .classList
    .remove("show");
}

function newChat() {

  const id = Date.now();

  const chats = getChats();

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

  document
    .getElementById("msg")
    .focus();
}

function renderChats() {

  const chats = getChats();

  const list =
    document.getElementById("chatList");

  list.innerHTML = "";

  chats.forEach(chat => {

    const item =
      document.createElement("div");

    item.className =
      "chat-item" +
      (chat.id === currentChatId
      ? " active-chat"
      : "");

    item.innerText = chat.title;

    item.onclick = () => {

      currentChatId = chat.id;

      renderChats();
      renderMessages();

      closeSidebar();

      document
        .getElementById("msg")
        .focus();
    };

    let timer;

    item.addEventListener(
      "touchstart",
      () => {

        timer = setTimeout(() => {

          if (
            confirm(
              "Delete this chat?"
            )
          ) {

            let chats =
              getChats();

            chats =
              chats.filter(
                x => x.id !== chat.id
              );

            saveChats(chats);

            if (
              currentChatId === chat.id
            ) {
              currentChatId = null;
            }

            renderChats();
            renderMessages();
          }

        }, 800);

      }
    );

    item.addEventListener(
      "touchend",
      () => clearTimeout(timer)
    );

    list.appendChild(item);
  });
}

function renderMessages() {

  const chats = getChats();

  const chat =
    chats.find(
      c => c.id === currentChatId
    );

  const box =
    document.getElementById("chat");

  box.innerHTML = "";

  if (!chat) return;

  chat.messages.forEach(m => {

    box.innerHTML += `
      <div class="${m.role}">
        <b>
        ${
          m.role === "user"
          ? "You"
          : "MentorIQ"
        }:
        </b>
        ${m.text}
      </div>
    `;
  });

  box.scrollTop =
    box.scrollHeight;
}

async function send() {

  const input =
    document.getElementById("msg");

  const message =
    input.value.trim();

  if (!message) return;

  if (!currentChatId) {
    newChat();
  }

  const chats = getChats();

  const chat =
    chats.find(
      c => c.id === currentChatId
    );

  chat.messages.push({
    role: "user",
    text: message
  });

  if (
    chat.title === "New Chat"
  ) {

    chat.title =
      message.length > 30
      ? message.substring(0,30)+"..."
      : message;
  }

  saveChats(chats);

  renderChats();
  renderMessages();

  input.value = "";

  try {

    const res =
      await fetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type":
          "application/json"
        },
        body: JSON.stringify({
          message
        })
      });

    const data =
      await res.json();

    chat.messages.push({
      role: "ai",
      text: data.reply
    });

    saveChats(chats);

    renderMessages();

  } catch {

    chat.messages.push({
      role: "ai",
      text:
      "Error connecting to AI."
    });

    saveChats(chats);

    renderMessages();
  }
}

document
  .getElementById("msg")
  .addEventListener(
    "keypress",
    function(e){

      if(e.key==="Enter"){
        send();
      }
    }
  );

newChat();
renderChats();
