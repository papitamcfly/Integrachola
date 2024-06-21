import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Role from 'App/Models/Role'
import User from 'App/Models/User'

export default class AuthController 
{
public async register({request,response}:HttpContextContract)
{
    const {email,password,phone,nickname,name,lastname,age,birthdate} = request.all()
    const role = await Role.findByOrFail('slug','support')
    const user = await User.create({email,password,phone,nickname,name,lastname,age,birthdate,roleId:role.id})
    return response.json({user})

}
public async login({ request, auth, response }: HttpContextContract) {
    const { uid, password } = request.only(['uid', 'password'])

    try {
      const token = await auth.use('api').attempt(uid, password)
      const user = auth.user; // Obtener la información del usuario autenticado
      return response.ok({ token, user });
    } catch {
      return response.unauthorized('Invalid credentials')
    }
  }
  public async logout({auth,response}:HttpContextContract){
    try{
    await auth.use('api').logout()
    return response.ok('saliste correctamente de tu cuenta')
    }
    catch
    {
      return response.unauthorized('no se encotro token')
    }
  }

}
