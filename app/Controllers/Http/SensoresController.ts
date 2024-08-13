import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import axios from 'axios'
import Cuna from 'App/Models/Cuna'
import { MongoClient } from 'mongodb'
import Ws from 'App/Services/Ws'
const MongoClient = require('mongodb').MongoClient

export default class SensoresController {

    private client: MongoClient;
    private db: any;
    private devices: any;
    private datosSensores: any;

    constructor(){
        this.client = new MongoClient('mongodb://utt:password!@ec2-3-128-121-154.us-east-2.compute.amazonaws.com,ec2-3-14-171-23.us-east-2.compute.amazonaws.com,ec2-3-140-126-105.us-east-2.compute.amazonaws.com/?replicaSet=integradora');
        this.client.connect();
        this.db = this.client.db('cunas');
        this.devices = this.db.collection('devices');
        this.datosSensores = this.db.collection('Data');
    }

    public async sendToRaspberry({ auth, response, request }: HttpContextContract) {
        try {
          const user = auth.user
          const cuna = await Cuna.query()
            .where('user_id', user!.id)
            .where('id', request.input('cuna_id'))
            .firstOrFail()
    
          const datosCuna = await this.devices.find({ deviceID: cuna.numserie }).toArray()
          let url = datosCuna[0].url
    
          // Asegurar de que la URL tenga el esquema http:// o https://
          if (!/^https?:\/\//i.test(url)) {
            url = 'http://' + url
          }
          await axios.post(`${url}/api/data/`, {
            number: request.input('number'),
          })
    
          return response.status(200).json({ message: 'Datos enviados correctamente' })
        } catch (error) {
          console.error(error)
          return response.status(500).json({ message: 'Error enviando datos a la Raspberry', error: error.message })
        }
    }

    public async startCycle({ auth, response, request }: HttpContextContract) {
        try {
          const user = auth.user;
          const cuna = await Cuna.query()
            .where('user_id', user!.id)
            .where('id', request.input('cuna_id'))
            .firstOrFail();
      
          const datosCuna = await this.devices.find({ deviceID: cuna.numserie }).toArray();
          let url = datosCuna[0].url;
      
          // Asegurar de que la URL tenga el esquema http:// o https://
          if (!/^https?:\/\//i.test(url)) {
            url = 'http://' + url;
          }
      
          await axios.post(`${url}/api/start/`, {}, {
            timeout: 5000  // Timeout de 5 segundos
          });
      
          return response.status(200).json({ message: 'Datos enviados correctamente' });
        } catch (error) {
          if (error.code === 'ECONNABORTED') {
            return response.status(408).json({ message: 'La solicitud ha expirado' });
          }
        }
    }

    public async getAllData({ auth, response, request }: HttpContextContract) {
      try {
          const user = auth.user;
          const cuna = await Cuna.query()
              .where('user_id', user!.id)
              .where('id', request.input('cuna_id'))
              .firstOrFail();
  
          // Realiza la agregación utilizando $unwind y $sort
          const datosOrdenados = await this.datosSensores.aggregate([
              { "$match": { "infoSensor.deviceID": cuna.numserie } }, // Filtra por deviceID
              { "$unwind": "$infoSensor.data" }, // Desanida el array data
              { "$sort": { "infoSensor.data.datetime": -1 } }, // Ordena por datetime descendente
          ]).toArray();
  
          return response.status(200).json(datosOrdenados);
      } catch (error) {
          console.error(error);
          return response.status(500).json({ message: 'Error obteniendo todos los datos', error: error.message });
      }
    }

    public async getOneData({ auth, response, request }: HttpContextContract) {
        const user = auth.user
        const cuna = await Cuna.query()
            .where('user_id', user!.id)
            .where('id', request.input('cuna_id'))
            .firstOrFail()

        const sensorId = request.input('sensor_id')
        const datosSensor = await this.datosSensores.find(
                { "infoSensor.deviceID": cuna.numserie ,
                "infoSensor.IdSensor":sensorId}
            )
            .toArray()

            const sensorDataMap: { [key: string]: any } = {}
    
            datosSensor.forEach(sensor => {
                const sensorId = sensor.infoSensor.IdSensor
                const data = sensor.infoSensor.data.sort((a, b) => {
                    return new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
                })[0]
    
                // Actualizar el dato más reciente para el sensor si aún no existe o si es más reciente
                if (!sensorDataMap[sensorId] || new Date(data.datetime).getTime() > new Date(sensorDataMap[sensorId].data.datetime).getTime()) {
                    sensorDataMap[sensorId] = {
                        sensorId: sensor.infoSensor.IdSensor,
                        unidad: sensor.infoSensor.unidad,
                        descripcion: sensor.infoSensor.descripcion,
                        data
                    }
                }
            })
    
            // Convertir el diccionario a un array
            const recentData = Object.values(sensorDataMap)
    
            return response.status(200).json(recentData)
    }


                            /*        .-:---:.:....:+-=+*#*===-=:.       
                                    .-:-=-::::.:====--=+**+++-..       
                                    .=+===-=+-:-==+%%@@%#**=:..       
                                    .-====+=+=-:==+%%%%%%%%%*=..       
                                .=**=-=++==-:--*###%%%%%@%*+:       
                                :######+++==-=**++:.--*%%%#*#+...   
                                -#*+==+*#*+++#%#*=...:*#%%%%%%%%#.  
                                .=**#-..=**+*#%%%#**+*##%@@@@@@%%%%: 
                                .=##*++*####*##%%@@%%%%%%%%%@@@@@%%%%- 
                            .+##%%%%%%%#***##%%@@%#+-=#%%%%%%%%%%%- 
                            .**######**#*++*#%%%%%*=+**#%%%%%%%%%*. 
                            .=*****+==-=++++***+-+*#############=.  
                                .=+++++=====-==++*#%####**+*##*++:..   
                                ..=+++++=+***#%%%##*+=---------:..    
                                ...:.::..-=====:.:--::-------=-...   */
                                //ijuesuputamadre llamen a dios 

    public async getRecentData({ auth, response, request }: HttpContextContract) { 

        try {
            const user = auth.user
            const cuna = await Cuna.query()
                .where('user_id', user!.id)
                .where('id', request.input('cuna_id'))
                .firstOrFail()
    
            const datosSens = await this.datosSensores.find({ "infoSensor.deviceID": cuna.numserie }).toArray()
    
            // Usar un diccionario para almacenar el dato más reciente de cada sensor
            const sensorDataMap: { [key: string]: any } = {}
    
            datosSens.forEach(sensor => {
                const sensorId = sensor.infoSensor.IdSensor
                const data = sensor.infoSensor.data.sort((a, b) => {
                    return new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
                })[0]
    
                // Actualizar el dato más reciente para el sensor si aún no existe o si es más reciente
                if (!sensorDataMap[sensorId] || new Date(data.datetime).getTime() > new Date(sensorDataMap[sensorId].data.datetime).getTime()) {
                    sensorDataMap[sensorId] = {
                        sensorId: sensor.infoSensor.IdSensor,
                        unidad: sensor.infoSensor.unidad,
                        descripcion: sensor.infoSensor.descripcion,
                        data
                    }
                }
            })
    
            // Convertir el diccionario a un array
            const recentData = Object.values(sensorDataMap)
    
            return response.status(200).json(recentData)
        } catch (error) {
            console.error(error)
            return response.status(500).json({ message: 'Error obteniendo datos recientes', error: error.message })
        }
    }
    public async sendpeticion()
    {
      Ws.io.emit('sensores')
    }
}
