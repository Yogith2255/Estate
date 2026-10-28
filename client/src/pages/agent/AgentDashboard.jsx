import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, Home, CalendarCheck, Clock, ArrowRight, Phone, MapPin } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import PageHeader from '../../components/common/PageHeader';
import SummaryCard from '../../components/common/SummaryCard';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import { mockLeads } from '../../data/mockLeads';
import { mockProperties } from '../../data/mockProperties';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './AgentDashboard.css';

export default function AgentDashboard() {
  const currentAgent = 'Vikram Malhotra';

  // Agent specific leads & properties
  const agentLeads = useMemo(
    () => mockLeads.filter((l) => l.assignedAgent === currentAgent),
    [currentAgent]
  );

  const agentProperties = useMemo(
    () => mockProperties.filter((p) => p.agent.name === currentAgent),
    [currentAgent]
  );

  const upcomingSiteVisits = useMemo(
    () => agentLeads.filter((l) => l.status === 'Site Visit' || l.status === 'Negotiation'),
    [agentLeads]
  );

  const followupsDue = useMemo(
    () => agentLeads.filter((l) => l.nextFollowup && l.nextFollowup !== 'Completed'),
    [agentLeads]
  );

  return (
    <div className="agent-dashboard">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/admin' },
          { label: 'Agent Workspace' },
          { label: 'Operational Overview' },
        ]}
      />

      <PageHeader
        title="Agent Operations Dashboard"
        description="Assigned client leads, scheduled property inspections, and active listings."
        action={
          <Button as={Link} to="/admin/leads" variant="primary" size="md">
            Manage All Leads
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 grid-cols-2-sm grid-cols-4-md gap-sm agent-dashboard__kpis">
        <SummaryCard
          label="Assigned Leads"
          value={agentLeads.length}
          subtext="Direct prospect inquiries"
          icon={UserCheck}
        />
        <SummaryCard
          label="Active Representations"
          value={agentProperties.length}
          subtext="Exclusive portfolio listings"
          icon={Home}
        />
        <SummaryCard
          label="Upcoming Site Visits"
          value={upcomingSiteVisits.length}
          badgeText="High Priority"
          badgeVariant="warning"
          icon={CalendarCheck}
        />
        <SummaryCard
          label="Follow-ups Scheduled"
          value={followupsDue.length}
          subtext="This operational week"
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 grid-cols-2-sm gap-md">
        {/* Left Column: Upcoming Site Visits */}
        <div className="content-panel agent-panel">
          <div className="agent-panel__header">
            <h3 className="agent-panel__title">Upcoming Client Site Visits</h3>
            <span className="text-xs text-muted">{upcomingSiteVisits.length} Confirmed</span>
          </div>
          <div className="agent-panel__body">
            {upcomingSiteVisits.length === 0 ? (
              <p className="text-muted text-xs">No scheduled visits for this week.</p>
            ) : (
              <div className="agent-visit-list">
                {upcomingSiteVisits.map((visit) => (
                  <div key={visit.id} className="agent-visit-card">
                    <div className="agent-visit-card__top">
                      <span className="agent-visit-card__name">{visit.leadName}</span>
                      <StatusBadge status={visit.status} />
                    </div>
                    <div className="agent-visit-card__project">
                      <MapPin size={12} className="text-muted" />
                      <span>{visit.interestedProject}</span>
                    </div>
                    <div className="agent-visit-card__bottom">
                      <div className="agent-visit-card__contact">
                        <Phone size={11} className="text-muted" />
                        <span>{visit.phone}</span>
                      </div>
                      <span className="agent-visit-card__date">
                        Date: {formatDate(visit.nextFollowup)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Listings Portfolio */}
        <div className="content-panel agent-panel">
          <div className="agent-panel__header">
            <h3 className="agent-panel__title">My Active Representations</h3>
            <Link to="/marketplace/properties" className="agent-panel__link">
              <span>View Public Page</span>
              <ArrowRight size={12} />
            </Link>
          </div>
          <div className="agent-panel__body">
            <div className="agent-listings-list">
              {agentProperties.map((prop) => (
                <div key={prop.id} className="agent-listing-row">
                  <img
                    src={prop.images[0]}
                    alt={prop.title}
                    className="agent-listing-row__img"
                  />
                  <div className="agent-listing-row__info">
                    <div className="agent-listing-row__title">{prop.title}</div>
                    <div className="agent-listing-row__addr">
                      {prop.address.street}, {prop.address.city}
                    </div>
                    <div className="agent-listing-row__price">
                      {formatCurrency(prop.price, true)}
                    </div>
                  </div>
                  <StatusBadge status={prop.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: Recent Lead Interactions */}
      <div className="content-panel agent-panel" style={{ marginTop: '16px' }}>
        <div className="agent-panel__header">
          <h3 className="agent-panel__title">Recent Assigned Leads Pipeline</h3>
          <Link to="/admin/leads" className="agent-panel__link">
            <span>View All Leads</span>
            <ArrowRight size={12} />
          </Link>
        </div>
        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Lead Name</th>
                <th>Phone</th>
                <th>Interested Project</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Next Action</th>
              </tr>
            </thead>
            <tbody>
              {agentLeads.map((l) => (
                <tr key={l.id}>
                  <td><strong>{l.leadName}</strong></td>
                  <td>{l.phone}</td>
                  <td>{l.interestedProject}</td>
                  <td>{formatCurrency(l.budget, true)}</td>
                  <td><StatusBadge status={l.status} /></td>
                  <td>{formatDate(l.nextFollowup)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
