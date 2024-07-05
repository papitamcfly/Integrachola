import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  public async run () {
    await User.createMany([
      {
        name:'admin',
        email:'papitamcfly1234@gmail.com',
        nickname:'papitamcfly',
        lastname:'admin',
        age:20,
        roleId:1,
        birthdate: DateTime.fromISO('1994-07-01'),
        active: true,
        phone:'8721084243',
        password: await Hash.make('123123123') // Hashear la contraseña


      }
    ])  }
}
