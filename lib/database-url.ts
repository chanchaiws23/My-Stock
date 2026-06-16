function buildConnectionStringFromPgVars() {
  const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } = process.env;

  if (!PGHOST || !PGUSER || !PGPASSWORD || !PGDATABASE) {
    return undefined;
  }

  const port = PGPORT ?? "5432";
  const username = encodeURIComponent(PGUSER);
  const password = encodeURIComponent(PGPASSWORD);
  const database = encodeURIComponent(PGDATABASE);

  return `postgresql://${username}:${password}@${PGHOST}:${port}/${database}`;
}

function normalizeDatabaseUrl(candidate: string) {
  const normalized = candidate.startsWith("postgres://")
    ? candidate.replace(/^postgres:\/\//, "postgresql://")
    : candidate;

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "postgresql:" || !parsed.pathname || parsed.pathname === "/") {
      return undefined;
    }

    return normalized;
  } catch {
    return undefined;
  }
}

export function resolveDatabaseUrl(options?: { required?: boolean }) {
  const candidate = process.env.DATABASE_URL?.trim();
  const normalized = candidate ? normalizeDatabaseUrl(candidate) : undefined;

  if (normalized) {
    return normalized;
  }

  const fromPgVars = buildConnectionStringFromPgVars();
  if (fromPgVars) {
    return fromPgVars;
  }

  if (options?.required === false) {
    return undefined;
  }

  throw new Error(
    "A PostgreSQL connection string is required. Set DATABASE_URL or PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE.",
  );
}
