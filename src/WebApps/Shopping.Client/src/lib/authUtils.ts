/**
 * Helper to determine if a Clerk user has administrator privileges
 */
export function checkIsAdmin(user: any): boolean {
  if (!user) return false;

  // 0. Development flag to allow all authenticated users as admin (optional)
  if (
    process.env.ALLOW_DEV_ADMIN === "true" ||
    process.env.NEXT_PUBLIC_ALLOW_DEV_ADMIN === "true"
  ) {
    return true;
  }

  // 1. Check ADMIN_EMAILS environment variable (comma-separated list)
  const envAdminEmails = (
    process.env.ADMIN_EMAILS ||
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
    ""
  )
    .toLowerCase()
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  const primaryEmail = String(user.primaryEmailAddress?.emailAddress || "").toLowerCase().trim();
  const allEmails: string[] = Array.isArray(user.emailAddresses)
    ? user.emailAddresses.map((e: any) => String(e?.emailAddress || "").toLowerCase().trim()).filter(Boolean)
    : [];

  if (primaryEmail && !allEmails.includes(primaryEmail)) {
    allEmails.push(primaryEmail);
  }

  if (envAdminEmails.length > 0) {
    const isConfiguredAdmin = allEmails.some((em) => envAdminEmails.includes(em));
    if (isConfiguredAdmin) return true;
  }

  // 2. Check publicMetadata.role (Clerk Dashboard: { "role": "admin" })
  const publicRole = user.publicMetadata?.role;
  if (typeof publicRole === "string" && publicRole.toLowerCase().trim() === "admin") {
    return true;
  }
  if (Array.isArray(publicRole) && publicRole.some((r: any) => String(r).toLowerCase().trim() === "admin")) {
    return true;
  }

  // 2b. Check publicMetadata.roles (array of roles)
  const publicRoles = user.publicMetadata?.roles;
  if (Array.isArray(publicRoles) && publicRoles.some((r: any) => String(r).toLowerCase().trim() === "admin")) {
    return true;
  }

  // 3. Check unsafeMetadata.role
  const unsafeRole = user.unsafeMetadata?.role;
  if (typeof unsafeRole === "string" && unsafeRole.toLowerCase().trim() === "admin") {
    return true;
  }
  if (Array.isArray(unsafeRole) && unsafeRole.some((r: any) => String(r).toLowerCase().trim() === "admin")) {
    return true;
  }

  // 4. Check Organization memberships (Clerk Org Roles: "org:admin" or "admin")
  if (user.organizationMemberships && Array.isArray(user.organizationMemberships)) {
    const isOrgAdmin = user.organizationMemberships.some((m: any) => 
      String(m.role || "").toLowerCase().includes("admin")
    );
    if (isOrgAdmin) return true;
  }

  // 5. Check custom metadata key "isAdmin"
  if (user.publicMetadata?.isAdmin === true || user.unsafeMetadata?.isAdmin === true) {
    return true;
  }

  // 6. Fallback check for emails explicitly designated as admin
  const hasAdminEmail = allEmails.some(
    (em) =>
      em.startsWith("admin@") ||
      em.includes("+admin@") ||
      em.startsWith("administrator@") ||
      em.endsWith("@admin.eshop.com")
  );
  if (hasAdminEmail) {
    return true;
  }

  // 7. Check username
  const username = String(user.username || "").toLowerCase().trim();
  if (username === "admin" || username === "administrator") {
    return true;
  }

  return false;
}

