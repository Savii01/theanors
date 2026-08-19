import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { validatePosts } from '../lib/modules/newsletter/newsletter.service.ts'

console.log('Testing validatePosts directly...')
try {
  const result = await validatePosts(
    'AI Operations for Executive Assistants',
    [
      'https://linkedin.com/posts/example1 - Delegation strategies for founders',
      'https://linkedin.com/posts/example2 - AI tools that save 10 hours a week'
    ],
    'allam-2-7b',
    'default'
  )
  console.log('Result from validatePosts:', JSON.stringify(result, null, 2))
} catch (err) {
  console.error('Error during validatePosts:', err.response?.status, err.response?.data || err)
}
