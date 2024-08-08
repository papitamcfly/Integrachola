import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Bebe from 'App/Models/Bebe'
import Cuna from 'App/Models/Cuna'

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
          await bebe.save()
          return response.status(201).json({message:'bebe creado exitosamente'})
    }
    public async asignarbebe({ auth, response, request }: HttpContextContract) {
      const user = auth.user
    
      if (!user) {
        return response.status(401).json({
          message: 'Usuario no autenticado',
        })
      }
    
      // Validar entrada
      const asignbebeSchema = schema.create({
        numserie: schema.string({ trim: true }, [
          rules.minLength(5),
          rules.maxLength(5),
          rules.required(),
        ]),
        bebeId: schema.number([
          rules.exists({ table: 'bebes', column: 'id' }), // Verifica que el ID del bebé existe en la tabla 'bebes'
          rules.required(),
        ])
      })
    
      const payload = await request.validate({ schema: asignbebeSchema })
    
      // Buscar cuna
      const cuna = await Cuna.query()
        .where('numserie', payload.numserie)
        .where('user_id', user.id)
        .first()
    
      if (!cuna) {
        return response.status(404).json({
          message: 'Cuna no encontrada o no pertenece al usuario',
        })
      }
    
      // Asignar bebé a la cuna
      cuna.bebe_id = payload.bebeId // Asume que hay un campo 'bebe_id' en el modelo Cuna
      await cuna.save()
    
      return response.json({
        message: 'Bebé asignado a la cuna exitosamente',
        cuna,
      })
    }
    public async verBebes({response,auth}:HttpContextContract){
      const user = auth.user
      if (!user) {
        return response.status(401).json({ message: 'Usuario no autenticado' })
      }
  
      const bebes = await Bebe.query().where('user_id', user.id)
      return response.status(200).json(bebes)
    }

    public async showBebe({response,params}:HttpContextContract)
    {
      const Bebeid = params.id
      const bebe = await Bebe.find(Bebeid)
      if (!bebe) {
        return response.status(404).json('bebe no encontrado')
      }
      return response.status(200).json(bebe)
    }

    public async updateBebe({request,response,params}:HttpContextContract)
    {
      const updateBebeSchema = schema.create({
        nombres: schema.string({trim:true},[
          rules.minLength(1),
          rules.required()
        ]),
        apellidos: schema.string({trim:true},[
          rules.required(),
          rules.minLength(1)
        ]),
        sexo:schema.string({trim:true},[
          rules.minLength(1),
          rules.required()
        ])
      })
      const payload = await request.validate({schema:updateBebeSchema})
      const bebe = await Bebe.find(params.id)
      if(!bebe){
        return response.status(404).json({message: 'Bebé no encontrado'})
      }
      bebe.merge({
        nombres: payload.nombres,
        apellidos: payload.apellidos,
        sexo: payload.sexo,
      })
      bebe.save()
    }
}
