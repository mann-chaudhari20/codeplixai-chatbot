const sendBtn = document.querySelector('#sendBtn')
const userInput = document.querySelector('#userInput')
const chatBox = document.querySelector('#chatBox')

const services = [
  { name: 'Strategic Process Outsourcing', url: 'https://codeplixai.com/strategic-process-outsourcing/' },
  { name: 'IT Professional Services', url: 'https://codeplixai.com/it-professional-services/' },
  { name: 'Agentic Business Intelligence & Data', url: 'https://codeplixai.com/agentic-business-intelligence-and-data-solutions/' },
  { name: 'Agile Delivery Pods', url: 'https://codeplixai.com/agile-delivery-pods/' },
  { name: 'Industries', url: 'https://codeplixai.com/industries/' },
  { name: 'Case Studies', url: 'https://codeplixai.com/s3tech-case-studies/' }
]

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

function showServiceButtons() {
  const container = document.createElement('div')
  container.classList.add('service-buttons')

  services.forEach(function(service) {
    const btn = document.createElement('a')
    btn.classList.add('service-btn')
    btn.textContent = service.name
    btn.href = service.url
    btn.target = '_blank'
    container.appendChild(btn)
  })

  chatBox.appendChild(container)
  chatBox.scrollTop = chatBox.scrollHeight
}

function isAskingAboutServices(message) {
  const keywords = ['service', 'services', 'offer', 'provide', 'help', 'what do you do', 'value engine']
  const lower = message.toLowerCase()
  return keywords.some(function(keyword) {
    return lower.includes(keyword)
  })
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

  const response = await fetch('https://codeplixai-chatbot.onrender.com/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userMessage })
  })

  const data = await response.json()
  removeTyping()
  addMessage(data.reply, 'bot')

  if (isAskingAboutServices(userMessage)) {
    showServiceButtons()
  }
}

sendBtn.addEventListener('click', sendMessage)

userInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') sendMessage()
})