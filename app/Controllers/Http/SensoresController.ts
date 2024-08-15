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
        this.datosSensores = this.db.collection('Data2');
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

    public async getAllAdminData({ response }: HttpContextContract) {
      try {
        var cuna = await Cuna.all()
        const datosCunas: any = {}
        for (let i = 0; i < cuna.length; i++) {
          const datosOrdenados = await this.datosSensores.aggregate([
            { "$match": { "infoSensor.deviceID": cuna[i].numserie } }, // Filtra por deviceID
            { "$unwind": "$infoSensor.data" }, // Desanida el array data
            { "$sort": { "infoSensor.data.datetime": -1 } }, // Ordena por datetime descendente
          ]).toArray();
          datosCunas[cuna[i].numserie] = datosOrdenados
        }
        return response.status(200).json(datosCunas);
      }
      catch (error) {
        console.error(error)
        return response.status(500).json({ message: 'Error obteniendo todos los datos', error: error.message })
      }
    }
      
    public async getAllDataDate({response, request}: HttpContextContract){
      const { fechaInicio, fechaFin } = request.all()
      console.log(fechaInicio, fechaFin)
      try {
        var cuna = await Cuna.all()
        const datosCunas: any = {}
        for (let i = 0; i < cuna.length; i++) {
          const datosOrdenados = await this.datosSensores.aggregate([
            { "$match": { "infoSensor.deviceID": cuna[i].numserie,
              "infoSensor.data.datetime": {"$gte":new Date(fechaInicio), "$lt": new Date(fechaFin)} } },
            { "$unwind": "$infoSensor.data" },
            { "$sort": { "infoSensor.data.datetime": -1 } },
            ]).toArray();
          datosCunas[cuna[i].numserie] = datosOrdenados
        }
        return response.status(200).json(datosCunas);
      }
      catch (error) {
        console.error(error)
        return response.status(500).json({ message: 'Error obteniendo todos los datos', error: error.message })
      }
    }
    public async getSingleDataDate({response, request}: HttpContextContract){
      const { fechaInicio, fechaFin } = request.all()
      console.log(fechaInicio, fechaFin)
      try {
        var cuna = await Cuna.all()
        const datosCunas: any = {}
        for (let i = 0; i < cuna.length; i++) {
          const datosOrdenados = await this.datosSensores.aggregate([
            { "$match": { 
                "infoSensor.deviceID": cuna[i].numserie,
                "infoSensor.data.datetime": {"$gte":new Date(fechaInicio), "$lt": new Date(fechaFin)},
                "infoSensor.IdSensor": request.input('sensorId')
              }},
            { "$unwind": "$infoSensor.data" },
            { "$sort": { "infoSensor.data.datetime": -1 } },
            { "$limit": 1}
            ]).toArray();
          datosCunas[cuna[i].numserie] = datosOrdenados
        }
        return response.status(200).json(datosCunas);
      }
      catch (error) {
        console.error(error)
        return response.status(500).json({ message: 'Error obteniendo todos los datos', error: error.message })
      }
    }

    public async getDataByCuna({response, request}: HttpContextContract){
      const { fechaInicio, fechaFin, cunaId } = request.all()
      try {
        var cuna = await Cuna.find(cunaId)
        const datosOrdenados = await this.datosSensores.aggregate([
          { "$match": { "infoSensor.deviceID": cuna!.numserie,
            "infoSensor.data.datetime": {"$gte":new Date(fechaInicio), "$lt": new Date(fechaFin)} } },
          { "$unwind": "$infoSensor.data" },
          { "$sort": { "infoSensor.data.datetime": -1 } },
          ]).toArray();
        return response.status(200).json(datosOrdenados);
      }
      catch (error) {
        console.error(error)
        return response.status(500).json({ message: 'Error obteniendo todos los datos', error: error.message })
      }
    }

    public async getHighValuesByDate({ response, request }) {
      const { fechaInicio, fechaFin, cunaId, sensorId } = request.all();
      try {
        const cuna = await Cuna.find(cunaId);
        if (!cuna) {
          return response.status(404).json({ message: 'Cuna no encontrada' });
        }
    
        const normalValues = await this.getValues(sensorId);
    
        const datosOrdenados = await this.datosSensores.aggregate([
          {
            "$match": {
              "infoSensor.IdSensor": sensorId,
              "infoSensor.deviceID": cuna.numserie,
              "infoSensor.data.datetime": { "$gte": new Date(fechaInicio), "$lt": new Date(fechaFin) }
            }
          },
          { "$unwind": "$infoSensor.data" },
          { "$sort": { "infoSensor.data.datetime": -1 } },
          {
            "$match": {
              "infoSensor.data.data": { "$ne": normalValues }
            }
          },
          {
            "$group": {
              "_id": null,
              "count": { "$sum": 1 }
            }
          }
        ]).toArray();
    
        return response.status(200).json({ count: datosOrdenados.length > 0 ? datosOrdenados[0].count : 0 });
      } catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Error obteniendo los datos', error: error.message });
      }
    }    

    public async getValues(Sensor:string){
      switch(Sensor){
        case 'SRC':
          return "Normal"
        case 'MQ':
          return 'Bajo'
        default:
          throw new Error(`Sensor no reconocido: ${Sensor}`);
      }
    }

    public async getBabyData({response, request}) {
      const {bebeId} = request.all()
    
      try {
        var bebe = await Cuna.query().where('bebe_id', bebeId).first()
        if (!bebe) {
          return response.status(404).json({ message: 'Bebé no encontrado' })
        }
        var data = await this.datosSensores.find({ "infoSensor.deviceID": bebe.numserie }).toArray()

        if (data.length === 0) {
          return response.status(404).json({ message: 'No se encontraron datos del sensor para este bebé' })
        }
    
        return response.status(200).json(data)
      } catch (error) {
        
        console.error('Error al obtener los datos del bebé:', error)
        return response.status(500).json({ message: 'Ocurrió un error al obtener los datos del bebé', error: error.message })
      }
    }
    

    public async sendpeticion()
    {
      Ws.io.emit('sensores')
    }

}
