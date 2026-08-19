import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const apiKey = process.env.GROQ_API_KEY

try {
  const res = await axios.get('https://api.groq.com/openai/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  console.log('Available Groq models:', res.data.data.map((m) => m.id))
} catch (err) {
  console.error('Groq models error:', err.response?.data || err.message)
}
