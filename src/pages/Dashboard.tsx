import { useCallback, useEffect, useState } from 'react'
import { getApiErrorMessage } from '../api'
import { DashboardLayout, ToastContainer } from '../components'
import { useAdminAudits } from '../hooks/useAdminAudits'
import { useAdminDashboard } from '../hooks/useAdminDashboard'
import { useAdminUsers } from '../hooks/useAdminUsers'
import { useToasts } from '../hooks/useToasts'
import type { AuthUser } from '../types'
import AuditPage from './admin/audit/AuditPage'
import DashboardHome from './admin/dashboard/DashboardHome'
import ResourcePage from './admin/modules/ResourcePage'
import { moduleConfigs } from './admin/modules/moduleConfig'
import type { AdminView } from './admin/types'
import UsersPage from './admin/users/UsersPage'

type DashboardProps = {
  admin: AuthUser
  onLogout: () => void
}

function Dashboard({ admin, onLogout }: DashboardProps) {
  const [view, setView] = useState<AdminView>('dashboard')
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const { closeToast, pushToast, toasts } = useToasts()

  const handleError = useCallback((error: unknown) => {
    const text = getApiErrorMessage(error)
    pushToast(text, 'error')

    if (text.includes('Token') || text.includes('permisos')) {
      onLogout()
    }
  }, [onLogout, pushToast])

  const dashboard = useAdminDashboard(handleError)
  const { loadDashboard } = dashboard
  const users = useAdminUsers({
    onAfterMutation: async () => {
      await loadDashboard()
    },
    onError: handleError,
    onToast: pushToast,
  })
  const audits = useAdminAudits(users.users, handleError)
  const { loadAudits } = audits

  useEffect(() => {
    void loadDashboard()
    void loadAudits()
  }, [loadAudits, loadDashboard])

  return (
    <DashboardLayout
      adminName={admin.first_name}
      adminRole={admin.role}
      sidebarExpanded={sidebarExpanded}
      view={view}
      onLogout={onLogout}
      onToggleSidebar={() => setSidebarExpanded((current) => !current)}
      onViewChange={setView}
    >
      <ToastContainer toasts={toasts} onClose={closeToast} />

      {view === 'dashboard' && (
        <DashboardHome
          audits={audits.audits}
          stats={dashboard.stats}
          users={users.users}
          onSelectUser={users.selectUser}
          onShowUsers={() => setView('users')}
        />
      )}

      {view === 'users' && (
        <UsersPage
          createErrors={users.createErrors}
          createForm={users.createForm}
          editForm={users.editForm}
          filters={users.filters}
          loading={users.loadingUsers}
          roleChange={users.roleChange}
          roleReasonError={users.roleReasonError}
          savingAction={users.savingAction}
          selectedUser={users.selectedUser}
          statusChange={users.statusChange}
          statusReasonError={users.statusReasonError}
          userAudits={users.userAudits}
          users={users.users}
          onCreateFormChange={users.setCreateForm}
          onCreateUser={users.createUser}
          onEditFormChange={users.setEditForm}
          onFiltersChange={users.setFilters}
          onLoadUsers={users.loadUsers}
          onRoleChange={users.setRoleChange}
          onSelectUser={users.selectUser}
          onStatusChange={users.setStatusChange}
          onUpdateRole={users.updateRole}
          onUpdateStatus={users.updateStatus}
          onUpdateUser={users.updateUser}
        />
      )}

      {view === 'audit' && (
        <AuditPage
          audits={audits.audits}
          filters={audits.auditFilters}
          loading={audits.loadingAudits}
          users={users.users}
          onFiltersChange={audits.setAuditFilters}
          onLoadAudits={audits.loadAudits}
        />
      )}

      {moduleConfigs[view] && (
        <ResourcePage
          key={view}
          config={moduleConfigs[view]}
          onToast={pushToast}
        />
      )}
    </DashboardLayout>
  )
}

export default Dashboard
