const enterMessengerForm = document.querySelector("#enter-messenger-from");
const enterMessengerInput = document.querySelector("#enter-messenger-input");
const messengerWrapper = document.querySelector(".messenger-wrapper");
const activeUsersContainer = document.querySelector(".active-users");
const messagesContainer = document.querySelector(".messages");
const messageForm = document.querySelector("#message-form");
const messageInput = document.querySelector("#message-input");
const typingIndicatorContainer = document.querySelector("#typing-indicator");

enterMessengerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  initMessenger(enterMessengerInput.value);
  enterMessengerForm.classList.add("hide");
  messengerWrapper.classList.add("visible");
});

function initMessenger(newUserName) {
  const ws = new WebSocket("ws://139.59.145.232:8080");
  ws.addEventListener("open", (e) => {
    console.log("Connected");
    ws.send(JSON.stringify({ type: "newUser", data: newUserName }));
  });
  ws.addEventListener("error", (e) => {
    console.log("Error - ", e);
  });
  ws.addEventListener("message", (e) => {
    const messageData = JSON.parse(e.data);
    if (messageData.type === "activeUsers") {
      handleActiveUsers(messageData);
    }
    if (messageData.type === "newUser") {
      handleNewUser(messageData);
    }
    if (messageData.type === "chatMessage") {
      handleNewMessage(messageData, ws);
    }
    if (messageData.type === "userTyping") {
      handleUserTyping(messageData);
    }
    if (messageData.type === "messageLike") {
      handleMessageLike(messageData);
    }
    console.log("Message incoming", e);
    console.log("Message parsed", messageData);
  });

  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage(messageInput.value, ws);
    messageInput.value = "";
  });
  messageInput.addEventListener("input", () => {
    ws.send(JSON.stringify({ type: "userTyping", data: newUserName }));
  });
}

function handleNewUser(userData) {
  const newUserDiv = document.createElement("div");
  newUserDiv.classList.add("user-item");
  newUserDiv.innerText = userData.data;

  activeUsersContainer.appendChild(newUserDiv);
}

function handleActiveUsers(usersData) {
  activeUsersContainer.innerHTML = "";
  usersData.data.forEach((user) => {
    handleNewUser(user);
  });
}

function sendMessage(message, ws) {
  ws.send(JSON.stringify({ type: "chatMessage", data: message }));
}

function handleNewMessage(messageData, ws) {
  const messageLikes = document.createElement("span");
  const newMessageDiv = document.createElement("div");
  newMessageDiv.innerHTML = messageData.data;
  newMessageDiv.setAttribute("data-id", messageData.id);
  newMessageDiv.innerText = messageData.data;
  newMessageDiv.appendChild(messageLikes);

  newMessageDiv.addEventListener("click", () => {
    ws.send(JSON.stringify({ type: "messageLike", id: messageData.id }));
  });

  messagesContainer.appendChild(newMessageDiv);
}

function handleUserTyping(messageData) {
  typingIndicatorContainer.innerText = `${messageData.data} is typing...`;
  console.log(messageData, typingIndicatorContainer);
  setTimeout(() => {
    typingIndicatorContainer.innerText = "";
  }, 2000);
}

function handleMessageLike(messageData) {
  const messageDiv = document.querySelector(`div[data-id="${messageData.id}"]`);
  if (messageDiv) {
    messageDiv.querySelector("span").innerText = ` Likes: ${messageData.likeCount}`;
  }
}
