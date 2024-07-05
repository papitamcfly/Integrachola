import Ws from 'App/Services/Ws'
Ws.boot()

/**
 * Listen for incoming socket connections
 */
Ws.io.on('connection', async (socket) => {
  const client = socket.client
  socket.emit('news', { hello: 'world' })
  socket.on('data:emit',async(data)=>{
    console.log(data)
    console.log(client)
    socket.emit('data:listener',data)
    socket.broadcast.emit('data:listener',data)
  })
  socket.on('my other event', (data) => {
    console.log(data)
  })

})
