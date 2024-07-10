import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('sneakersku-be')
})

export default app
