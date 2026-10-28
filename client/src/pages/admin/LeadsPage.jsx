import React, { useState, useEffect, useMemo } from 'react';
import { UserPlus, Phone, Mail, Eye, Edit } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import PageHeader from '../../components/common/PageHeader';
import SummaryCard from '../../components/common/SummaryCard';
import SearchToolbar from '../../components/common/SearchToolbar';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Dialog from '../../components/common/Dialog';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { leadService } from '../../services/leadService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './LeadsPage.css';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    leadName: '',
    phone: '',
    email: '',
    assignedAgent: 'Vikram Malhotra',
    status: 'New',
    interestedProject: 'Aparna Cyber Heights',
    budget: '15000000',
    preferredUnitType: '3 BHK',
    nextFollowup: '2026-10-31',
    city: 'Hyderabad',
  });

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await leadService.getLeads();
      setLeads(data);
    } catch (err) {
      console.error('Failed to load leads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  // Filtered dataset
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const name = (l.leadName || l.customerName || '').toLowerCase();
      const phone = (l.phone || '');
      const email = (l.email || '').toLowerCase();
      const project = (l.interestedProject || '').toLowerCase();
      const s = search.toLowerCase();

      const matchSearch = !search || name.includes(s) || phone.includes(s) || email.includes(s) || project.includes(s);
      const matchStatus = statusFilter === 'all' || l.status === statusFilter;
      const matchAgent = agentFilter === 'all' || l.assignedAgent === agentFilter;

      return matchSearch && matchStatus && matchAgent;
    });
  }, [leads, search, statusFilter, agentFilter]);

  // Calculated metrics
  const totalPipelineBudget = useMemo(() => leads.reduce((acc, l) => acc + (l.budget || 0), 0), [leads]);
  const activeLeadsCount = useMemo(
    () => leads.filter((l) => !['Converted', 'Lost'].includes(l.status)).length,
    [leads]
  );
  const siteVisitsCount = useMemo(
    () => leads.filter((l) => l.status === 'Site Visit').length,
    [leads]
  );

  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!form.leadName.trim() || !form.phone.trim()) return;

    setIsSubmitting(true);
    try {
      await leadService.createLead({
        leadName: form.leadName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || 'contact@client.in',
        assignedAgent: form.assignedAgent,
        status: form.status,
        interestedProject: form.interestedProject,
        budget: parseInt(form.budget, 10) || 12000000,
        preferredUnitType: form.preferredUnitType,
        nextFollowup: form.nextFollowup,
        city: form.city,
        source: 'Direct Portal',
      });

      await loadLeads();
      setIsModalOpen(false);
      setForm({
        leadName: '',
        phone: '',
        email: '',
        assignedAgent: 'Vikram Malhotra',
        status: 'New',
        interestedProject: 'Aparna Cyber Heights',
        budget: '15000000',
        preferredUnitType: '3 BHK',
        nextFollowup: '2026-10-31',
        city: 'Hyderabad',
      });
    } catch (err) {
      console.error('Failed to create lead', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'leadName',
      title: 'Lead Name',
      render: (val, row) => (
        <div>
          <div className="lead-table__name">{val}</div>
          <span className="lead-table__id">{row.id}</span>
        </div>
      ),
    },
    {
      key: 'contact',
      title: 'Contact Information',
      render: (_, row) => (
        <div className="lead-table__contact">
          <div className="lead-table__contact-row">
            <Phone size={11} className="lead-table__icon" />
            <span>{row.phone}</span>
          </div>
          <div className="lead-table__contact-row">
            <Mail size={11} className="lead-table__icon" />
            <span>{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'assignedAgent',
      title: 'Assigned Agent',
      render: (val) => <span className="text-medium">{val}</span>,
    },
    {
      key: 'status',
      title: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'interestedProject',
      title: 'Interested Project',
      render: (val) => <span className="lead-table__project">{val}</span>,
    },
    {
      key: 'budget',
      title: 'Budget',
      align: 'right',
      render: (val) => (
        <span className="lead-table__budget">{formatCurrency(val, true)}</span>
      ),
    },
    {
      key: 'preferredUnitType',
      title: 'Unit Type',
      align: 'center',
      render: (val) => <span className="lead-table__unit">{val}</span>,
    },
    {
      key: 'nextFollowup',
      title: 'Next Follow-up',
      render: (val) => (
        <span className="lead-table__followup">{val === 'Completed' ? val : formatDate(val)}</span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'center',
      width: '80px',
      render: () => (
        <div className="lead-table__actions">
          <button type="button" className="table-action-icon-btn" title="View Lead Profile">
            <Eye size={14} />
          </button>
          <button type="button" className="table-action-icon-btn" title="Edit Lead Status">
            <Edit size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="leads-page">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/admin' },
          { label: 'Customer Management' },
          { label: 'Leads' },
        ]}
      />

      <PageHeader
        title="Leads"
        description="Track prospect pipelines, follow-ups, and customer acquisition."
        action={
          <Button
            variant="primary"
            size="md"
            icon={UserPlus}
            onClick={() => setIsModalOpen(true)}
          >
            Create Lead
          </Button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 grid-cols-2-sm grid-cols-4-md gap-sm leads-page__kpis">
        <SummaryCard
          label="Total Prospects"
          value={leads.length}
          subtext="All inquiries in system"
        />
        <SummaryCard
          label="Active Pipeline"
          value={activeLeadsCount}
          badgeText="Active"
          badgeVariant="primary"
        />
        <SummaryCard
          label="Site Visits Due"
          value={siteVisitsCount}
          badgeText="High Intent"
          badgeVariant="warning"
        />
        <SummaryCard
          label="Pipeline Value"
          value={formatCurrency(totalPipelineBudget, true)}
          subtext="Potential deal volume"
        />
      </div>

      {/* Filter and Search Toolbar */}
      <SearchToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search lead name, phone, project..."
        filters={
          <>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'New', label: 'New' },
                { value: 'Contacted', label: 'Contacted' },
                { value: 'Qualified', label: 'Qualified' },
                { value: 'Site Visit', label: 'Site Visit' },
                { value: 'Negotiation', label: 'Negotiation' },
                { value: 'Booking', label: 'Booking' },
                { value: 'Converted', label: 'Converted' },
                { value: 'Lost', label: 'Lost' },
              ]}
            />
            <Select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Agents' },
                { value: 'Vikram Malhotra', label: 'Vikram Malhotra' },
                { value: 'Pooja Hegde', label: 'Pooja Hegde' },
                { value: 'Suresh Patil', label: 'Suresh Patil' },
              ]}
            />
          </>
        }
      />

      {/* Leads Compact Table */}
      {loading ? (
        <LoadingSpinner message="Loading leads from database..." />
      ) : (
        <DataTable columns={columns} data={filteredLeads} rowKey="id" />
      )}

      {/* Create Lead Modal Dialog */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Lead"
        size="md"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleCreateLead}>
              Create Lead
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateLead} className="flex flex-col gap-sm">
          <Input
            label="Prospect Full Name"
            required
            placeholder="e.g. Sanjay Singhania"
            value={form.leadName}
            onChange={(e) => setForm({ ...form, leadName: e.target.value })}
          />

          <div className="grid grid-cols-1 grid-cols-2-sm gap-sm">
            <Input
              label="Phone Number"
              required
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="sanjay.s@gmail.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 grid-cols-2-sm gap-sm">
            <Select
              label="Interested Project"
              value={form.interestedProject}
              onChange={(e) => setForm({ ...form, interestedProject: e.target.value })}
              options={[
                { value: 'Aparna Cyber Heights', label: 'Aparna Cyber Heights (Hyderabad)' },
                { value: 'Prestige Tech Vista', label: 'Prestige Tech Vista (Bengaluru)' },
                { value: 'Godrej Horizon Marina', label: 'Godrej Horizon Marina (Mumbai)' },
                { value: 'Kolte-Patil Tech Greens', label: 'Kolte-Patil Tech Greens (Pune)' },
                { value: 'Casagrand First City', label: 'Casagrand First City (Chennai)' },
              ]}
            />
            <Select
              label="Assigned Agent"
              value={form.assignedAgent}
              onChange={(e) => setForm({ ...form, assignedAgent: e.target.value })}
              options={[
                { value: 'Vikram Malhotra', label: 'Vikram Malhotra' },
                { value: 'Pooja Hegde', label: 'Pooja Hegde' },
                { value: 'Suresh Patil', label: 'Suresh Patil' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 grid-cols-3-md gap-sm">
            <Input
              label="Budget (₹)"
              type="number"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
            />
            <Select
              label="Preferred Unit"
              value={form.preferredUnitType}
              onChange={(e) => setForm({ ...form, preferredUnitType: e.target.value })}
              options={[
                { value: '2 BHK', label: '2 BHK' },
                { value: '3 BHK', label: '3 BHK' },
                { value: '4 BHK', label: '4 BHK' },
                { value: 'Villa', label: 'Villa' },
              ]}
            />
            <Select
              label="Initial Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[
                { value: 'New', label: 'New' },
                { value: 'Contacted', label: 'Contacted' },
                { value: 'Qualified', label: 'Qualified' },
                { value: 'Site Visit', label: 'Site Visit' },
              ]}
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
}
