import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Role {
  public async handle({auth,response}: HttpContextContract, next: () => Promise<void>,roles:string) {
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
    await user.load('role')
    if(!roles.includes(user.role.slug)){
      return response.unauthorized({message:'no tienes permiso para acceder'})
    }
    await next()  
  }
}
