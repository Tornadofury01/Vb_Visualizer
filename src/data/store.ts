import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type {
  FilmJob,
  JumpPoint,
  Keyframe,
  Path,
  Play,
  Scene,
  ScenePlayer,
  Team,
  TeamMember,
  User,
} from "@/types/domain";

export type LocalDb = {
  users: User[];
  teams: Team[];
  teamMembers: TeamMember[];
  plays: Play[];
  scenes: Scene[];
  scenePlayers: ScenePlayer[];
  paths: Path[];
  jumpPoints: JumpPoint[];
  keyframes: Keyframe[];
  filmJobs: FilmJob[];
};

function emptyDb(): LocalDb {
  return {
    users: [],
    teams: [],
    teamMembers: [],
    plays: [],
    scenes: [],
    scenePlayers: [],
    paths: [],
    jumpPoints: [],
    keyframes: [],
    filmJobs: [],
  };
}

const FILE = path.join(process.cwd(), "data", "local-store.json");

type GlobalStore = typeof globalThis & { __vbDb?: LocalDb };

function loadFromDisk(): LocalDb {
  if (!existsSync(FILE)) return emptyDb();
  try {
    return JSON.parse(readFileSync(FILE, "utf8")) as LocalDb;
  } catch {
    return emptyDb();
  }
}

function persist(db: LocalDb) {
  mkdirSync(path.dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(db, null, 2), "utf8");
}

function getDb(): LocalDb {
  const g = globalThis as GlobalStore;
  if (!g.__vbDb) {
    g.__vbDb = loadFromDisk();
  }
  return g.__vbDb;
}

/** Local stand-in until services call Supabase. Swap this module, not the services. */
export const db = {
  read: getDb,
  write<T>(mutator: (state: LocalDb) => T): T {
    const state = getDb();
    const result = mutator(state);
    persist(state);
    return result;
  },
};

export function nowIso() {
  return new Date().toISOString();
}

export function newId() {
  return crypto.randomUUID();
}

export function slugify(input: string) {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "team"}-${newId().slice(0, 8)}`;
}
