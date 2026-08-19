import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const apiKey = process.env.GROQ_API_KEY

async function testModel(modelId) {
  try {
    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: modelId,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say hello in 3 words.' },
        ],
        temperature: 0.7,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )
    console.log(`Success with ${modelId}:`, res.data.choices[0].message.content)
  } catch (err) {
    console.error(`Error with ${modelId}:`, err.response?.status, err.response?.data)
  }
}

console.log('Testing allam-2-7b...')
await testModel('allam-2-7b')

console.log('Testing qwen/qwen3.6-27b...')
await testModel('qwen/qwen3.6-27b')

console.log('Testing openai/gpt-oss-20b...')
await testModel('openai/gpt-oss-20b')

console.log('Testing groq/compound...')
await testModel('groq/compound')
