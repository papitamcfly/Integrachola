import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Bebe from './Bebe'

export default class Cuna extends BaseModel {
  @column({ isPrimary: true })
  public id: number

@column()
public numserie:string
@column()
public apodo:string
@column()
public active:boolean
@column()
public user_id: number
@belongsTo(() => User, {
  foreignKey: 'user_id', // Especificar la clave externa
})
public users: BelongsTo<typeof User>

@column()
public bebe_id:number
@belongsTo(() => Bebe, {
  foreignKey: 'bebe_id', // Especificar la clave externa
})
public bebes: BelongsTo<typeof Bebe>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
