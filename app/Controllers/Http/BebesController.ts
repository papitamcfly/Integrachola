import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Bebe from 'App/Models/Bebe'

export default class BebesController 
{
    public async createBebe({request,response,auth}:HttpContextContract)
    {
        const createCunaSchema = schema.create({
            nombres: schema.string({ trim: true }, [
              rules.minLength(1),
              rules.required()
            ]),
            apellidos: schema.string({trim:true},[
                rules.minLength(1),
                rules.required()
            ]),
            sexo: schema.string({trim:true},[
                rules.minLength(1),
                rules.required(),
            ])
          })
          const user = auth.user
          const payload = await request.validate({schema:createCunaSchema})
          const bebe = await Bebe.create(payload)
          bebe.merge({
            user_id: user?.id
          })
          return response.status(201).json({message:'bebe creado exitosamente'})
    }
}
