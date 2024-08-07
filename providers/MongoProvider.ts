import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { MongoClient } from 'mongodb'
import Config from '@ioc:Adonis/Core/Config'

export default class MongoProvider {
  public static needsApplication = true

  constructor(protected app: ApplicationContract) {}

  public register() {
    this.app.container.singleton('MongoClient', async () => {
      const uri = Config.get('mongodb.uri')
      const client = new MongoClient(uri)
      await client.connect()
      return client
    })
  }

  public async boot() {
    // Optional: add any boot logic here
  }

  public async shutdown() {
    const client = this.app.container.use('MongoClient')
    await client.close()
  }
}
