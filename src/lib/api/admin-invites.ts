import { apiFetch } from "@/lib/api/client";

export interface Invite {
  id: string;
  code: string;
  createdByUserId: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
}

export interface InviteUsage {
  id: string;
  inviteCodeId: string;
  inviterUserId: string;
  invitedUserId: string;
  usedAt: string;
  invitedUser: {
    id: string;
    email: string;
    createdAt: string;
  };
}

export interface CreateInviteInput {
  maxUses: number;
  expiresAt?: string | null;
}

interface ListInvitesResponse {
  invites: Invite[];
}

interface CreateInviteResponse {
  invite: Invite;
}

interface ListInviteUsagesResponse {
  invite: Invite;
  usages: InviteUsage[];
}

export function listInvites(): Promise<ListInvitesResponse> {
  return apiFetch<ListInvitesResponse>("/api/admin/invites");
}

export function createInvite(data: CreateInviteInput): Promise<CreateInviteResponse> {
  return apiFetch<CreateInviteResponse>("/api/admin/invites", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function listInviteUsages(id: string): Promise<ListInviteUsagesResponse> {
  return apiFetch<ListInviteUsagesResponse>(`/api/admin/invites/${encodeURIComponent(id)}/usages`);
}
