import axios from 'axios'

export const createApi = (baseURL: string) => {
  const api = axios.create({
    baseURL,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error.response?.data || error.message)

      return Promise.reject(error)
    }
  )

  return api
}
