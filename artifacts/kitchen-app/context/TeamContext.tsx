import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const CURRENT_TEAM_KEY = "@prepflows_current_team";

export type TeamRole = "owner" | "admin" | "manager" | "staff";

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  subscriptionTier: "free" | "pro" | "enterprise";
  createdAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  fullName?: string;
  email?: string;
}

export interface TeamContextValue {
  currentTeam: Team | null;
  teams: Team[];
  myRole: TeamRole | null;
  loading: boolean;
  switchTeam: (teamId: string) => Promise<void>;
  createTeam: (name: string) => Promise<{ error: string | null; team?: Team }>;
  inviteMember: (
    email: string,
    role: TeamRole,
  ) => Promise<{ error: string | null }>;
  refreshTeams: () => Promise<void>;
}

const TeamContext = createContext<TeamContextValue | null>(null);

function rowToTeam(row: Record<string, unknown>): Team {
  return {
    id: row.id as string,
    name: row.name as string,
    ownerId: row.owner_id as string,
    subscriptionTier:
      (row.subscription_tier as Team["subscriptionTier"]) ?? "free",
    createdAt: row.created_at as string,
  };
}

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [myRole, setMyRole] = useState<TeamRole | null>(null);
  const [loading, setLoading] = useState(false);

  const loadTeams = useCallback(async () => {
    if (!supabase || !user) {
      setTeams([]);
      setCurrentTeam(null);
      setMyRole(null);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*, team_members!inner(role, user_id)")
        .eq("team_members.user_id", user.id);

      if (error) {
        console.warn("[TeamContext] loadTeams:", error.message);
        setTeams([]);
        setCurrentTeam(null);
        setLoading(false);
        return;
      }

      const loaded = ((data ?? []) as Record<string, unknown>[]).map(rowToTeam);
      setTeams(loaded);

      const storedId = await AsyncStorage.getItem(CURRENT_TEAM_KEY);
      const stored = loaded.find((t) => t.id === storedId) ?? loaded[0] ?? null;
      setCurrentTeam(stored);

      if (stored) {
        const memberRows = (data ?? []) as Array<
          Record<string, unknown> & {
            team_members: Array<Record<string, unknown>>;
          }
        >;
        const teamRow = memberRows.find((r) => r.id === stored.id);
        const members =
          (teamRow?.team_members as Record<string, unknown>[]) ?? [];
        const myMember = members.find((m) => m.user_id === user.id);
        setMyRole(
          stored.ownerId === user.id
            ? "owner"
            : ((myMember?.role as TeamRole) ?? "staff"),
        );
      }
    } catch (e) {
      console.warn("[TeamContext] loadTeams exception:", e);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (session) {
      loadTeams();
    } else {
      setTeams([]);
      setCurrentTeam(null);
      setMyRole(null);
    }
  }, [session, loadTeams]);

  const switchTeam = useCallback(
    async (teamId: string) => {
      const team = teams.find((t) => t.id === teamId);
      if (!team) return;
      setCurrentTeam(team);
      await AsyncStorage.setItem(CURRENT_TEAM_KEY, teamId);

      if (!supabase || !user) return;
      const { data } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", teamId)
        .eq("user_id", user.id)
        .single();
      setMyRole(
        team.ownerId === user.id
          ? "owner"
          : ((data?.role as TeamRole) ?? "staff"),
      );
    },
    [teams, user],
  );

  const createTeam = useCallback(
    async (name: string): Promise<{ error: string | null; team?: Team }> => {
      if (!supabase || !user) return { error: "Not authenticated" };

      const { data, error } = await supabase
        .from("teams")
        .insert({ name, owner_id: user.id })
        .select()
        .single();

      if (error) return { error: error.message };

      const newTeam = rowToTeam(data as Record<string, unknown>);

      await supabase.from("team_members").insert({
        team_id: newTeam.id,
        user_id: user.id,
        role: "owner",
      });

      const updated = [...teams, newTeam];
      setTeams(updated);
      setCurrentTeam(newTeam);
      setMyRole("owner");
      await AsyncStorage.setItem(CURRENT_TEAM_KEY, newTeam.id);

      return { error: null, team: newTeam };
    },
    [teams, user],
  );

  const inviteMember = useCallback(
    async (
      email: string,
      role: TeamRole,
    ): Promise<{ error: string | null }> => {
      if (!supabase || !user || !currentTeam)
        return { error: "No active team" };

      const { error } = await supabase.from("invitations").insert({
        team_id: currentTeam.id,
        email,
        role,
        invited_by: user.id,
      });

      if (error) return { error: error.message };
      return { error: null };
    },
    [currentTeam, user],
  );

  return (
    <TeamContext.Provider
      value={{
        currentTeam,
        teams,
        myRole,
        loading,
        switchTeam,
        createTeam,
        inviteMember,
        refreshTeams: loadTeams,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam(): TeamContextValue {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeam must be used inside <TeamProvider>");
  return ctx;
}
