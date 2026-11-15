export interface Hackathon {
  _id: string;
  name: string;
  slug: string;
  startsAt: string;
  endsAt: string;
  location: string;
  website?: string;
  description: string;
  maxTeamSize: number;
  attendeeCount?: number;
}

export interface PublicProfile {
  _id: string;
  firstName: string;
  lastName: string;
  school: string;
  location: string;
  bio: string;
  linkedin: string;
  skills: string[];
  interests: string[];
}

export interface User extends PublicProfile {
  email: string;
  hackathons: Hackathon[];
}

export interface NextMatch {
  candidate: PublicProfile | null;
  status?: 'team_full' | 'no_more_candidates';
  score?: number;
  breakdown?: { interests: number; skills: number };
  sharedInterests?: string[];
  newSkills?: string[];
  reason?: string;
  remaining?: number;
}

export interface Team {
  _id: string;
  name: string;
  hackathon: Pick<Hackathon, '_id' | 'name' | 'slug' | 'startsAt' | 'endsAt' | 'location' | 'maxTeamSize'>;
  members: PublicProfile[];
}

export interface SwipeResult {
  mutual: boolean;
  status?: 'team_created' | 'joined_team' | 'already_teammates' | 'on_different_teams' | 'team_full';
  team?: Team | null;
}
