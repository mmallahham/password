import { apiEndpoint } from '../config'
import { Login } from '../types/Login';
import { CreateLoginRequest } from '../types/CreateLoginRequest';
import Axios from 'axios'
import { UpdateLoginRequest } from '../types/UpdateLoginRequest';

export async function getLogins(idToken: string): Promise<Login[]> {
  console.log('Fetching logins')

  const response = await Axios.get(`${apiEndpoint}/logins`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Logins:', response.data)
  return response.data.items
}

export async function createLogin(
  idToken: string,
  newLogin: CreateLoginRequest
): Promise<Login> {
  const response = await Axios.post(`${apiEndpoint}/logins`,  JSON.stringify(newLogin), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchLogin(
  idToken: string,
  loginId: string,
  updatedLogin: UpdateLoginRequest
): Promise<void> {  
  await Axios.patch(`${apiEndpoint}/logins/${loginId}`, JSON.stringify(updatedLogin), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteLogin(
  idToken: string,
  loginId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/logins/${loginId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  loginId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/logins/${loginId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
