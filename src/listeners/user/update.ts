import { EXCHANGES, ROUTING_KEYS } from '@/config/events'
import { container } from 'tsyringe'

import { ICacheProviderModel } from '@/shared/providers/CacheProvider/ICacheProviderModel'
import { IEventsProviderModel } from '@/shared/providers/EventsProvider/IEventsProviderModel'

export async function userUpdatedListener(): Promise<void> {
  const eventsProvider =
    container.resolve<IEventsProviderModel>('EventsProvider')

  const cacheProvider = container.resolve<ICacheProviderModel>('CacheProvider')

  await eventsProvider.listen({
    exchange: EXCHANGES.USER,
    queue: { name: EXCHANGES.USER.name, key: ROUTING_KEYS.USER.UPDATED },
    onMessage: async (event) => {
      const key = `user:${event.id}`

      await cacheProvider.invalidate({
        key,
      })

      await cacheProvider.save({
        key,
        value: event,
      })
    },
  })
}
