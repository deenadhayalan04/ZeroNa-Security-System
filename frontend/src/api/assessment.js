import { http } from './http'

export async function getAssessment() {
  const res = await http.get('/assessment')
  return res.data
}

export async function downloadReportCsv() {
  const res = await http.get('/report.csv', { responseType: 'blob' })
  return res.data
}

