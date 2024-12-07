import amqplib, { Channel, Connection } from 'amqplib'

import { IListenDTO, IPublishDTO } from '@/shared/providers/EventsProvider/dtos'
import { IEventsProviderModel } from '@/shared/providers/EventsProvider/IEventsProviderModel'

export class AmqpEventsProvider implements IEventsProviderModel {
  private connection: Connection | null = null

  private channel: Channel | null = null

  constructor(private readonly amqpUrl: string = 'amqp://localhost') {}

  private async initConnection() {
    if (!this.connection) {
      this.connection = await amqplib.connect(this.amqpUrl)
    }

    if (!this.channel) {
      this.channel = await this.connection.createChannel()
    }

    return this.channel
  }

  private async ensureExchange(
    channel: Channel,
    exchangeName: string,
    exchangeType: string
  ) {
    await channel.assertExchange(exchangeName, exchangeType, { durable: true })
  }

  public async publish({
    exchange,
    routingKey,
    data,
  }: IPublishDTO): Promise<void> {
    try {
      const channel = await this.initConnection()

      await this.ensureExchange(channel, exchange.name, exchange.type)

      channel.publish(
        exchange.name,
        routingKey,
        Buffer.from(JSON.stringify(data))
      )
    } catch (error) {
      console.error('Error publishing message:', error)
    }
  }

  public async listen({
    exchange,
    queue,
    onMessage,
  }: IListenDTO): Promise<void> {
    try {
      const channel = await this.initConnection()

      await this.ensureExchange(channel, exchange.name, exchange.type)

      await channel.assertQueue(queue.name, { durable: true })

      await channel.bindQueue(queue.name, exchange.name, queue.key)

      channel.consume(queue.name, async (message) => {
        if (message) {
          try {
            const event = JSON.parse(message.content.toString())

            await onMessage(event)

            channel.ack(message)
          } catch (error) {
            console.error('Error processing message:', error)

            channel.nack(message)
          }
        }
      })
    } catch (error) {
      console.error('Error setting up consumer:', error)
    }
  }

  public async close(): Promise<void> {
    try {
      await this.channel?.close()

      await this.connection?.close()
    } catch (error) {
      console.error('Error closing connection:', error)
    } finally {
      this.channel = null

      this.connection = null
    }
  }
}
