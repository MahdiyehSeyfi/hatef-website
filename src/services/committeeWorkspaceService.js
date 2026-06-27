const COMMITTEE_WORKSPACE_STORAGE_KEY = "hatef_committee_workspace";

let memoryWorkspace = [];

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function makeId(prefix = "committee-note") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function getNowText() {
  const now = new Date();

  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(now);
  } catch {
    return now.toISOString();
  }
}

function safeParseJson(value, fallbackValue) {
  try {
    return JSON.parse(value);
  } catch {
    return fallbackValue;
  }
}

function normalizeNote(note) {
  return {
    id: note.id || makeId(),
    planId: note.planId,
    viewed: Boolean(note.viewed),
    feedbackText: note.feedbackText || "",
    recommendation: note.recommendation || "",
    score: note.score || "",
    folders: Array.isArray(note.folders) ? note.folders : [],
    createdAt: note.createdAt || getNowText(),
    updatedAt: note.updatedAt || note.createdAt || getNowText(),
  };
}

function normalizeWorkspace(notes) {
  if (!Array.isArray(notes)) {
    return [];
  }

  return notes.filter((note) => note && note.planId).map(normalizeNote);
}

function readWorkspace() {
  if (!canUseStorage()) {
    return memoryWorkspace;
  }

  const storedValue = window.localStorage.getItem(
    COMMITTEE_WORKSPACE_STORAGE_KEY,
  );

  if (!storedValue) {
    return [];
  }

  return normalizeWorkspace(safeParseJson(storedValue, []));
}

function writeWorkspace(notes) {
  const normalizedNotes = normalizeWorkspace(notes);

  if (!canUseStorage()) {
    memoryWorkspace = normalizedNotes;
    return normalizedNotes;
  }

  window.localStorage.setItem(
    COMMITTEE_WORKSPACE_STORAGE_KEY,
    JSON.stringify(normalizedNotes),
  );

  return normalizedNotes;
}

function upsertNote(planId, updater) {
  const notes = readWorkspace();
  const normalizedPlanId = String(planId);
  const existingNote =
    notes.find((note) => String(note.planId) === normalizedPlanId) || null;

  const nextNote = normalizeNote(
    updater(
      existingNote || {
        id: makeId(),
        planId,
        viewed: false,
        feedbackText: "",
        recommendation: "",
        score: "",
        folders: [],
        createdAt: getNowText(),
      },
    ),
  );

  const nextNotes = existingNote
    ? notes.map((note) =>
        String(note.planId) === normalizedPlanId ? nextNote : note,
      )
    : [nextNote, ...notes];

  writeWorkspace(nextNotes);

  return nextNote;
}

export function getCommitteeWorkspaceNotes() {
  return readWorkspace();
}

export function getCommitteePersonalPlanNote(planId) {
  return (
    readWorkspace().find((note) => String(note.planId) === String(planId)) ||
    null
  );
}

export function markCommitteePersonalPlanViewed(planId) {
  return upsertNote(planId, (note) => ({
    ...note,
    planId,
    viewed: true,
    updatedAt: getNowText(),
  }));
}

export function saveCommitteePersonalPlanNote(planId, noteData = {}) {
  return upsertNote(planId, (note) => ({
    ...note,
    planId,
    viewed: noteData.viewed ?? note.viewed ?? true,
    feedbackText: noteData.feedbackText ?? note.feedbackText ?? "",
    recommendation: noteData.recommendation ?? note.recommendation ?? "",
    score: noteData.score ?? note.score ?? "",
    folders: Array.isArray(noteData.folders) ? noteData.folders : note.folders,
    updatedAt: getNowText(),
  }));
}

export function deleteCommitteePersonalPlanNote(planId) {
  const notes = readWorkspace();
  const nextNotes = notes.filter(
    (note) => String(note.planId) !== String(planId),
  );

  writeWorkspace(nextNotes);

  return nextNotes;
}

export function toggleCommitteePersonalPlanFolder(planId, folderId) {
  return upsertNote(planId, (note) => {
    const folders = Array.isArray(note.folders) ? note.folders : [];
    const hasFolder = folders.includes(folderId);

    return {
      ...note,
      planId,
      folders: hasFolder
        ? folders.filter((item) => item !== folderId)
        : [...folders, folderId],
      updatedAt: getNowText(),
    };
  });
}

export function clearCommitteeWorkspace() {
  writeWorkspace([]);
  return [];
}

export { COMMITTEE_WORKSPACE_STORAGE_KEY };
