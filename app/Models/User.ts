import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Role from './Role'
import TwoFactorCode from './TwoFactorCode'
import Cuna from './Cuna'
import Bebe from './Bebe'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string
  @column()
  public nickname:string
  @column()
  public name:string
  @column()
  public lastname:string
  @column()
  public age:number
  @column.dateTime()
  public birthdate:DateTime
  @column()
  public active:boolean
  @column()
  public phone:string
  @column({ serializeAs: null })
  public password: string
  @hasMany(()=>Bebe)
  public bebes: HasMany<typeof Bebe>
  @hasMany(()=>Cuna)
  public cunas: HasMany<typeof Cuna>
  @column()
  public rememberMeToken: string | null
  @hasMany(() => TwoFactorCode)
  public twoFactorCodes: HasMany<typeof TwoFactorCode>
  @column()
  public roleId:number
  @belongsTo(()=>Role)
  public role: BelongsTo<typeof Role>
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
