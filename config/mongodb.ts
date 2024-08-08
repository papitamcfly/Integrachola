import Env from '@ioc:Adonis/Core/Env'

export default {
  uri: Env.get('MONGODB_URI', 'mongodb://utt:password!@ec2-3-128-121-154.us-east-2.compute.amazonaws.com,ec2-3-14-171-23.us-east-2.compute.amazonaws.com,ec2-3-140-126-105.us-east-2.compute.amazonaws.com/?replicaSet=integradora ')
}
