import { MOCK_CALLS } from "../data/mockCalls";
import { CALL_STATUS } from "../constants/statuses";

function cloneCall(call) {
  return { ...call };
}

export function getCalls() {
  return MOCK_CALLS.map(cloneCall);
}

export function getCallById(callId) {
  const call = MOCK_CALLS.find((item) => item.id === callId);
  return call ? cloneCall(call) : null;
}

export function getPublishedCalls() {
  return MOCK_CALLS.filter((call) => call.status === CALL_STATUS.PUBLISHED).map(
    cloneCall,
  );
}

export function getDraftCalls() {
  return MOCK_CALLS.filter((call) => call.status === CALL_STATUS.DRAFT).map(
    cloneCall,
  );
}

export function getArchivedCalls() {
  return MOCK_CALLS.filter((call) => call.status === CALL_STATUS.ARCHIVED).map(
    cloneCall,
  );
}

export function getCurrentCalls() {
  return MOCK_CALLS.filter((call) =>
    [CALL_STATUS.PUBLISHED, CALL_STATUS.DRAFT].includes(call.status),
  ).map(cloneCall);
}

export function getCallsByStatus(status) {
  return MOCK_CALLS.filter((call) => call.status === status).map(cloneCall);
}

export function searchCalls(keyword) {
  const normalizedKeyword = String(keyword || "")
    .trim()
    .toLowerCase();

  if (!normalizedKeyword) {
    return getCalls();
  }

  return MOCK_CALLS.filter((call) => {
    const searchableText = [
      call.title,
      call.subtitle,
      call.field,
      call.description,
      call.moreDescription,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedKeyword);
  }).map(cloneCall);
}
