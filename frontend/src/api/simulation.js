import { http } from './http'

export async function startSimulation() {
  const res = await http.post('/simulation/start')
  return res.data
}

export async function stepSimulation() {
  const res = await http.post('/simulation/step')
  return res.data
}

export async function resetSimulation() {
  const res = await http.post('/simulation/reset')
  return res.data
}

export async function getSimulationState() {
  const res = await http.get('/simulation/state')
  return res.data
}

