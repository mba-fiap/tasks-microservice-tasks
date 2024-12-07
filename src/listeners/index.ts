import { userListeners } from './user'

export async function registerListeners(): Promise<void> {
  try {
    await Promise.all([userListeners()])
  } catch (error) {
    console.error('Error registering listeners:', error)
  }
}

;(async () => {
  try {
    await registerListeners()
  } catch (error) {
    console.error('Error initializing listeners:', error)
  }
})()
