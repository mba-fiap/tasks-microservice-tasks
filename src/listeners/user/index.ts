import { userCreatedListener } from './create'
import { userDroppedListener } from './drop'
import { userUpdatedListener } from './update'

export async function userListeners(): Promise<void> {
  try {
    await Promise.all([
      userCreatedListener(),
      userUpdatedListener(),
      userDroppedListener(),
    ])
  } catch (error) {
    console.error('Error registering user listeners:', error)
  }
}
