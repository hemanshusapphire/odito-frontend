import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const setActiveProject = vi.fn()
const projects = [
  { _id: 'p1', project_name: 'Acme Bakery' },
  { _id: 'p2', project_name: 'Globex Corp' },
]
let ctx
vi.mock('@/contexts/ProjectContext', () => ({ useProject: () => ctx }))
vi.mock('@/components/ui/dropdown-menu', async () => (await import('@/test-utils/socialMediaAI')).dropdownMenuMock())

import { WorkspaceSelector } from './WorkspaceSelector'

describe('WorkspaceSelector — the user\'s real projects (no sample workspace)', () => {
  it('shows the ACTIVE project\'s real name and lists the user\'s real projects', () => {
    ctx = { activeProject: projects[0], projects, setActiveProject, isLoading: false }
    render(<WorkspaceSelector />)
    expect(screen.getByTestId('workspace-selector')).toHaveTextContent('Acme Bakery')
    expect(screen.getByText('Globex Corp')).toBeInTheDocument()
    expect(screen.queryByText(/Sapphire/)).not.toBeInTheDocument()
  })

  it('choosing another project switches the active project through ProjectContext (which scopes every social API call)', () => {
    ctx = { activeProject: projects[0], projects, setActiveProject, isLoading: false }
    render(<WorkspaceSelector />)
    fireEvent.click(screen.getByText('Globex Corp'))
    expect(setActiveProject).toHaveBeenCalledWith(projects[1])
  })

  it('no projects / still loading are honest states', () => {
    ctx = { activeProject: null, projects: [], setActiveProject, isLoading: false }
    const { unmount } = render(<WorkspaceSelector />)
    expect(screen.getByTestId('workspace-selector')).toHaveTextContent('No project')
    expect(screen.getByText('No projects yet')).toBeInTheDocument()
    unmount()
    ctx = { activeProject: null, projects: [], setActiveProject, isLoading: true }
    render(<WorkspaceSelector />)
    expect(screen.getByTestId('workspace-selector')).toHaveTextContent('Loading…')
  })
})
