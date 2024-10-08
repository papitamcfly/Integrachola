import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Verificacion2P from 'App/Mailers/Verificacion2P'
import Role from 'App/Models/Role'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import TwoFactorCode from 'App/Models/TwoFactorCode'
import User from 'App/Models/User'
import { DateTime } from 'luxon'

export default class AuthController 
{
  public async register({ request, response }: HttpContextContract) {
    try {
      const userSchema = schema.create({
        email: schema.string({ trim: true }, [
          rules.required(),
          rules.email(),
          rules.unique({ table: 'users', column: 'email' }),
        ]),
        password: schema.string({ trim: true }, [
          rules.required(),
          rules.minLength(6)
        ]),
        phone: schema.string({ trim: true }, [
          rules.required(),
          rules.minLength(10),
          rules.maxLength(10),
          rules.unique({ table: 'users', column: 'phone' }),
        ]),
        nickname: schema.string({ trim: true }, [
          rules.required(),
          rules.unique({ table: 'users', column: 'nickname' }),
        ]),
        name: schema.string({ trim: true }, [
          rules.required()
        ]),
        lastname: schema.string({ trim: true }, [
          rules.required()
        ]),
        birthdate: schema.date({ format: 'dd-MM-yyyy' }, [
          rules.required()
        ]),
        age: schema.number([
          rules.required()
        ]),
      })

      // Validar los datos del usuario
      const payload = await request.validate({ schema: userSchema })

      // Buscar el rol de usuario por el slug 'user'
      const role = await Role.findByOrFail('slug', 'user')

      // Crear un nuevo usuario
      const user = await User.create({
        email: payload.email,
        password: payload.password,
        phone: payload.phone,
        nickname: payload.nickname,
        name: payload.name,
        lastname: payload.lastname,
        age: payload.age,
        birthdate: payload.birthdate,
        roleId: role.id,
      })

      return response.status(201).json({ user })

    } catch (error) {
      // Si hay un error de validación, envía una respuesta con el error
      if (error.messages) {
        return response.status(422).json({
          message: 'Error de validación',
          errors: error.messages.errors,
        })
      }

      // Otros errores no esperados
      return response.status(500).json({
        message: 'Error interno del servidor',
        error: error.message,
      })
    }
  }
  
public async login({ response,request, auth }: HttpContextContract) {
  const { uid, password } = request.all()
  await auth.use('api').attempt(uid, password)
  const user = auth.user; 

  // Generar y guardar código de verificación
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  await TwoFactorCode.create({
    userId: user?.id,
    code,
    expiresAt: DateTime.now().plus({ minutes: 10 })
  })

  // Enviar código por correo electrónico o SMS (implementa esta función)
  await this.sendVerificationCode(user?.email, code)

  return response.ok({message:'correo enviado correctamente',email:user?.email})

}

public async verify({ request, auth }: HttpContextContract) {
  const { email, code } = request.all()
  const user = await User.findByOrFail('email', email)

  const validCode = await TwoFactorCode.query()
    .where('userId', user.id)
    .where('code', code)
    .where('expiresAt', '>', DateTime.now().toSQL())
    .first()

  if (!validCode) {
    return { error: 'Código inválido o expirado' }
  }

  // Eliminar el código usado
  await validCode.delete()

  // Generar token de API
  const token = await auth.use('api').generate(user)

  return { token: token.token , user:user}
}

private async sendVerificationCode(email: any, code: string) {
await new Verificacion2P(email,code).sendLater()
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
public async showUsers({response}:HttpContextContract){
  const users = await User.all()
  if(!users){
    return response.status(404).json({message: 'usuarios no encontrados'})
  }
  return response.ok(users)
}

  async test({ request, response }) {
    const datos = request.body()
    
    console.log('JSON recibido:', JSON.stringify(datos, null, 2))
    
    return response.json({ mensaje: 'JSON recibido y procesado correctamente' })
  }
}
