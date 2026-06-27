import { TASK_STATUS } from "../constants/statuses";
import { getPlanById, getPlans } from "./planService";
import { addNotificationOnce } from "./notificationService";

const TASKS_STORAGE_KEY = "hatef_tasks";
const LEGACY_TASK_STORAGE_KEYS = ["tasks", "accepted_project_tasks"];

const STATUS = {
  WAITING:
    TASK_STATUS.WAITING_FOR_INNOVATOR_REVIEW || "waiting_for_innovator_review",
  VIEWED: TASK_STATUS.VIEWED_BY_INNOVATOR || "viewed_by_innovator",
  ANSWERED: TASK_STATUS.ANSWERED_BY_INNOVATOR || "answered_by_innovator",
  REVISION: TASK_STATUS.NEEDS_REVISION || "needs_revision",
  FINISHED: TASK_STATUS.FINISHED || "finished",
};

let memoryTasks = [];

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function makeId(prefix = "task") {
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

function getTodayPersianDate() {
  try {
    return new Date().toLocaleDateString("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function safeParseJson(value, fallbackValue) {
  try {
    return JSON.parse(value);
  } catch {
    return fallbackValue;
  }
}

function mapPersianStatusToCentralStatus(status) {
  const statusMap = {
    "در انتظار بررسی فناور": STATUS.WAITING,
    "در انتظار ارسال": STATUS.WAITING,
    "مشاهده شده": STATUS.VIEWED,
    "پاسخ داده شده": STATUS.ANSWERED,
    "ارسال شده": STATUS.ANSWERED,
    "نیازمند اصلاح": STATUS.REVISION,
    "پایان یافته": STATUS.FINISHED,
    waiting_for_innovator_review: STATUS.WAITING,
    viewed_by_innovator: STATUS.VIEWED,
    answered_by_innovator: STATUS.ANSWERED,
    needs_revision: STATUS.REVISION,
    finished: STATUS.FINISHED,
  };

  return statusMap[status] || status || STATUS.WAITING;
}

function mapManagerDecisionToCentralStatus(managerDecision, fallbackStatus) {
  if (
    managerDecision === "پایان یافته" ||
    managerDecision === STATUS.FINISHED
  ) {
    return STATUS.FINISHED;
  }

  if (
    managerDecision === "نیازمند اصلاح" ||
    managerDecision === STATUS.REVISION
  ) {
    return STATUS.REVISION;
  }

  return fallbackStatus;
}

function isManagerDecisionValue(value) {
  return [
    "پایان یافته",
    "نیازمند اصلاح",
    STATUS.FINISHED,
    STATUS.REVISION,
    "finished",
    "needs_revision",
  ].includes(value);
}

function getManagerDecisionLabel(value) {
  if (value === STATUS.FINISHED || value === "finished") {
    return "پایان یافته";
  }

  if (value === STATUS.REVISION || value === "needs_revision") {
    return "نیازمند اصلاح";
  }

  return value || "بازخورد جدید";
}

function splitDeadline(deadline) {
  const rawDeadline = String(deadline || "").trim();

  if (!rawDeadline) {
    return {
      deadlineDate: "",
      deadlineTime: "",
    };
  }

  if (rawDeadline.includes(" - ساعت ")) {
    const [deadlineDate, deadlineTime] = rawDeadline.split(" - ساعت ");
    return {
      deadlineDate: deadlineDate.trim(),
      deadlineTime: deadlineTime.trim(),
    };
  }

  if (rawDeadline.startsWith("ساعت ")) {
    return {
      deadlineDate: "",
      deadlineTime: rawDeadline.replace("ساعت ", "").trim(),
    };
  }

  return {
    deadlineDate: rawDeadline,
    deadlineTime: "",
  };
}

function normalizeTask(task) {
  const deadlineParts = splitDeadline(task.deadline);
  const status = mapPersianStatusToCentralStatus(
    task.status || task.participantStatus,
  );

  return {
    id: task.id || makeId(),
    planId: task.planId,
    title: task.title || "وظیفه جدید",
    deadlineDate: task.deadlineDate || deadlineParts.deadlineDate || "",
    deadlineTime: task.deadlineTime || deadlineParts.deadlineTime || "",
    managerMessage: task.managerMessage || "",
    innovatorResponseText:
      task.innovatorResponseText ||
      task.userDescription ||
      task.description ||
      "",
    innovatorFileUrl:
      task.innovatorFileUrl || task.userFileName || task.fileName || "",
    innovatorFileName:
      task.innovatorFileName || task.userFileName || task.fileName || "",
    status: mapManagerDecisionToCentralStatus(task.managerDecision, status),
    managerFeedback: task.managerFeedback || "",
    managerDecision: task.managerDecision || "",
    createdAt: task.createdAt || getTodayPersianDate(),
    updatedAt: task.updatedAt || getNowText(),
    reviewedAt: task.reviewedAt || "",
  };
}

function normalizeTasks(tasks) {
  if (!Array.isArray(tasks)) {
    return [];
  }

  return tasks.filter((task) => task && task.planId).map(normalizeTask);
}

function readTasksFromStorageKey(key) {
  if (!canUseStorage()) {
    return [];
  }

  const storedValue = window.localStorage.getItem(key);

  if (!storedValue) {
    return [];
  }

  return normalizeTasks(safeParseJson(storedValue, []));
}

function writeTasksToStorage(tasks) {
  const normalizedTasks = normalizeTasks(tasks);

  if (!canUseStorage()) {
    memoryTasks = normalizedTasks;
    return normalizedTasks;
  }

  window.localStorage.setItem(
    TASKS_STORAGE_KEY,
    JSON.stringify(normalizedTasks),
  );

  return normalizedTasks;
}

function readTasksFromStorage() {
  if (!canUseStorage()) {
    return memoryTasks;
  }

  const mainTasks = readTasksFromStorageKey(TASKS_STORAGE_KEY);

  if (mainTasks.length) {
    return mainTasks;
  }

  for (const legacyKey of LEGACY_TASK_STORAGE_KEYS) {
    const legacyTasks = readTasksFromStorageKey(legacyKey);

    if (legacyTasks.length) {
      writeTasksToStorage(legacyTasks);
      return legacyTasks;
    }
  }

  return [];
}

function sortTasksByNewest(tasks) {
  return [...tasks].sort((firstTask, secondTask) =>
    String(secondTask.createdAt || "").localeCompare(
      String(firstTask.createdAt || ""),
    ),
  );
}

function updateTaskCollection(taskId, updater) {
  const tasks = getTasks();
  let updatedTask = null;

  const updatedTasks = tasks.map((task) => {
    if (String(task.id) !== String(taskId)) {
      return task;
    }

    updatedTask = normalizeTask(updater(task));
    return updatedTask;
  });

  writeTasksToStorage(updatedTasks);

  return updatedTask;
}

function getTaskPlan(task) {
  if (!task?.planId) {
    return null;
  }

  return getPlanById(task.planId);
}

function notifyInnovatorNewTask(task) {
  const plan = getTaskPlan(task);

  if (!plan?.innovatorId) {
    return;
  }

  addNotificationOnce({
    targetUserId: plan.innovatorId,
    targetRole: "innovator",
    title: "وظیفه جدید برای طرح قبول‌شده",
    body: `برای طرح «${plan.title}» وظیفه «${task.title}» ثبت شد.`,
    category: "وظایف",
    sourceType: "task",
    sourceId: task.id,
    eventKey: `innovator-task-created-${task.id}`,
    isImportant: true,
  });
}

function notifyInnovatorTaskManagerReview(task) {
  const plan = getTaskPlan(task);

  if (!plan?.innovatorId) {
    return;
  }

  const decisionText = getManagerDecisionLabel(
    task.managerDecision || task.status,
  );
  const eventKeyStatus = String(
    task.managerDecision || task.status || "review",
  );

  addNotificationOnce({
    targetUserId: plan.innovatorId,
    targetRole: "innovator",
    title: "بازخورد کمیته روی وظیفه ثبت شد",
    body: `برای وظیفه «${task.title}» در طرح «${plan.title}» نتیجه «${decisionText}» ثبت شد.`,
    category: "وظایف",
    sourceType: "task",
    sourceId: task.id,
    eventKey: `innovator-task-manager-review-${task.id}-${eventKeyStatus}`,
    isImportant: true,
  });
}

export function getTasks() {
  return sortTasksByNewest(readTasksFromStorage());
}

export function setTasks(tasks) {
  return writeTasksToStorage(tasks);
}

export function getTasksByPlanId(planId) {
  return getTasks().filter((task) => String(task.planId) === String(planId));
}

export function getTaskById(taskId) {
  return getTasks().find((task) => String(task.id) === String(taskId)) || null;
}

export function getTasksWithPlanByInnovatorId(innovatorId) {
  const plans = getPlans().filter(
    (plan) => String(plan.innovatorId) === String(innovatorId),
  );
  const planById = new Map(plans.map((plan) => [String(plan.id), plan]));

  return getTasks()
    .filter((task) => planById.has(String(task.planId)))
    .map((task) => ({
      ...task,
      plan: planById.get(String(task.planId)),
    }));
}

export function addTask(planId, taskData = {}) {
  const tasks = getTasks();
  const newTask = normalizeTask({
    ...taskData,
    id: taskData.id || makeId(),
    planId,
    status: STATUS.WAITING,
    createdAt: taskData.createdAt || getTodayPersianDate(),
    updatedAt: getNowText(),
  });

  writeTasksToStorage([newTask, ...tasks]);
  notifyInnovatorNewTask(newTask);

  return newTask;
}

export function updateTask(taskId, updates = {}) {
  const previousTask = getTaskById(taskId);
  const updatedTask = updateTaskCollection(taskId, (task) => {
    const deadlineParts = splitDeadline(updates.deadline || "");
    const nextStatus = mapPersianStatusToCentralStatus(
      updates.status || updates.participantStatus || task.status,
    );
    const nextManagerDecision = updates.managerDecision ?? task.managerDecision;

    return {
      ...task,
      ...updates,
      deadlineDate:
        updates.deadlineDate ??
        (deadlineParts.deadlineDate || task.deadlineDate),
      deadlineTime:
        updates.deadlineTime ??
        (deadlineParts.deadlineTime || task.deadlineTime),
      innovatorResponseText:
        updates.innovatorResponseText ??
        updates.userDescription ??
        updates.description ??
        task.innovatorResponseText,
      innovatorFileUrl:
        updates.innovatorFileUrl ??
        updates.userFileName ??
        updates.fileName ??
        task.innovatorFileUrl,
      innovatorFileName:
        updates.innovatorFileName ??
        updates.userFileName ??
        updates.fileName ??
        task.innovatorFileName,
      status: mapManagerDecisionToCentralStatus(
        nextManagerDecision,
        nextStatus,
      ),
      managerDecision: nextManagerDecision,
      updatedAt: getNowText(),
    };
  });

  const hasNewManagerDecision =
    updatedTask &&
    isManagerDecisionValue(updatedTask.managerDecision || updates.status) &&
    String(previousTask?.managerDecision || "") !==
      String(updatedTask.managerDecision || "");

  if (hasNewManagerDecision) {
    notifyInnovatorTaskManagerReview(updatedTask);
  }

  return updatedTask;
}

export function markTaskViewed(taskId) {
  const task = getTaskById(taskId);

  if (!task || task.status !== STATUS.WAITING) {
    return task;
  }

  return updateTask(taskId, {
    status: STATUS.VIEWED,
  });
}

export function submitTaskResponse(taskId, responseData = {}) {
  const description =
    typeof responseData === "string"
      ? responseData
      : responseData.description || responseData.innovatorResponseText || "";
  const fileName =
    typeof responseData === "string"
      ? ""
      : responseData.fileName || responseData.innovatorFileUrl || "";

  return updateTask(taskId, {
    status: STATUS.ANSWERED,
    innovatorResponseText: description,
    innovatorFileUrl: fileName,
    innovatorFileName: fileName,
  });
}

export function saveTaskManagerReview(taskId, feedbackText, managerDecision) {
  return updateTask(taskId, {
    managerFeedback: feedbackText,
    managerDecision,
    status:
      managerDecision === "پایان یافته" ? STATUS.FINISHED : STATUS.REVISION,
    reviewedAt: getTodayPersianDate(),
  });
}

export function deleteTask(taskId) {
  const tasks = getTasks();
  const updatedTasks = tasks.filter(
    (task) => String(task.id) !== String(taskId),
  );

  writeTasksToStorage(updatedTasks);

  return updatedTasks;
}

export function clearTasks() {
  writeTasksToStorage([]);
  return [];
}

export { TASKS_STORAGE_KEY };
