import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { validatePosts } from '../lib/modules/newsletter/newsletter.service.ts'

console.log('Testing validatePosts...')
try {
  const result = await validatePosts(
    'AI Operations for Founders',
    [
      'This post is about how founders can save 10 hours using AI automation for content operations.',
      'This post discusses why delegation is critical for scaling a one-person business beyond 6 figures.'
    ],
    'allam-2-7b',
    'default'
  )
  console.log('SUCCESS:', JSON.stringify(result, null, 2))
} catch (err) {
  if (err instanceof Error) {
    console.error('DETAILED ERROR:', err.message)
    console.error('STACK:', err.stack)
  } else {
    console.error('UNKNOWN ERROR:', err)
  }
}
