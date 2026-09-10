// Netlify mirror of api/github.ts — same provider, same response shape.
// Deploy target picks one: Vercel runs api/, Netlify runs this file.
// Env vars: GITHUB_TOKEN, GITHUB_USERNAME.

type Level = 0 | 1 | 2 | 3 | 4;

type Day = { date: string; count: number; level: Level };

const TIMEOUT = 8_000;

function levelFor(count: number, max: number): Level {
  if (count <= 0 || max <= 0) return 0;
  return Math.min(4, Math.ceil((count / max) * 4)) as Level;
}

async function getActivity(): Promise<{ weeks: { days: Day[] }[]; total: number; live: boolean }> {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME;
  if (!token || !username) return { weeks: [], total: 0, live: false };
  try {
    const gqlRes = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "portfolio-currently",
      },
      body: JSON.stringify({
        query: `query($login: String!) {
          user(login: $login) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks { contributionDays { contributionCount date } }
              }
            }
          }
        }`,
        variables: { login: username },
      }),
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (!gqlRes.ok) return { weeks: [], total: 0, live: false };
    const json = (await gqlRes.json()) as Record<string, any>;
    const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!cal || !Array.isArray(cal.weeks)) return { weeks: [], total: 0, live: false };
    const max = Math.max(
      1,
      ...cal.weeks.flatMap((w: any) =>
        (w.contributionDays ?? []).map((d: any) => d.contributionCount ?? 0)
      )
    );
    const weeks = cal.weeks.map((w: any) => ({
      days: (w.contributionDays ?? []).map((d: any) => ({
        date: d.date,
        count: d.contributionCount ?? 0,
        level: levelFor(d.contributionCount ?? 0, max),
      })),
    }));
    return { weeks, total: cal.totalContributions ?? 0, live: true };
  } catch {
    return { weeks: [], total: 0, live: false };
  }
}

export const handler = async () => {
  const { weeks, total, live } = await getActivity();
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
    body: JSON.stringify({
      username: process.env.GITHUB_USERNAME ?? "Prathamesh913",
      totalContributions: total,
      weeks,
      updatedAt: new Date().toISOString().slice(0, 10),
      source: live ? "live" : "snapshot",
    }),
  };
};
