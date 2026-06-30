import { supabase } from "../lib/supabaseClient";

export const BUSINESS_FAVORITES_UPDATED_EVENT =
  "hatef-business-favorites-updated";

function normalizeId(value = "") {
  return String(value || "").trim();
}

function canUseWindow() {
  return typeof window !== "undefined";
}

function dispatchFavoritesUpdated(favoriteIds = []) {
  if (!canUseWindow()) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(BUSINESS_FAVORITES_UPDATED_EVENT, {
      detail: {
        favoriteIds,
      },
    }),
  );
}

async function getActiveBusinessUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message || "دریافت وضعیت ورود انجام نشد.");
  }

  if (!data?.user?.id) {
    throw new Error("برای ثبت علاقه‌مندی باید وارد حساب کاربری باشید.");
  }

  return data.user.id;
}

function buildFavoriteMetadata(opportunity = {}) {
  return {
    opportunityTitle: opportunity.title || "",
    opportunityField: opportunity.field || opportunity.category || "",
    collaborationType: opportunity.collaborationType || "",
    opportunityStatus: opportunity.status || opportunity.stage || "",
    source: opportunity.isIntroducedCommercial
      ? "introduced_commercial_opportunity"
      : "business_opportunity",
    savedFrom: "business_dashboard",
    updatedAt: new Date().toISOString(),
  };
}

function getOpportunityType(opportunity = {}) {
  return opportunity.isIntroducedCommercial
    ? "site_publication_request"
    : "business_opportunity";
}

export async function fetchCurrentBusinessFavoriteIds() {
  const businessUserId = await getActiveBusinessUserId();

  const { data, error } = await supabase
    .from("business_favorites")
    .select("opportunity_id, created_at")
    .eq("business_partner_id", businessUserId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "دریافت علاقه‌مندی‌ها انجام نشد.");
  }

  return Array.isArray(data)
    ? data.map((item) => normalizeId(item.opportunity_id)).filter(Boolean)
    : [];
}

export async function setBusinessFavoriteStatus(
  opportunityId,
  shouldBeFavorite,
  opportunity = {},
) {
  const businessUserId = await getActiveBusinessUserId();
  const normalizedOpportunityId = normalizeId(opportunityId);

  if (!normalizedOpportunityId) {
    throw new Error("شناسه موقعیت تجاری برای علاقه‌مندی معتبر نیست.");
  }

  if (shouldBeFavorite) {
    const { error } = await supabase.from("business_favorites").upsert(
      {
        business_partner_id: businessUserId,
        opportunity_id: normalizedOpportunityId,
        opportunity_type: getOpportunityType(opportunity),
        metadata: buildFavoriteMetadata(opportunity),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "business_partner_id,opportunity_id",
      },
    );

    if (error) {
      throw new Error(error.message || "ثبت علاقه‌مندی انجام نشد.");
    }
  } else {
    const { error } = await supabase
      .from("business_favorites")
      .delete()
      .eq("business_partner_id", businessUserId)
      .eq("opportunity_id", normalizedOpportunityId);

    if (error) {
      throw new Error(error.message || "حذف علاقه‌مندی انجام نشد.");
    }
  }

  const favoriteIds = await fetchCurrentBusinessFavoriteIds();
  dispatchFavoritesUpdated(favoriteIds);

  return favoriteIds;
}
