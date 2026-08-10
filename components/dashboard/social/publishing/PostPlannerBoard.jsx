"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import PlannerCard from './PlannerCard'
import { WEEKDAYS, INITIAL_PLANNER_TASKS, PUBLISHING_PLATFORMS, CAMPAIGNS, PRIORITIES, AUTHORS } from '@/lib/publishingDummyData'

const EMPTY_TASK = { platform: PUBLISHING_PLATFORMS[0].id, topic: '', campaign: CAMPAIGNS[0], priority: 'Medium', assignee: AUTHORS[0].name }

/**
 * Weekly content planner - 7 day-of-week columns of draggable PlannerCards.
 * Native HTML5 drag-and-drop (no library) moves a card between days in
 * local state only; "Add Task" opens a small inline form for the target day.
 */
export default function PostPlannerBoard({ onNotify }) {
  const [tasks, setTasks] = useState(INITIAL_PLANNER_TASKS)
  const [dragOverDay, setDragOverDay] = useState(null)
  const [addDialog, setAddDialog] = useState({ open: false, day: null })
  const [form, setForm] = useState(EMPTY_TASK)

  function handleDragStart(e, taskId) {
    e.dataTransfer.setData('text/plain', taskId)
  }

  function handleDrop(e, day) {
    e.preventDefault()
    setDragOverDay(null)
    const taskId = e.dataTransfer.getData('text/plain')
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, day } : t)))
  }

  function openAddDialog(day) {
    setForm(EMPTY_TASK)
    setAddDialog({ open: true, day })
  }

  function submitTask(e) {
    e.preventDefault()
    if (!form.topic.trim()) return
    const newTask = { id: `t-${Date.now()}`, day: addDialog.day, status: 'Draft', ...form }
    setTasks((prev) => [...prev, newTask])
    setAddDialog({ open: false, day: null })
    onNotify?.(`Task added to ${addDialog.day}`, 'success')
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {WEEKDAYS.map((day) => {
          const dayTasks = tasks.filter((t) => t.day === day)
          return (
            <Card
              key={day}
              onDragOver={(e) => { e.preventDefault(); setDragOverDay(day) }}
              onDragLeave={() => setDragOverDay((d) => (d === day ? null : d))}
              onDrop={(e) => handleDrop(e, day)}
              className={`p-3 flex flex-col gap-2.5 min-h-[220px] transition-colors ${dragOverDay === day ? 'border-primary bg-primary/5' : ''}`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{day}</h4>
                <span className="text-[10.5px] text-muted-foreground font-mono">{dayTasks.length}</span>
              </div>

              <div className="flex flex-col gap-2.5 flex-1">
                {dayTasks.map((task) => (
                  <PlannerCard key={task.id} task={task} onDragStart={handleDragStart} />
                ))}
              </div>

              <button
                onClick={() => openAddDialog(day)}
                className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary border border-dashed rounded-lg py-2 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Task
              </button>
            </Card>
          )
        })}
      </div>

      <Dialog open={addDialog.open} onOpenChange={(open) => setAddDialog((prev) => ({ ...prev, open }))}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Task — {addDialog.day}</DialogTitle>
            <DialogDescription>Plan a new piece of content for this day.</DialogDescription>
          </DialogHeader>

          <form onSubmit={submitTask} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="planner-topic">Topic</Label>
              <Input id="planner-topic" value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} required autoFocus />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Platform</Label>
                <Select value={form.platform} onValueChange={(v) => setForm((f) => ({ ...f, platform: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PUBLISHING_PLATFORMS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Campaign</Label>
                <Select value={form.campaign} onValueChange={(v) => setForm((f) => ({ ...f, campaign: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CAMPAIGNS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Assignee</Label>
                <Select value={form.assignee} onValueChange={(v) => setForm((f) => ({ ...f, assignee: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{AUTHORS.map((u) => <SelectItem key={u.name} value={u.name}>{u.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddDialog({ open: false, day: null })}>Cancel</Button>
              <Button type="submit">Add Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
