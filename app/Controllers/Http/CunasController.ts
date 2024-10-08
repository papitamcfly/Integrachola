import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Cuna from 'App/Models/Cuna'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class CunasController {
      // Admin: List all 'Cunas'
  public async AdminIndex({ response }: HttpContextContract) {
    const cunas = await Cuna.all()
    return response.status(200).json(cunas)
  }
  public async showCunasUser({params,response}:HttpContextContract)
  {
    const cunas = await Cuna.query().where('user',params.id)
    if(!cunas){
      return response.status(404).json({message:'no se encontraron cunas'})
    }
    return response.ok(cunas)
  }
  public async showCuna({response,params}:HttpContextContract)
  {
    const Bebeid = params.id
    const bebe = await Cuna.find(Bebeid)
    if (!bebe) {
      return response.status(404).json('Cuna no encontrado')
    }
    return response.status(200).json(bebe)
  }

  // User: List user's 'Cunas'
  public async UserIndex({ auth, response }: HttpContextContract) {
    const user = auth.user
    if (!user) {
      return response.status(401).json({ message: 'Usuario no autenticado' })
    }

    const cunas = await Cuna.query()
      .where('user_id', user.id)
      .preload('users')
      .preload('bebes')

    return response.status(200).json({
      cunas
    })
  }

  // Admin: Create 'Cuna'
  public async admincreate({ request, response }: HttpContextContract) {
    // Definir esquema de validación para crear
    const createCunaSchema = schema.create({
        numserie: schema.string({ trim: true }, [
          rules.maxLength(5),
          rules.unique({ table: 'cunas', column: 'numserie' }),
          rules.required()
        ]),
        
      })
  
      // Validar datos de la solicitud
      const payload = await request.validate({ schema: createCunaSchema })
  
      // Crear 'Cuna' con los datos validados
      const cuna = await Cuna.create(payload)
  
      // Responder con éxito
      return response.status(201).json({ message: 'Cuna creada correctamente', data: cuna })
  
  }

  // User: Create 'Cuna' with nickname
  public async UserCreate({ request, response, auth }: HttpContextContract) {
    // Define el esquema de validación
    const createCunaSchema = schema.create({
      apodo: schema.string({ trim: true }, [
        rules.minLength(1),
        rules.required()
      ]),
      numserie: schema.string({ trim: true }, [
        rules.maxLength(5),
        rules.required()
      ])
    })

    // Valida la solicitud
    const payload = await request.validate({ schema: createCunaSchema })

    // Busca la cuna por su número de serie
    const cuna = await Cuna.query().where('numserie', payload.numserie).first()

    // Si no encuentra la cuna, devuelve un error 404
    if (!cuna) {
      return response.status(404).json({ message: 'Cuna no encontrada' })
    }

    // Verifica si la cuna ya tiene un user_id asignado
    if (cuna.user_id) {
      return response.status(404).json({ message: 'La cuna ya está registrada con otro usuario' })
    }

    // Obtén el usuario autenticado
    const user = auth.user

    // Actualiza los datos de la cuna
    cuna.merge({
      apodo: payload.apodo,
      active: true,
      user_id: user?.id
    })

    // Guarda los cambios en la base de datos
    await cuna.save()

    // Devuelve una respuesta exitosa
    return response.status(200).json({ message: 'Cuna agregada correctamente', data: cuna })
  }

  // User: Update 'Cuna'
  public async userUpdate({ request, params, response }: HttpContextContract) {
    const createCunaSchema = schema.create({
        apodo: schema.string({ trim: true }, [
          rules.minLength(1),
          rules.required()
        ])
      })

      const payload = await request.validate({ schema: createCunaSchema })


    const cuna = await Cuna.find(params.id)
    if (!cuna) {
      return response.status(404).json({ message: 'Cuna no encontrada' })
    }

    cuna.merge({ apodo: payload.apodo })
    await cuna.save()

    return response.status(200).json({ message: 'Cuna actualizada correctamente', data: cuna })
  }

  // Admin: Update 'Cuna'
  public async adminUpdate({ request, params, response }: HttpContextContract) {
    const createCunaSchema = schema.create({
        numserie: schema.string({ trim: true }, [
          rules.maxLength(5),
          rules.required()
        ])
      })
      const payload = await request.validate({schema:createCunaSchema})

    const cuna = await Cuna.find(params.id)
    if (!cuna) {
      return response.status(404).json({ message: 'Cuna no encontrada' })
    }

    cuna.merge({ numserie: payload.numserie })
    await cuna.save()

    return response.status(200).json({ message: 'Número de serie actualizado correctamente', data: cuna })
  }

  // Admin: Delete 'Cuna'
  public async AdminDestroy({ params, response }: HttpContextContract) {
    const cuna = await Cuna.find(params.id)
    if (!cuna) {
      return response.status(404).json({ message: 'Cuna no encontrada' })
    }

    await cuna.delete()
    return response.status(200).json({ message: 'Cuna eliminada correctamente' })
  }

  // User: Soft delete 'Cuna'
  public async userDestroy({ params, response }: HttpContextContract) {
    const cuna = await Cuna.find(params.id)
    if (!cuna) {
      return response.status(404).json({ message: 'Cuna no encontrada' })
    }

    cuna.merge({ active: false })
    await cuna.save()

    return response.status(200).json({ message: 'Cuna desactivada correctamente' })
  }
  public async showCunasWithoutBebe({ response, auth }: HttpContextContract) {
    const user = await auth.use('api').authenticate()
    
    const cunas = await Cuna.query()
      .where('user_id', user.id)
      .whereNull('bebe_id')
    
    return response.status(200).json(cunas)
  }
}
