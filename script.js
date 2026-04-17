const sendBtn = document.querySelector('#sendBtn')
const userInput = document.querySelector('#userInput')
const chatBox = document.querySelector('#chatBox')

function addMessage(text, sender) {
  const message = document.createElement('div')
  message.classList.add('message')

  if (sender === 'user') {
    message.classList.add('user-message')
  } else {
    message.classList.add('bot-message')
  }

  message.textContent = text
  chatBox.appendChild(message)
  chatBox.scrollTop = chatBox.scrollHeight
}

function showTyping() {
  const typing = document.createElement('div')
  typing.classList.add('message', 'bot-message')
  typing.id = 'typing'
  typing.textContent = 'Typing...'
  chatBox.appendChild(typing)
  chatBox.scrollTop = chatBox.scrollHeight
}

function removeTyping() {
  const typing = document.querySelector('#typing')
  if (typing) typing.remove()
}

async function sendMessage() {
  const userMessage = userInput.value.trim()
  if (userMessage === '') return

  addMessage(userMessage, 'user')
  userInput.value = ''
  showTyping()

  const response = await fetch('http://localhost:3000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userMessage })
  })

  const data = await response.json()
  removeTyping()
  addMessage(data.reply, 'bot')
}

sendBtn.addEventListener('click', sendMessage)

userInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') sendMessage()
})