import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "./lib/supabaseClient";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ChooseMode from "./pages/ChooseMode.jsx";
import FighterBuilder from "./pages/FighterBuilder.jsx";
import SavedFighters from "./pages/SavedFighters.jsx";
import TeamBuilder from "./pages/TeamBuilder.jsx";
import SavedTeams from "./pages/SavedTeams.jsx";
import VersusMode from "./pages/VersusMode.jsx";
import Friends from "./pages/Friends.jsx";
import BattleSetupHub from "./pages/BattleSetupHub.jsx";
import BattleFlow from "./pages/BattleFlow.jsx";
import BattleCode from "./pages/BattleCode.jsx";
import SendChallenge from "./pages/SendChallenge.jsx";
import AcceptChallenge from "./pages/AcceptChallenge.jsx";
import StoryModeSetup from "./pages/StoryModeSetup.jsx";
import StoryHome from "./pages/StoryHome.jsx";
import StoryLevel from "./pages/StoryLevel.jsx";
import StoryReward from "./pages/StoryReward.jsx";
import StoryTraining from "./pages/StoryTraining.jsx";
import StoryBossIntel from "./pages/StoryBossIntel.jsx";
import StoryAbilityArchive from "./pages/StoryAbilityArchive.jsx";
import PixelBattleAnimation from "./pages/PixelBattleAnimation.jsx";
import BattleResult from "./pages/BattleResult.jsx";
import BattleHistory from "./pages/BattleHistory.jsx";
import Profile from "./pages/Profile.jsx";
import CustomPowerJudge from "./pages/CustomPowerJudge.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";
import BadgeGuide from "./pages/BadgeGuide.jsx";
import ChooseDisplayName from "./pages/ChooseDisplayName.jsx";
import CommunityBuilds from "./pages/CommunityBuilds.jsx";

// Simple state-driven navigation. No router dependency needed since
// this app is a single authenticated flow, not deep-linkable pages.
export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState({ name: "dashboard", params: {} });

  // ---- Session bootstrap ----
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) {
        setProfile(null);
        setView({ name: "dashboard", params: {} });
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // ---- Profile load / auto-create ----
  const loadProfile = useCallback(async (user) => {
    if (!user) return;

    const { data: existing, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Failed to load profile:", fetchError.message);
      return;
    }

    if (existing) {
      setProfile(existing);
      return;
    }

    // Profile row is missing (e.g. first login after signup) — create it.
    // Anonymous (guest) users have no email/metadata name — that's expected;
    // they'll be routed to the mandatory Choose Display Name screen.
    const isGuest = !!user.is_anonymous;
    const proposedName = user.user_metadata?.display_name || (user.email ? user.email.split("@")[0] : null);
    const normalized = proposedName ? proposedName.trim().toLowerCase() : null;

    const basePayload = {
      id: user.id,
      email: user.email || null,
      is_guest: isGuest,
      total_wins: 0,
      total_losses: 0,
      total_battles: 0,
      win_rate: 0,
      current_win_streak: 0,
      longest_win_streak: 0
    };

    let { data: created, error: insertError } = await supabase
      .from("profiles")
      .insert({ ...basePayload, display_name: proposedName, normalized_display_name: normalized })
      .select()
      .single();

    // Name collision (rare, e.g. two signups racing for the same alias) —
    // fall back to no name rather than failing the whole signup; the user
    // picks a different one on the mandatory Choose Display Name screen.
    if (insertError && String(insertError.message).includes("duplicate")) {
      ({ data: created, error: insertError } = await supabase
        .from("profiles")
        .insert({ ...basePayload, display_name: null, normalized_display_name: null })
        .select()
        .single());
    }

    if (insertError) {
      console.error("Failed to create profile:", insertError.message);
      return;
    }

    setProfile(created);
  }, []);

  useEffect(() => {
    if (session?.user) {
      loadProfile(session.user);
    }
  }, [session, loadProfile]);

  const navigate = (name, params = {}) => {
    setView({ name, params });
    // Refresh profile on navigation so stat/streak changes from a just-completed
    // battle (written directly to Supabase by battleService) show up immediately.
    if (session?.user) loadProfile(session.user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <div>Loading Power Clash...</div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  if (profile && !profile.display_name) {
    return <ChooseDisplayName user={session.user} onDone={() => loadProfile(session.user)} />;
  }

  // Authenticated — route between pages via lightweight state machine.
  return (
    <div className="app-shell">
      {view.name === "dashboard" && (
        <Dashboard profile={profile} onNavigate={navigate} onLogout={handleLogout} />
      )}

      {view.name === "communityBuilds" && <CommunityBuilds user={session.user} onNavigate={navigate} />}

      {view.name === "chooseMode" && <ChooseMode onNavigate={navigate} />}

      {view.name === "fighterBuilder" && (
        <FighterBuilder
          user={session.user}
          profile={profile}
          fighterId={view.params.fighterId || null}
          duplicateFrom={view.params.duplicateFrom || null}
          onNavigate={navigate}
        />
      )}

      {view.name === "savedFighters" && (
        <SavedFighters user={session.user} profile={profile} onNavigate={navigate} />
      )}

      {view.name === "teamBuilder" && (
        <TeamBuilder user={session.user} teamId={view.params.teamId || null} onNavigate={navigate} />
      )}

      {view.name === "savedTeams" && (
        <SavedTeams user={session.user} onNavigate={navigate} />
      )}

      {view.name === "versusMode" && <VersusMode onNavigate={navigate} />}

      {view.name === "friends" && <Friends user={session.user} profile={profile} onNavigate={navigate} />}

      {view.name === "battleFlow" && (
        <BattleFlow
          user={session.user}
          profile={profile}
          mode={view.params.mode}
          singlePlayerMode={view.params.singlePlayerMode || null}
          preselectedFighterId={view.params.preselectedFighterId || null}
          onNavigate={navigate}
        />
      )}

      {view.name === "battleCode" && (
        <BattleCode user={session.user} profile={profile} onNavigate={navigate} />
      )}

      {view.name === "sendChallenge" && (
        <SendChallenge user={session.user} friendId={view.params.friendId} friendName={view.params.friendName} onNavigate={navigate} />
      )}

      {view.name === "acceptChallenge" && (
        <AcceptChallenge user={session.user} profile={profile} challengeId={view.params.challengeId} onNavigate={navigate} />
      )}

      {view.name === "storyModeSetup" && <StoryModeSetup user={session.user} onNavigate={navigate} />}

      {view.name === "storyHome" && <StoryHome user={session.user} onNavigate={navigate} />}

      {view.name === "storyLevel" && (
        <StoryLevel user={session.user} fighterId={view.params.fighterId} onNavigate={navigate} />
      )}

      {view.name === "storyReward" && (
        <StoryReward
          user={session.user}
          fighterId={view.params.fighterId}
          bossKey={view.params.bossKey}
          level={view.params.level}
          grade={view.params.grade}
          onNavigate={navigate}
        />
      )}

      {view.name === "storyTraining" && (
        <StoryTraining user={session.user} fighterId={view.params.fighterId} onNavigate={navigate} />
      )}

      {view.name === "storyBossIntel" && (
        <StoryBossIntel user={session.user} fighterId={view.params.fighterId} onNavigate={navigate} />
      )}

      {view.name === "storyAbilityArchive" && (
        <StoryAbilityArchive user={session.user} fighterId={view.params.fighterId} onNavigate={navigate} />
      )}

      {view.name === "battleSetupHub" && (
        <BattleSetupHub
          user={session.user}
          profile={profile}
          opponentType={view.params.opponentType}
          myTeamId={view.params.myTeamId || null}
          onNavigate={navigate}
        />
      )}

      {view.name === "pixelBattleAnimation" && (
        <PixelBattleAnimation
          battleResult={view.params.battleResult}
          iWon={view.params.iWon}
          totalRibbons={view.params.totalRibbons}
          rematchConfig={view.params.rematchConfig}
          onNavigate={navigate}
        />
      )}

      {view.name === "battleResult" && (
        <BattleResult
          user={session.user}
          profile={profile}
          battleResult={view.params.battleResult}
          iWon={view.params.iWon}
          totalRibbons={view.params.totalRibbons}
          rematchConfig={view.params.rematchConfig}
          onNavigate={navigate}
        />
      )}

      {view.name === "battleHistory" && (
        <BattleHistory user={session.user} onNavigate={navigate} />
      )}

      {view.name === "profile" && (
        <Profile user={session.user} profile={profile} onNavigate={navigate} onLogout={handleLogout} />
      )}

      {view.name === "customPowerJudge" && <CustomPowerJudge onNavigate={navigate} />}

      {view.name === "badgeGuide" && (
        <BadgeGuide user={session.user} preselectedFighterId={view.params.fighterId || null} onNavigate={navigate} />
      )}

      {view.name === "comingSoon" && (
        <ComingSoon title={view.params.title || "This feature"} onNavigate={navigate} />
      )}
    </div>
  );
}
