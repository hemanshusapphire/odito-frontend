"use client"

import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table"
import { PaymentRow } from "./PaymentRow"

const COLUMNS = ["User", "Type", "Amount", "Currency", "Status", "Invoice", "Created", "Actions"]

export function PaymentTable({ payments }) {
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
          {payments.map((payment) => (
            <PaymentRow key={payment.id} payment={payment} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
