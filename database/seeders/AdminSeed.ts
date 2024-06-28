import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'

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
        birthdate: new Date(2004, 1, 1),
        active: true,
        phone:'8721084243',
        password: await Hash.make('papitamanxD12') // Hashear la contraseña


      }
    ])  }
}
