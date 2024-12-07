export interface IListenDTO {
  exchange: {
    name: string
    type: 'topic' | 'direct' | 'fanout'
  }
  queue: {
    name: string
    key: string
  }
  onMessage: (message: any) => Promise<void>
}
