import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Ticket from 'App/Models/Ticket'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
export default class TicketsController 
{
public async verTickets({response}:HttpContextContract)
{
    const tickets = Ticket.all()
    return response.ok(tickets)
}
public async verTicketsPersonal({auth,response}:HttpContextContract)
{
    const user = auth.user
    if(!user)
        {
            return response.unauthorized('usuario no autentificado')
        }
        const tickets = await Ticket.query().where('user_id', user.id).first()
        return response.status(200).json(tickets)
}

public async createTicket({auth,response,request}:HttpContextContract)
{
    const user = auth.user
    const user_id = user?.id
    if(!user)
    {
        return response.unauthorized('usuario no autentificado')
    }
    const createCunaSchema = schema.create({
        descripcion: schema.string({ trim: true }, [
          rules.minLength(1),
          rules.required()
        ]),
        asunto: schema.string({trim:true},[
            rules.minLength(1),
            rules.required()
        ])
      })
      const payload = await request.validate({schema:createCunaSchema})
      const ticket = await Ticket.create(payload)
      ticket.merge({
        estado: 'en espera',
        user_id: user_id
      })
      ticket.save()
      return response.status(201).json(ticket)
}
public async showTicket({response,params}:HttpContextContract)
{
  const ticketId = params.id
  const ticket = Ticket.findOrFail(ticketId)
  if (!ticket) {
    return response.status(404).json('ticket no encontrado')
  }
  return response.status(200).json(ticket)
}
public async changeStatus({response,params}:HttpContextContract)
{
  const ticketId = params.id
  const status = params.status
  const ticket = await Ticket.find(ticketId)
  if(!ticket){
    return response.status(404).json('ticket no encontrado')
  }
  ticket.merge({
    estado:status
  })
  ticket.save()
  return response.status(200).json('estado actualizado correctamente')
}
}
