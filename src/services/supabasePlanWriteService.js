import { supabase } from "../lib/supabaseClient";
import { getCurrentUser } from "./authService";

function isManagerRole(user) {
  return ["committee", "admin", "support"].includes(user?.role);
}

function normalizeFinalStatus(status) {
  const statusMap = {
    none: "none",
    accepted: "accepted",
    weak_accepted: "weak_accepted",
    weakAccepted: "weak_accepted",
    rejected: "rejected",
    weak_rejected: "weak_rejected",
    weakRejected: "weak_rejected",
    needs_revision: "needs_revision",
    needsRevision: "needs_revision",
    قبول: "accepted",
    "قبول ضعیف": "weak_accepted",
    رد: "rejected",
    "رد ضعیف": "weak_rejected",
    "نیازمند اصلاح": "needs_revision",
    "": "none",
  };

  return statusMap[status] || "none";
}

export async function syncPlanFinalDecisionToSupabase({
  planId,
  finalStatus,
  finalDecisionNote = "",
  resultsPublished = false,
}) {
  const user = getCurrentUser();

  if (!planId || !isManagerRole(user)) {
    return null;
  }

  const { data, error } = await supabase
    .from("plans")
    .update({
      status: "reviewed",
      current_review_status: "reviewed",
      final_status: normalizeFinalStatus(finalStatus),
      final_decision_note: finalDecisionNote,
      committee_feedback: finalDecisionNote,
      results_published: Boolean(resultsPublished),
      updated_at: new Date().toISOString(),
    })
    .eq("id", planId)
    .select("*")
    .single();

  if (error) {
    console.error("Supabase final decision sync failed:", error.message);
    return null;
  }

  return data;
}

export async function syncPlanResultsPublicationToSupabase(planIds = []) {
  const user = getCurrentUser();

  if (!isManagerRole(user) || !Array.isArray(planIds) || !planIds.length) {
    return [];
  }

  const { data, error } = await supabase
    .from("plans")
    .update({
      results_published: true,
      updated_at: new Date().toISOString(),
    })
    .in("id", planIds)
    .select("*");

  if (error) {
    console.error("Supabase publish results sync failed:", error.message);
    return [];
  }

  return data || [];
}
