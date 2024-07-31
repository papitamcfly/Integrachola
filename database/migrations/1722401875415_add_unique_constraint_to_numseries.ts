import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddUniqueConstraintToNumserie extends BaseSchema {
  protected tableName = 'cunas'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.unique(['numserie'])
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['numserie'])
    })
  }
}
