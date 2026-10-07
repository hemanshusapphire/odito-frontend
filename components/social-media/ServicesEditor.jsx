"use client"

import { useState } from 'react'
import { Briefcase, ExternalLink, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ConfirmActionDialog } from './ConfirmActionDialog'
import { Field, INPUT, PRIMARY_BUTTON, SECONDARY_BUTTON, ErrorNote } from './FormField'
import { useUpdateSocialBusinessProfile } from '@/hooks/useSocialMediaAI'
import { describeApiError } from '@/lib/socialMedia/failureMessages'
import {
  SERVICE_MAX, STATUS_OPTIONS, statusLabel, EMPTY_SERVICE_DRAFT, serviceToDraft, draftToServicePayload, serviceToPayload,
} from '@/lib/socialMedia/catalog'

function ServiceFormDialog({ service, onClose, onSubmit, pending, error }) {
  const [draft, setDraft] = useState(() => (service ? serviceToDraft(service) : { ...EMPTY_SERVICE_DRAFT }))
  const [touched, setTouched] = useState(false)
  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }))
  const nameMissing = touched && !draft.name.trim()

  function submit(e) {
    e.preventDefault()
    setTouched(true)
    if (!draft.name.trim() || pending) return
    onSubmit(draftToServicePayload(draft, service?.id || null))
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !pending) onClose() }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-slate-200 bg-white text-slate-800 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-slate-900">{service ? 'Edit service' : 'Add a service'}</DialogTitle>
          <DialogDescription className="text-slate-500">What you provide, in your own words. Social AI only talks about services you list here.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-4" data-testid="service-form" noValidate>
          <Field label="Service name" htmlFor="svc-name" error={nameMissing ? 'Give the service a name.' : null}>
            <input id="svc-name" type="text" maxLength={SERVICE_MAX.name} value={draft.name} onChange={set('name')} aria-invalid={nameMissing} className={INPUT} />
          </Field>
          <Field label="Description" htmlFor="svc-description">
            <textarea id="svc-description" rows={3} maxLength={SERVICE_MAX.description} value={draft.description} onChange={set('description')} className={`${INPUT} resize-none`} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Category" htmlFor="svc-category"><input id="svc-category" type="text" maxLength={SERVICE_MAX.category} value={draft.category} onChange={set('category')} className={INPUT} /></Field>
            <Field label="Link (optional)" htmlFor="svc-url"><input id="svc-url" type="text" maxLength={SERVICE_MAX.url} value={draft.serviceUrl} onChange={set('serviceUrl')} placeholder="example.com/service" className={INPUT} /></Field>
          </div>
          <Field label="Features" htmlFor="svc-features" hint="One per line (up to 10)"><textarea id="svc-features" rows={3} value={draft.features} onChange={set('features')} className={`${INPUT} resize-none`} /></Field>
          <Field label="Benefits" htmlFor="svc-benefits" hint="One per line (up to 10)"><textarea id="svc-benefits" rows={3} value={draft.benefits} onChange={set('benefits')} className={`${INPUT} resize-none`} /></Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Tags" htmlFor="svc-tags" hint="Separated by commas"><input id="svc-tags" type="text" value={draft.tags} onChange={set('tags')} className={INPUT} /></Field>
            <Field label="Status" htmlFor="svc-status" hint={STATUS_OPTIONS.find((s) => s.value === draft.status)?.hint}>
              <select id="svc-status" value={draft.status} onChange={set('status')} className={INPUT}>
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
          </div>

          <ErrorNote>{error}</ErrorNote>

          <DialogFooter className="gap-2 sm:gap-2">
            <button type="button" onClick={onClose} disabled={pending} className={SECONDARY_BUTTON}>Cancel</button>
            <button type="submit" disabled={pending} className={PRIMARY_BUTTON}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {pending ? 'Saving…' : service ? 'Save service' : 'Add service'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Services for a SERVICE business: "what services do you provide?". They are stored on the business profile
 * (a bounded list with stable ids), so every change is the profile PUT with the whole list; the list shown is
 * always what the server returned. Each one can later be referenced by id by a content calendar item.
 */
export function ServicesEditor({ projectId, services }) {
  const mutation = useUpdateSocialBusinessProfile(projectId)
  const [editing, setEditing] = useState(null) // null | 'new' | service
  const [deleting, setDeleting] = useState(null)
  const error = mutation.isError ? describeApiError(mutation.error, 'Could not save your services.').message : null
  const atLimit = services.length >= SERVICE_MAX.services

  const save = (next, done) => mutation.mutate({ services: next }, { onSuccess: done })

  function submit(payload) {
    const others = services.map(serviceToPayload)
    const next = payload.id ? others.map((s) => (s.id === payload.id ? payload : s)) : [...others, payload]
    save(next, () => setEditing(null))
  }

  function remove() {
    save(services.filter((s) => s.id !== deleting.id).map(serviceToPayload), () => setDeleting(null))
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" data-testid="services" aria-labelledby="services-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="services-title" className="text-base font-bold text-slate-900">Services</h3>
          <p className="mt-1 text-sm text-slate-500">What services do you provide? Social AI will only talk about the active services you list here.</p>
        </div>
        <button type="button" onClick={() => { mutation.reset(); setEditing('new') }} disabled={atLimit} className={PRIMARY_BUTTON}>
          <Plus className="h-4 w-4" /> Add service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center" data-testid="services-empty">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Briefcase className="h-5 w-5" /></span>
          <p className="text-sm font-semibold text-slate-700">No services added yet.</p>
          <p className="max-w-sm text-sm text-slate-400">Add the services you offer so your strategy and posts are about what you really do.</p>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2" data-testid="services-list">
          {services.map((svc) => (
            <li key={svc.id} className="flex flex-col rounded-xl border border-slate-200 p-4" data-testid={`service-${svc.id}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{svc.name}</p>
                  {svc.category && <p className="truncate text-xs text-slate-400">{svc.category}</p>}
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${svc.status === 'active' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>{statusLabel(svc.status)}</span>
              </div>
              {svc.description && <p className="mt-2 line-clamp-3 text-sm text-slate-600">{svc.description}</p>}
              {svc.benefits.length > 0 && <p className="mt-2 text-xs text-slate-400">Benefits: {svc.benefits.join(' · ')}</p>}
              <div className="mt-3 flex items-center gap-4 pt-1 text-sm">
                <button type="button" onClick={() => { mutation.reset(); setEditing(svc) }} className="inline-flex items-center gap-1 font-medium text-violet-600 hover:text-violet-700" aria-label={`Edit ${svc.name}`}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button type="button" onClick={() => { mutation.reset(); setDeleting(svc) }} className="inline-flex items-center gap-1 font-medium text-red-600 hover:text-red-700" aria-label={`Delete ${svc.name}`}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
                {svc.serviceUrl && (
                  <a href={svc.serviceUrl} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600" aria-label={`Open ${svc.name} page`}>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {atLimit && <p className="mt-3 text-xs text-slate-400">You have reached the limit of {SERVICE_MAX.services} services.</p>}
      {!editing && !deleting && <ErrorNote className="mt-3">{error}</ErrorNote>}

      {editing && (
        <ServiceFormDialog
          service={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSubmit={submit}
          pending={mutation.isPending}
          error={error}
        />
      )}
      <ConfirmActionDialog
        open={!!deleting}
        onOpenChange={(open) => { if (!open) setDeleting(null) }}
        title="Delete this service?"
        description={deleting ? `"${deleting.name}" will be removed from your services. Posts already created are not changed.` : ''}
        confirmLabel="Delete service"
        cancelLabel="Keep it"
        destructive
        pending={mutation.isPending}
        error={deleting ? error : null}
        onConfirm={remove}
      />
    </section>
  )
}

export default ServicesEditor
