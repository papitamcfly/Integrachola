import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('email', 255).notNullable().unique()
      table.string('password', 180).notNullable()
      table.integer('role_id').unsigned().references('id').inTable('roles').defaultTo(2)
      table.string('remember_me_token').nullable()
      table.string('nickname',255).notNullable().unique()
      table.string('phone',10).notNullable().unique()
      table.string('name',255).notNullable()
      table.string('lastname',255).notNullable()
      table.date('birthdate').notNullable()
      table.integer('age').notNullable()
      table.boolean('active').defaultTo(0)

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
