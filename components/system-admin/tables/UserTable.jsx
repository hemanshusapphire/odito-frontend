"use client"

import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table"
import { UserRow } from "./UserRow"

const COLUMNS = [
  "Avatar",
  "Name",
  "Email",
  "Role",
  "Subscription",
  "Credits",
  "Pages",
  "Email Verified",
  "Status",
  "Created",
  "Last Login",
  "Actions",
]

/**
 * Table shell — column headers + one <UserRow> per user. All row rendering
 * lives in UserRow so this file never duplicates cell JSX.
 */
export function UserTable({ users, onSuspend, onActivate }) {
  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <UserRow key={user.id} user={user} onSuspend={onSuspend} onActivate={onActivate} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
