const TERMINAL = ['Converted', 'Not Interested', 'Lost', 'Invalid']
const NO_NEXT_ACTION = ['Not Interested', 'Wrong Number', 'Converted']
const OUTCOME_STATUS = {
  Interested: 'Interested',
  'Not Interested': 'Not Interested',
  'Call Back': 'Follow-up',
  'Visit Fixed': 'Visit Scheduled',
  'Rate Inquiry': 'Interested',
  'Gold Loan Inquiry': 'Interested',
  'Gold Selling Inquiry': 'Interested',
  Converted: 'Converted',
  'Wrong Number': 'Invalid',
  'No Response': 'Contacted',
}

function permissionsFor(role) {
  if (role === 'Super Admin' || role === 'Admin') return { viewAllLeads: true, manageStaff: true, setTargets: true, viewReports: true, manageFinance: true }
  if (role === 'Manager') return { viewAllLeads: true, manageStaff: false, setTargets: true, viewReports: true, manageFinance: true }
  if (role === 'Accountant') return { viewAllLeads: true, manageStaff: false, setTargets: false, viewReports: true, manageFinance: true }
  return { viewAllLeads: false, manageStaff: false, setTargets: false, viewReports: false, manageFinance: true }
}

function can(user, key) {
  if (!user) return false
  if (user.role === 'Admin' || user.role === 'Super Admin') return true
  return Boolean(user.permissions?.[key])
}

function seesAll(user) {
  return can(user, 'viewAllLeads') || user.role === 'Accountant'
}

function sensitive(user) {
  return ['Super Admin', 'Admin', 'Manager', 'Accountant'].includes(user.role)
}

function presentCustomer(customer, user) {
  const json = customer.toJSON()
  if (!sensitive(user) && json.kyc) {
    json.kyc = { ...json.kyc, aadhaar: json.kyc.aadhaar ? 'XXXX-XXXX-XXXX' : '', pan: json.kyc.pan ? '**********' : '' }
  }
  return json
}

async function nextCode(Model, prefix) {
  const rows = await Model.find().select('code').lean()
  const max = rows.reduce((n, row) => Math.max(n, Number(String(row.code || '').replace(/\D/g, '')) || 0), 0)
  return `${prefix}${max + 1}`
}

module.exports = {
  TERMINAL, NO_NEXT_ACTION, OUTCOME_STATUS, permissionsFor, can, seesAll, sensitive, presentCustomer, nextCode,
}
