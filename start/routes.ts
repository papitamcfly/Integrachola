/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.post('/register','AuthController.register')
Route.post('/login','AuthController.login')
Route.post('/verify','AuthController.verify')
Route.post('/logout','AuthController.logout').middleware('auth:api')

Route.get('/users','AuthController.showUsers').middleware(['auth:api','role:admin'])
Route.post('/createTicket','TicketsController.createTicket').middleware(['auth:api','role:user,admin'])
Route.get('/verTickets','TicketsController.verTickets').middleware(['auth:api','role:admin,support'])
Route.get('/verTicketsPersonal','TicketsController.verTicketsPersonal').middleware(['auth:api'])
Route.put('/changeStatus/:id/:status','TicketsController.changeStatus').middleware(['auth:api','role:admin,support'])
Route.get('/showTicket/:id','TicketsController.showTicket').middleware('auth:api')
Route.put('/editTicket/:id','TicketsController.editTicket').middleware('auth:api')
Route.delete('/deleteTicket/:id','TicketsController.deleteTicket').middleware('auth:api')
Route.post('/createBebe','BebesController.createBebe').middleware(['auth:api'])
Route.put('/asignarBebe','BebesController.asignarBebe').middleware(['auth:api'])
Route.get('/verBebes','BebesController.verBebes').middleware(['auth:api'])
Route.put('/updateBebe/:id','BebesController.updateBebe').middleware(['auth:api'])
Route.get('/showBebe/:id','BebesController.showBebe').middleware(['auth:api'])
Route.post('/admincreate','CunasController.admincreate').middleware(['auth:api','role:admin'])
Route.post('/userCreate','CunasController.UserCreate').middleware(['auth:api'])
Route.get('/AdminIndex','CunasController.AdminIndex').middleware(['auth:api','role:admin'])
Route.get('/UserIndex','CunasController.UserIndex').middleware(['auth:api'])
Route.get('/showCuna/:id','CunasController.showCuna').middleware(['auth:api','role:user,admin'])
Route.put('/userUpdate/:id','CunasController.userUpdate').middleware(['auth:api'])
Route.put('/adminUpdate/:id','CunasController.adminUpdate').middleware(['auth:api','role:admin'])
Route.delete('/AdminDestroy/:id','CunasController.AdminDestroy').middleware(['auth:api','role:admin'])
Route.delete('/userDestroy/:id','CunasController.userDestroy').middleware(['auth:api'])
Route.get('/showCunasUser/:id','CunasController.showCunasUser').middleware(['auth:api','role:admin'])
Route.get('/showCunasWithoutBebe','CunasController.showCunasWithoutBebe').middleware(['auth:api'])

Route.get('/admin',async({response})=>{
  return response.json({message:'eres administrador'})
}).middleware(['auth:api','role:admin'])

Route.get('support',async({response})=>{
  return response.json({message:'eres support'})
}).middleware(['auth:api','role:support'])


Route.post('sendNumber', 'SensoresController.sendToRaspberry').middleware('auth:api')
Route.post('startCycle', 'SensoresController.startCycle').middleware('auth:api')
Route.post('getAllData', 'SensoresController.getAllData').middleware('auth:api')
Route.post('getRecentData', 'SensoresController.getRecentData').middleware('auth:api')
Route.post('getOneData', 'SensoresController.getOneData').middleware('auth:api')

Route.get('/adminUsers', 'UsersController.index').middleware(['auth:api','role:admin'])
Route.get('/adminUsers/:id', 'UsersController.show').middleware(['auth:api','role:admin'])
Route.post('/registerAdmin', 'UsersController.store').middleware(['auth:api','role:admin'])
Route.put('/updateAdmin/:id', 'UsersController.update').middleware(['auth:api','role:admin'])
Route.delete('/deleteAdmin/:id', 'UsersController.destroy').middleware(['auth:api','role:admin'])

