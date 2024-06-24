import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'

export default class Verificacion2P extends BaseMailer {
  constructor(private email:any, private code: string) {
    super()
  }

  /**
   * WANT TO USE A DIFFERENT MAILER?
   *
   * Uncomment the following line of code to use a different
   * mailer and chain the ".options" method to pass custom
   * options to the send method
   */
  // public mailer = this.mail.use()

  /**
   * The prepare method is invoked automatically when you run
   * "Verificacion2P.send".
   *
   * Use this method to prepare the email message. The method can
   * also be async.
   */
  public prepare(message: MessageContract) {
    message.subject('Codigo de verificacion').from('papitamcfly1234@gmail.com').to(this.email).htmlView('emails/verificacion2_p',{code:this.code})
  }
}
