import axios from 'axios'

const client = axios.create({ baseURL: '/api' })

client.interceptors.response.use(
  res => res,
  err => {
    console.error('[api]', err.response?.data?.error || err.message)
    return Promise.reject(err)
  }
)

export default client
