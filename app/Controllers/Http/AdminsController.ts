import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Role from 'App/Models/Role'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class UsersController {
  // Create a new user (similar to the register method you provided)
  public async store({ request, response }: HttpContextContract) {
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

    const payload = await request.validate({ schema: userSchema })

    const role = await Role.findByOrFail('admin', 'admin')
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

    return response.json({ user })
  }

  // Get a list of all users
  public async index({ response }: HttpContextContract) {
    const users = await User.all()
    return response.json({ users })
  }

  // Get a single user by ID
  public async show({ params, response }: HttpContextContract) {
    try {
      const user = await User.findOrFail(params.id)
      return response.json({ user })
    } catch {
      return response.status(404).json({ message: 'User not found' })
    }
  }

  // Update an existing user by ID
  public async update({ params, request, response }: HttpContextContract) {
    const user = await User.findOrFail(params.id)

    const userSchema = schema.create({
      email: schema.string.optional({ trim: true }, [
        rules.email(),
        rules.unique({ table: 'users', column: 'email', whereNot: { id: user.id } }),
      ]),
      password: schema.string.optional({ trim: true }, [
        rules.minLength(6)
      ]),
      phone: schema.string.optional({ trim: true }, [
        rules.minLength(10),
        rules.maxLength(10),
        rules.unique({ table: 'users', column: 'phone', whereNot: { id: user.id } }),
      ]),
      nickname: schema.string.optional({ trim: true }, [
        rules.unique({ table: 'users', column: 'nickname', whereNot: { id: user.id } }),
      ]),
      name: schema.string.optional({ trim: true }),
      lastname: schema.string.optional({ trim: true }),
      birthdate: schema.date.optional({ format: 'dd-MM-yyyy' }),
      age: schema.number.optional(),
    })

    const payload = await request.validate({ schema: userSchema })

    user.merge(payload)
    await user.save()

    return response.json({ user })
  }

  // Delete a user by ID
  public async destroy({ params, response }: HttpContextContract) {
    const user = await User.findOrFail(params.id)
    await user.delete()

    return response.json({ message: 'User deleted successfully' })
  }
}

