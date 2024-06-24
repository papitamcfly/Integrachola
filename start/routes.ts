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

Route.get('/', async () => {
  return { hello: 'world' }
})
Route.post('/register','AuthController.register')
Route.post('/login','AuthController.login')
Route.post('/verify','AuthController.verify')
Route.post('/logout','AuthController.logout').middleware('auth:api')

Route.get('/users','AuthController.index').middleware('auth:api')

Route.get('/admin',async({response})=>{
  return response.json({message:'eres administrador'})
}).middleware(['auth:api','role:admin'])

Route.get('support',async({response})=>{
  return response.json({message:'eres support'})
}).middleware(['auth:api','role:support'])
