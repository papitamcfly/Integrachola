import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'cunas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('numserie').notNullable()
      table.string('apodo').nullable()
      table.boolean('active').defaultTo('0')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').nullable
      table.integer('bebe_id').unsigned().references('id').inTable('bebes').onDelete('CASCADE').nullable

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
