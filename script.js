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

let leadData = {
  collecting: false,
  step: 0,
  name: '',
  email: '',
  phone: '',
  service: ''
}

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
  const keywords = ['service', 'services', 'offer', 'provide', 'help', 'what do you do', 'value engine', 'interested']
  const lower = message.toLowerCase()
  return keywords.some(function(keyword) {
    return lower.includes(keyword)
  })
}

function isExpressingInterest(message) {
  const keywords = ['interested', 'want to know more', 'tell me more', 'contact me', 'get in touch', 'reach out', 'sign up', 'learn more']
  const lower = message.toLowerCase()
  return keywords.some(function(keyword) {
    return lower.includes(keyword)
  })
}

function startLeadCapture(service) {
  leadData.collecting = true
  leadData.step = 1
  leadData.service = service
  addMessage("Great! I'd love to connect you with our team. May I get your name?", 'bot')
}

function handleLeadCapture(userMessage) {
  if (leadData.step === 1) {
    leadData.name = userMessage
    leadData.step = 2
    addMessage("Thanks " + leadData.name + "! What's your email address?", 'bot')
  } else if (leadData.step === 2) {
    leadData.email = userMessage
    leadData.step = 3
    addMessage("Got it! And your phone number?", 'bot')
  } else if (leadData.step === 3) {
    leadData.phone = userMessage
    leadData.step = 0
    leadData.collecting = false

    saveLead()

    addMessage("Perfect! Thank you " + leadData.name + ". Someone from our team will reach out to you shortly at " + leadData.email + ". Is there anything else I can help you with?", 'bot')
  }
}

function saveLead() {
  const leads = JSON.parse(localStorage.getItem('leads') || '[]')
  leads.push({
    name: leadData.name,
    email: leadData.email,
    phone: leadData.phone,
    service: leadData.service,
    date: new Date().toLocaleString()
  })
  localStorage.setItem('leads', JSON.stringify(leads))
  console.log('Lead saved:', leadData)
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

  if (leadData.collecting) {
    handleLeadCapture(userMessage)
    return
  }

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

  if (isExpressingInterest(userMessage)) {
    startLeadCapture('General Inquiry')
  }
}

sendBtn.addEventListener('click', sendMessage)

userInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') sendMessage()
})