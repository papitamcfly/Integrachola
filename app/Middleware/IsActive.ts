import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class IsActive {
  public async handle({auth,response}: HttpContextContract, next: () => Promise<void>) {
    try{
      await auth.check()
    }
    catch{
      return response.unauthorized({message:'no tienes permiso para acceder'})
    }
    const user = auth.user
    if(!user){
      return response.unauthorized({message:'no tienes permiso'})
    }
    if(!user.active){
      return response.unauthorized({message:'no tienes permiso para acceder'})
    }
    await next()  
  }
}
