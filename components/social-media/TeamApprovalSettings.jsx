"use client"

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { TEAM_MEMBERS } from '@/lib/socialMediaAIDummyData'

const ROLE_BADGE = {
  Admin: 'bg-violet-50 text-violet-700 border-violet-200',
  'Content reviewer': 'bg-sky-50 text-sky-700 border-sky-200',
  Designer: 'bg-rose-50 text-rose-600 border-rose-200',
}

function initialsFor(name) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase()
}

/** "Team & approvals" settings tab - mock team members with approval permission toggles. */
export function TeamApprovalSettings({ onInvite }) {
  const [members, setMembers] = useState(TEAM_MEMBERS)

  function togglePermission(id, key) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, [key]: !m[key] } : m)))
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Team & approvals</h2>
          <p className="mt-1 text-sm text-slate-500">Decide who can approve content and designs before they go live.</p>
        </div>
        <button
          type="button"
          onClick={onInvite}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
        >
          <UserPlus className="h-4 w-4" />
          Invite member
        </button>
      </div>

      <div className="mt-5 flex flex-col divide-y divide-slate-100">
        {members.map((member) => (
          <div key={member.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
                {initialsFor(member.name)}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${ROLE_BADGE[member.role] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    {member.role}
                  </span>
                </div>
                <p className="truncate text-xs text-slate-400">{member.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <Switch
                  checked={member.canApproveContent}
                  onCheckedChange={() => togglePermission(member.id, 'canApproveContent')}
                  className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-200 [&>span]:bg-white"
                />
                Can approve content
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <Switch
                  checked={member.canApproveDesign}
                  onCheckedChange={() => togglePermission(member.id, 'canApproveDesign')}
                  className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-200 [&>span]:bg-white"
                />
                Can approve designs
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TeamApprovalSettings
