import React, { useState, useEffect, useMemo } from 'react';
import { Plus, LayoutGrid, List, Eye } from 'lucide-react';
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
import { projectService } from '../../services/projectService';
import { formatCurrency } from '../../utils/formatters';
import './ProjectsPage.css';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    propertyType: 'Luxury High-rise',
    city: 'Hyderabad',
    location: '',
    totalUnits: '250',
    availableUnits: '180',
    startingPrice: '15000000',
    status: 'Under Construction',
  });

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Filtered dataset
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const name = (p.name || p.projectName || '').toLowerCase();
      const loc = (p.location || p.fullAddress || '').toLowerCase();
      const id = (p.id || p._id || '').toLowerCase();
      const s = search.toLowerCase();

      const matchSearch = !search || name.includes(s) || loc.includes(s) || id.includes(s);
      const matchCity = cityFilter === 'all' || p.city === cityFilter;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;

      return matchSearch && matchCity && matchStatus;
    });
  }, [projects, search, cityFilter, statusFilter]);

  // Calculated metrics
  const totalUnits = useMemo(() => projects.reduce((acc, p) => acc + (p.totalUnits || 0), 0), [projects]);
  const availableUnits = useMemo(() => projects.reduce((acc, p) => acc + (p.availableUnits || 0), 0), [projects]);
  const activeCitiesCount = useMemo(() => new Set(projects.map((p) => p.city)).size, [projects]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim()) return;

    setIsSubmitting(true);
    try {
      await projectService.createProject({
        name: form.name.trim(),
        propertyType: form.propertyType,
        status: form.status,
        location: `${form.location.trim()}, ${form.city}`,
        city: form.city,
        totalUnits: parseInt(form.totalUnits, 10) || 100,
        availableUnits: parseInt(form.availableUnits, 10) || 50,
        startingPrice: parseInt(form.startingPrice, 10) || 10000000,
        possessionDate: '2028',
        reraNumber: 'P-NEW-REGISTERED',
      });

      await loadProjects();
      setIsModalOpen(false);
      setForm({
        name: '',
        propertyType: 'Luxury High-rise',
        city: 'Hyderabad',
        location: '',
        totalUnits: '250',
        availableUnits: '180',
        startingPrice: '15000000',
        status: 'Under Construction',
      });
    } catch (err) {
      console.error('Failed to create project', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'id',
      title: 'Project ID',
      width: '110px',
      render: (val) => <span className="text-semibold text-xs text-muted">{val}</span>,
    },
    {
      key: 'name',
      title: 'Project Name',
      render: (val, row) => (
        <div>
          <div className="project-table__name">{val}</div>
          <div className="project-table__sub">{row.reraNumber}</div>
        </div>
      ),
    },
    {
      key: 'propertyType',
      title: 'Property Type',
    },
    {
      key: 'status',
      title: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'location',
      title: 'Location',
    },
    {
      key: 'totalUnits',
      title: 'Total Units',
      align: 'right',
      render: (val) => val.toLocaleString('en-IN'),
    },
    {
      key: 'availableUnits',
      title: 'Available',
      align: 'right',
      render: (val) => (
        <span className="text-semibold text-primary">{val.toLocaleString('en-IN')}</span>
      ),
    },
    {
      key: 'startingPrice',
      title: 'Starting Price',
      align: 'right',
      render: (val) => (
        <span className="project-table__price">{formatCurrency(val, true)}</span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'center',
      width: '80px',
      render: () => (
        <Button variant="ghost" size="sm" icon={Eye} title="Inspect Project Details" />
      ),
    },
  ];

  return (
    <div className="projects-page">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/admin' },
          { label: 'Property Management' },
          { label: 'Projects' },
        ]}
      />

      <PageHeader
        title="Projects"
        description="Manage real estate projects, locations, and inventory."
        action={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Create Project
          </Button>
        }
      />

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 grid-cols-2-sm grid-cols-4-md gap-sm projects-page__kpis">
        <SummaryCard
          label="Total Projects"
          value={projects.length}
          subtext="Active in portfolio"
        />
        <SummaryCard
          label="Total Units"
          value={totalUnits.toLocaleString('en-IN')}
          subtext="Master development capacity"
        />
        <SummaryCard
          label="Available Inventory"
          value={availableUnits.toLocaleString('en-IN')}
          badgeText={`${Math.round((availableUnits / totalUnits) * 100)}% Available`}
          badgeVariant="primary"
        />
        <SummaryCard
          label="Metro Clusters"
          value={activeCitiesCount}
          subtext="Hyd, Blr, Mum, Pun, Che"
        />
      </div>

      {/* Search & Filter Toolbar */}
      <SearchToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search project name, location, or ID..."
        filters={
          <>
            <Select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Cities' },
                { value: 'Hyderabad', label: 'Hyderabad' },
                { value: 'Bengaluru', label: 'Bengaluru' },
                { value: 'Mumbai', label: 'Mumbai' },
                { value: 'Pune', label: 'Pune' },
                { value: 'Chennai', label: 'Chennai' },
              ]}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'Under Construction', label: 'Under Construction' },
                { value: 'Ready to Move', label: 'Ready to Move' },
                { value: 'Newly Launched', label: 'Newly Launched' },
              ]}
            />
          </>
        }
        actions={
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'table' ? 'view-mode-btn--active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={15} />
            </button>
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'card' ? 'view-mode-btn--active' : ''}`}
              onClick={() => setViewMode('card')}
              title="Card Grid View"
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        }
      />

      {/* Content View: Compact Table or Cards */}
      {loading ? (
        <LoadingSpinner message="Loading projects from database..." />
      ) : viewMode === 'table' ? (
        <DataTable columns={columns} data={filteredProjects} rowKey="id" />
      ) : (
        <div className="grid grid-cols-1 grid-cols-2-sm grid-cols-3-md gap-md">
          {filteredProjects.map((p) => (
            <div key={p.id} className="project-card content-panel">
              <div className="project-card__header">
                <span className="project-card__id">{p.id}</span>
                <StatusBadge status={p.status} />
              </div>
              <h3 className="project-card__title">{p.name}</h3>
              <p className="project-card__location">{p.location}</p>
              <div className="project-card__meta">
                <div>
                  <span className="project-card__meta-label">Starting Price</span>
                  <div className="project-card__meta-val">{formatCurrency(p.startingPrice, true)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="project-card__meta-label">Available Units</span>
                  <div className="project-card__meta-val text-primary">{p.availableUnits} / {p.totalUnits}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal Dialog */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Real Estate Project"
        size="md"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleCreateProject}>
              Save Project
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateProject} className="flex flex-col gap-sm">
          <Input
            label="Project Name"
            required
            placeholder="e.g. Prestige Tech Vista Phase 2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <div className="grid grid-cols-1 grid-cols-2-sm gap-sm">
            <Select
              label="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              options={[
                { value: 'Hyderabad', label: 'Hyderabad' },
                { value: 'Bengaluru', label: 'Bengaluru' },
                { value: 'Mumbai', label: 'Mumbai' },
                { value: 'Pune', label: 'Pune' },
                { value: 'Chennai', label: 'Chennai' },
              ]}
            />

            <Select
              label="Property Type"
              value={form.propertyType}
              onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
              options={[
                { value: 'Luxury High-rise', label: 'Luxury High-rise' },
                { value: 'Premium Apartments', label: 'Premium Apartments' },
                { value: 'Gated Community Villa', label: 'Gated Community Villa' },
                { value: 'Integrated Township', label: 'Integrated Township' },
              ]}
            />
          </div>

          <Input
            label="Micro-market / Location"
            required
            placeholder="e.g. Financial District, Outer Ring Rd"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <div className="grid grid-cols-1 grid-cols-3-md gap-sm">
            <Input
              label="Total Units"
              type="number"
              value={form.totalUnits}
              onChange={(e) => setForm({ ...form, totalUnits: e.target.value })}
            />
            <Input
              label="Available Units"
              type="number"
              value={form.availableUnits}
              onChange={(e) => setForm({ ...form, availableUnits: e.target.value })}
            />
            <Input
              label="Starting Price (₹)"
              type="number"
              value={form.startingPrice}
              onChange={(e) => setForm({ ...form, startingPrice: e.target.value })}
            />
          </div>

          <Select
            label="Development Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[
              { value: 'Under Construction', label: 'Under Construction' },
              { value: 'Ready to Move', label: 'Ready to Move' },
              { value: 'Newly Launched', label: 'Newly Launched' },
            ]}
          />
        </form>
      </Dialog>
    </div>
  );
}
