import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building, Layers, UserCheck, BookmarkCheck, ArrowRight } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import PageHeader from '../../components/common/PageHeader';
import SummaryCard from '../../components/common/SummaryCard';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { operationsService } from '../../services/operationsService';
import { leadService } from '../../services/leadService';
import { formatCurrency } from '../../utils/formatters';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [statsData, leadsData] = await Promise.all([
          operationsService.getAdminStats(),
          leadService.getLeads(),
        ]);
        setStats(statsData);
        setLeads(leadsData);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage message="Aggregating executive enterprise analytics..." />;
  }

  const {
    totalProjects = 0,
    totalUnits = 0,
    availableUnits = 0,
    totalLeads = 0,
    totalPipeline = 0,
    bookingsCount = 0,
    projects = [],
    auditEvents = [],
  } = stats || {};

  return (
    <div className="admin-dashboard">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/admin' },
          { label: 'Executive Operations' },
        ]}
      />

      <PageHeader
        title="Operations Overview"
        description="Enterprise platform summary, project inventory metrics, and pipeline velocity."
        action={
          <div className="flex gap-xs">
            <Button as={Link} to="/admin/projects" variant="primary" size="md">
              View Projects
            </Button>
            <Button as={Link} to="/admin/leads" variant="secondary" size="md">
              View Leads
            </Button>
          </div>
        }
      />

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 grid-cols-2-sm grid-cols-4-md gap-sm admin-dashboard__kpis">
        <SummaryCard
          label="Active Projects"
          value={totalProjects}
          subtext="Verified in MongoDB"
          icon={Building}
        />
        <SummaryCard
          label="Available Inventory"
          value={availableUnits.toLocaleString('en-IN')}
          subtext={`Out of ${totalUnits.toLocaleString('en-IN')} units`}
          icon={Layers}
        />
        <SummaryCard
          label="Active Prospect Pipeline"
          value={totalLeads}
          subtext={formatCurrency(totalPipeline, true)}
          icon={UserCheck}
        />
        <SummaryCard
          label="Bookings & Closures"
          value={bookingsCount}
          badgeText="Verified Database Records"
          badgeVariant="success"
          icon={BookmarkCheck}
        />
      </div>

      {/* Grid: Projects Overview + Recent Activity */}
      <div className="grid grid-cols-1 grid-cols-2-sm gap-md">
        {/* Left: Projects Overview */}
        <div className="content-panel admin-panel">
          <div className="admin-panel__header">
            <h3 className="admin-panel__title">Projects Portfolio Overview</h3>
            <Link to="/admin/projects" className="admin-panel__link">
              <span>All Projects</span>
              <ArrowRight size={12} />
            </Link>
          </div>
          <div className="data-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Location</th>
                  <th>Available</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p._id || p.id}>
                    <td>
                      <strong>{p.projectName || p.name}</strong>
                    </td>
                    <td>{p.city}</td>
                    <td>
                      <span className="text-primary text-semibold">{p.availableUnits}</span> / {p.totalUnits}
                    </td>
                    <td><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">No projects found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Operational Activity */}
        <div className="content-panel admin-panel">
          <div className="admin-panel__header">
            <h3 className="admin-panel__title">Real-Time Operational Audit Feed</h3>
            <span className="text-xs text-muted">Connected Database Logs</span>
          </div>
          <div className="admin-panel__body">
            <div className="admin-audit-list">
              {auditEvents.map((item) => (
                <div key={item.id} className="admin-audit-card">
                  <div className="admin-audit-card__top">
                    <span className="admin-audit-card__event">{item.event}</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="admin-audit-card__meta">
                    <span>Officer: {item.agent}</span>
                    <span className="admin-audit-card__time">{item.time}</span>
                  </div>
                </div>
              ))}
              {auditEvents.length === 0 && (
                <p className="text-muted text-xs p-sm">No activity recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: Lead Acquisition Preview */}
      <div className="content-panel admin-panel" style={{ marginTop: '16px' }}>
        <div className="admin-panel__header">
          <h3 className="admin-panel__title">Lead Acquisition & Sales Pipeline</h3>
          <Link to="/admin/leads" className="admin-panel__link">
            <span>Manage Leads</span>
            <ArrowRight size={12} />
          </Link>
        </div>
        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Prospect</th>
                <th>Assigned Agent</th>
                <th>Interested Project</th>
                <th>Budget</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 6).map((l) => (
                <tr key={l.id || l._id}>
                  <td className="text-muted">{(l.id || l._id).toString().slice(-6)}</td>
                  <td><strong>{l.leadName || l.customerName}</strong></td>
                  <td>{l.assignedAgent}</td>
                  <td>{l.interestedProject}</td>
                  <td>{formatCurrency(l.budget, true)}</td>
                  <td><StatusBadge status={l.status} /></td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted">No leads currently logged.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
