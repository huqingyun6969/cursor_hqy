import request from '../utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  accessToken: string
  expiresIn: string
  refreshToken: string
}

export const login = (params: LoginParams) => {
  return request.post('/auth/login', params)
}

export const getProfile = (accessToken: string) => {
  return request.get('/auth/profile', { params: { access_token: accessToken } })
}

export const logout = () => {
  return request.post('/auth/logout')
}
