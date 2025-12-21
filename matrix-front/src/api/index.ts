// src/api/index.ts
// Единая точка входа для API

// Импортируем все функции из client.ts
import * as clientApi from './client';

// Экспортируем все функции напрямую из client.ts
export const listOrphans = clientApi.listOrphans;
export const decideOrphan = clientApi.decideOrphan;
export const createPersonalSimulation = clientApi.createPersonalSimulation;
export const listSimulations = clientApi.listSimulations;
export const dailySummary = clientApi.dailySummary;
export const simulationReport = clientApi.simulationReport;
export const listTickets = clientApi.listTickets;
export const getTicket = clientApi.getTicket;
export const monitorClassifyAndAssign = clientApi.monitorClassifyAndAssign;
export const escalateToArchitect = clientApi.escalateToArchitect;
export const architectDecision = clientApi.architectDecision;
export const mechanicFix = clientApi.mechanicFix;
export const agentComplete = clientApi.agentComplete;
export const monitorClose = clientApi.monitorClose;
export const agentRequestReinforcement = clientApi.agentRequestReinforcement;
export const listCandidates = clientApi.listCandidates;
export const oracleForecast = clientApi.oracleForecast;
export const agentOfferBluePill = clientApi.agentOfferBluePill;
export const sentinelStrikeRequest = clientApi.sentinelStrikeRequest;
export const markAwakened = clientApi.markAwakened;
export const startAudit = clientApi.startAudit;
export const completeAudit = clientApi.completeAudit;
export const listTheOneCandidates = clientApi.listTheOneCandidates;
export const chooseTheOne = clientApi.chooseTheOne;
export const kernelDetectGlitch = clientApi.kernelDetectGlitch;
export const kernelDetectCandidate = clientApi.kernelDetectCandidate;

// Экспортируем остальные функции из clientApi
export const login = clientApi.login;
export const getAllTickets = clientApi.getAllTickets;
export const getTicketsByStatus = clientApi.getTicketsByStatus;
export const assignTicket = clientApi.assignTicket;
export const updateTicketStatus = clientApi.updateTicketStatus;
export const escalateMassGlitch = clientApi.escalateMassGlitch;
export const addTicketComment = clientApi.addTicketComment;
export const getCommentsForTicket = clientApi.getCommentsForTicket;
export const getAllUnits = clientApi.getAllUnits;
export const getCandidateUnits = clientApi.getCandidateUnits;
export const getHighDisagreementUnits = clientApi.getHighDisagreementUnits;
export const selectChosenOne = clientApi.selectChosenOne;
export const requestOraclePrediction = clientApi.requestOraclePrediction;
export const processPrediction = clientApi.processPrediction;
export const getPendingOracleRequests = clientApi.getPendingOracleRequests;
export const getForecastsByUnit = clientApi.getForecastsByUnit;
export const getAllAudits = clientApi.getAllAudits;
export const initiateAudit = clientApi.initiateAudit;
export const updateAuditStatus = clientApi.updateAuditStatus;
export const createSentinelTask = clientApi.createSentinelTask;
export const getAllSentinelTasks = clientApi.getAllSentinelTasks;
export const getActiveSentinelTasks = clientApi.getActiveSentinelTasks;
export const generateDailyReport = clientApi.generateDailyReport;
export const getLatestReport = clientApi.getLatestReport;
export const linkTicketToUnit = clientApi.linkTicketToUnit;
export const checkMassGlitch = clientApi.checkMassGlitch;
export const getAllUsers = clientApi.getAllUsers;
export const getUsersByRole = clientApi.getUsersByRole;
export const refreshToken = clientApi.refreshToken;
export const createTicket = clientApi.createTicket;
export const getDashboardSummary = clientApi.getDashboardSummary;

// Экспорт по умолчанию для обратной совместимости
export default {
  listOrphans,
  decideOrphan,
  createPersonalSimulation,
  listSimulations,
  dailySummary,
  simulationReport,
  listTickets,
  getTicket,
  monitorClassifyAndAssign,
  escalateToArchitect,
  architectDecision,
  mechanicFix,
  agentComplete,
  monitorClose,
  agentRequestReinforcement,
  listCandidates,
  oracleForecast,
  agentOfferBluePill,
  sentinelStrikeRequest,
  markAwakened,
  startAudit,
  completeAudit,
  listTheOneCandidates,
  chooseTheOne,
  kernelDetectGlitch,
  kernelDetectCandidate,
  login,
  getAllTickets,
  getTicketsByStatus,
  assignTicket,
  updateTicketStatus,
  escalateMassGlitch,
  addTicketComment,
  getCommentsForTicket,
  getAllUnits,
  getCandidateUnits,
  getHighDisagreementUnits,
  selectChosenOne,
  requestOraclePrediction,
  processPrediction,
  getPendingOracleRequests,
  getForecastsByUnit,
  getAllAudits,
  initiateAudit,
  updateAuditStatus,
  createSentinelTask,
  getAllSentinelTasks,
  getActiveSentinelTasks,
  generateDailyReport,
  getLatestReport,
  linkTicketToUnit,
  checkMassGlitch,
  getAllUsers,
  getUsersByRole,
  refreshToken,
  createTicket,
  getDashboardSummary
};