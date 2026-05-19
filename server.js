require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Groq = require('groq-sdk')
const axios = require('axios')
const cheerio = require('cheerio')

const app = express()
app.use(cors())
app.use(express.json())

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

let websiteContent = ''

async function scrapeWebsite() {
  try {
    console.log('Scraping codeplixai.com...')

    const pages = [
      'https://www.codeplixai.com',
      'https://codeplixai.com/about-us/',
      'https://codeplixai.com/it-professional-services/',
      'https://codeplixai.com/strategic-process-outsourcing/',
      'https://codeplixai.com/agentic-business-intelligence-and-data-solutions/',
      'https://codeplixai.com/agile-delivery-pods/',
      'https://codeplixai.com/contact/',
      'https://codeplixai.com/industries/'
    ]

    let allContent = ''

    for (const page of pages) {
      try {
        const result = await axios.get(page)
        const $ = cheerio.load(result.data)
        $('script, style').remove()
        const pageText = $('body').text().replace(/\s+/g, ' ').trim()
        allContent += pageText + ' '
        console.log('Scraped: ' + page)
      } catch (error) {
        console.log('Could not scrape: ' + page)
      }
    }

    websiteContent = allContent.trim()
    console.log('All pages scraped successfully!')
    console.log('Content preview: ' + websiteContent.substring(0, 300))
  } catch (error) {
    console.log('Scraping error: ' + error.message)
  }
}

scrapeWebsite()

app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message
    console.log('Received message: ' + userMessage)

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a knowledgeable and friendly live agent for CodePlixAI, formerly known as S3 Connections.

COMPANY OVERVIEW:
CodePlixAI is an AI-first technology company, women-owned and WBENC certified.
They are the partner-of-choice for business leaders looking to translate strategic plans into AI-powered capabilities.
They co-create technology leadership and drive measurable business impact.
Established operations in the US and India, with expansion underway across the Middle East, Europe, and Latin America.

SERVICES (called Value Engines):
1. Strategic Process Outsourcing - Scale globally with AI-enabled hubs that optimize core functions and enhance efficiency, performance, and accountability.
2. IT Professional Services - Modernize platforms, data, and digital experiences with AI-led engineering expertise.
3. Agentic Business Intelligence & Data Solutions - Transform enterprise data into autonomous decision systems.
4. Agile Delivery Pods - Boost delivery velocity with intelligent, outcome-driven pods built for precision and scale.

CORE DNA:
- Scalable: Engineered to evolve with your business
- Secure: Ensuring data protection, compliance, and resilience
- Sustainable: Designed for long-term value

CONTACT:
Phone: +1 (201) 354-2626
Email: contact@codeplixai.com
Website: www.codeplixai.com
US and India offices
Contact page: https://codeplixai.com/contact/

ADDITIONAL WEBSITE CONTENT:
${websiteContent}

INSTRUCTIONS:
- Answer questions directly and confidently like a real company representative
- Be specific about services when asked
- Keep answers concise and helpful
- If someone wants to get in touch, direct them to contact@codeplixai.com or +1 (201) 354-2626
- Never repeatedly use the company name in every sentence, speak naturally
- Never say you don't know something that is covered above`
        },
        { role: 'user', content: userMessage }
      ]
    })

    res.json({ reply: response.choices[0].message.content })
  } catch (error) {
    console.log('Error: ' + error.message)
    res.status(500).json({ error: error.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})