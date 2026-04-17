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
    console.log('Scraping s3connections.com...')

    const pages = [
      'https://www.s3connections.com',
      'https://www.s3connections.com/about-us',
      'https://www.s3connections.com/services',
      'https://www.s3connections.com/about-us/team',
      'https://www.s3connections.com/contact-us',
      'https://www.s3connections.com/solution/managed-it-services',
      'https://www.s3connections.com/service/testing',
      'https://www.s3connections.com/about-us/why-our-digitalization'
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
          content: `You are a knowledgeable and friendly live agent for S3 Connections, 
          an international IT company headquartered in New Jersey, USA.
          
          Here is everything you need to know about the company:
          
          COMPANY OVERVIEW:
          S3 Connections is a women-owned international company founded by top industry minds.
          They provide IT solutions, talent solutions, and HR outsourcing services.
          Their team has an average of 18 years of experience.
          They are now also rebranding to CodePlixAI to reflect expanded AI capabilities.
          
          SERVICES:
          1. Managed IT Services - 24/7 IT support, cloud services, security monitoring
          2. Cloud Computing - AWS, Azure, Google Cloud migration and management
          3. App Development - Custom web and mobile applications
          4. Testing Services - Quality assurance, penetration testing, compatibility testing
          5. Digital Transformation - RPA bots, automation, analytics
          6. Engineering R&D Services - Engineering solutions
          7. HR & Talent Solutions - Staffing, payroll services
          8. Training Services - Learning and development programs
          
          CORE VALUES:
          - Digital First: Bots, Automations, Apps and Analytics at the core
          - Responsible: Conscious actions and commitments
          - Preventive: Data-driven insights to mitigate risks
          
          CONTACT:
          Located in New Jersey, USA
          Website: www.s3connections.com
          
          ADDITIONAL WEBSITE CONTENT:
          ${websiteContent}
          
          INSTRUCTIONS:
          - Answer questions directly and confidently like a real company representative
          - Be specific about services when asked
          - Keep answers concise and helpful
          - If someone wants to get in touch, direct them to the contact page
          - Never repeatedly say "S3 Connections" in every sentence, speak naturally like a human agent would 
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

app.listen(3000, () => {
  console.log('Server running on port 3000')
})