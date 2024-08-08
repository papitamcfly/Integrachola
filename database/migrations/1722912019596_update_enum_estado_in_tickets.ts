import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UpdateEnumEstadoInTickets extends BaseSchema {
  protected tableName = 'tickets'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('estado', ['en espera', 'en revisión', 'concluida']).alter()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('estado', ['en espera', 'en revicíon', 'concluida']).alter()
    })
  }
}
