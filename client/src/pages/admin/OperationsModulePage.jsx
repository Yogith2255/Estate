import React, { useState } from 'react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import PageHeader from '../../components/common/PageHeader';
import SummaryCard from '../../components/common/SummaryCard';
import SearchToolbar from '../../components/common/SearchToolbar';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import { mockLeads } from '../../data/mockLeads';
import { formatCurrency } from '../../utils/formatters';

/**
 * Enterprise operational sub-module supporting Inventory, Customers, Site Visits, Bookings, Users, and Settings
 */
export default function OperationsModulePage({ moduleType = 'inventory' }) {
  const [search, setSearch] = useState('');

  // Module Configurations
  const configs = {
    inventory: {
      title: 'Inventory Management',
      group: 'Property Management',
      desc: 'Real-time wing, floor, and unit availability across active real estate projects.',
      actionLabel: 'Export Unit Sheet',
      columns: [
        { key: 'unit', title: 'Unit No.', width: '90px', render: (val) => <strong>{val}</strong> },
        { key: 'project', title: 'Project Name' },
        { key: 'type', title: 'Unit Type' },
        { key: 'area', title: 'Carpet Area' },
        { key: 'floor', title: 'Floor' },
        { key: 'price', title: 'Base Price', align: 'right', render: (val) => formatCurrency(val, true) },
        { key: 'status', title: 'Status', render: (val) => <StatusBadge status={val} /> },
      ],
      data: [
        { id: 1, unit: 'A-401', project: 'Aparna Cyber Heights', type: '3 BHK', area: '1,850 sq ft', floor: '4th', price: 16500000, status: 'Available' },
        { id: 2, unit: 'A-402', project: 'Aparna Cyber Heights', type: '3 BHK', area: '1,850 sq ft', floor: '4th', price: 16500000, status: 'Booking' },
        { id: 3, unit: 'B-1204', project: 'Prestige Tech Vista', type: '2 BHK', area: '1,280 sq ft', floor: '12th', price: 12500000, status: 'Available' },
        { id: 4, unit: 'T-2201', project: 'Godrej Horizon Marina', type: '4 BHK', area: '3,400 sq ft', floor: '22nd', price: 42500000, status: 'Site Visit' },
        { id: 5, unit: 'V-08', project: 'Casagrand First City', type: 'Villa', area: '2,900 sq ft', floor: 'G+2', price: 19500000, status: 'Available' },
      ],
    },
    customers: {
      title: 'Customer Directory',
      group: 'Customer Management',
      desc: 'Registered buyers, existing homeowners, and investor accounts.',
      actionLabel: 'Add Customer',
      columns: [
        { key: 'name', title: 'Customer Name', render: (val) => <strong>{val}</strong> },
        { key: 'phone', title: 'Contact Phone' },
        { key: 'email', title: 'Email Address' },
        { key: 'city', title: 'City' },
        { key: 'project', title: 'Allocated Project' },
        { key: 'status', title: 'Customer Tier', render: (val) => <StatusBadge status={val} /> },
      ],
      data: mockLeads.map((l, idx) => ({
        id: idx + 1,
        name: l.leadName,
        phone: l.phone,
        email: l.email,
        city: l.city,
        project: l.interestedProject,
        status: l.status === 'Converted' ? 'Verified' : 'In Review',
      })),
    },
    enquiries: {
      title: 'Customer Enquiries',
      group: 'Customer Management',
      desc: 'Incoming property inquiries, brochure requests, and digital walk-in logs.',
      actionLabel: 'Process Queue',
      columns: [
        { key: 'id', title: 'Ticket ID', width: '90px' },
        { key: 'name', title: 'Prospect' },
        { key: 'phone', title: 'Phone' },
        { key: 'project', title: 'Subject Project' },
        { key: 'message', title: 'Inquiry Note' },
        { key: 'status', title: 'Status', render: (val) => <StatusBadge status={val} /> },
      ],
      data: [
        { id: 'ENQ-801', name: 'Rajesh K. Verma', phone: '+91 98450 21980', project: 'Aparna Cyber Heights', message: 'Requested master floor plans for 3 BHK tower A', status: 'New' },
        { id: 'ENQ-802', name: 'Ananya S. Iyer', phone: '+91 98840 91822', project: 'Prestige Tech Vista', message: 'Bank loan pre-approval assistance enquiry', status: 'Contacted' },
        { id: 'ENQ-803', name: 'Rohit Deshmukh', phone: '+91 98220 77150', project: 'Kolte-Patil Tech Greens', message: 'Weekend morning site visit appointment', status: 'Site Visit' },
      ],
    },
    'site-visits': {
      title: 'Scheduled Site Visits',
      group: 'Sales Operations',
      desc: 'Client property viewings, sample flat walkthroughs, and executive shuttles.',
      actionLabel: 'Book Site Visit',
      columns: [
        { key: 'id', title: 'Visit ID', width: '90px' },
        { key: 'client', title: 'Client' },
        { key: 'project', title: 'Project Location' },
        { key: 'agent', title: 'Conducting Agent' },
        { key: 'date', title: 'Visit Date & Slot' },
        { key: 'status', title: 'Confirmation', render: (val) => <StatusBadge status={val} /> },
      ],
      data: [
        { id: 'VST-201', client: 'Rajesh K. Verma', project: 'Aparna Cyber Heights, Financial Dist', agent: 'Vikram Malhotra', date: '2026-10-28 (11:00 AM)', status: 'Site Visit' },
        { id: 'VST-202', client: 'Divya N. Nair', project: 'Brigade Gateway Oasis, Sarjapur', agent: 'Pooja Hegde', date: '2026-10-29 (03:30 PM)', status: 'Qualified' },
        { id: 'VST-203', client: 'Karthik Subramanian', project: 'Casagrand First City, ECR', agent: 'Vikram Malhotra', date: '2026-10-30 (10:00 AM)', status: 'Contacted' },
      ],
    },
    bookings: {
      title: 'Bookings & Closures',
      group: 'Sales Operations',
      desc: 'Confirmed token bookings, agreement executions, and registration records.',
      actionLabel: 'Generate Allotment',
      columns: [
        { key: 'id', title: 'Booking Ref', width: '110px' },
        { key: 'client', title: 'Client Name' },
        { key: 'project', title: 'Project' },
        { key: 'unit', title: 'Unit' },
        { key: 'amount', title: 'Token Amount', align: 'right', render: (val) => formatCurrency(val, true) },
        { key: 'status', title: 'Stage', render: (val) => <StatusBadge status={val} /> },
      ],
      data: [
        { id: 'BK-501', client: 'Amitabh Sen', project: 'Godrej Horizon Marina', unit: 'T-2201', amount: 2500000, status: 'Booking' },
        { id: 'BK-502', client: 'Sunil Rao', project: 'My Home Bhooja Grand', unit: 'C-1402', amount: 3000000, status: 'Converted' },
      ],
    },
    'follow-ups': {
      title: 'Follow-ups & Tasks',
      group: 'Sales Operations',
      desc: 'Action item calendar for client follow-ups, document collections, and pricing negotiations.',
      actionLabel: 'Schedule Follow-up',
      columns: [
        { key: 'client', title: 'Lead' },
        { key: 'project', title: 'Target Project' },
        { key: 'dueDate', title: 'Due Date' },
        { key: 'task', title: 'Action Item' },
        { key: 'agent', title: 'Responsible Agent' },
        { key: 'priority', title: 'Priority', render: (val) => <StatusBadge status={val} /> },
      ],
      data: [
        { id: 1, client: 'Ananya S. Iyer', project: 'Prestige Tech Vista', dueDate: '2026-10-26', task: 'Review revised payment schedule with builder', agent: 'Pooja Hegde', priority: 'Negotiation' },
        { id: 2, client: 'Rajesh K. Verma', project: 'Aparna Cyber Heights', dueDate: '2026-10-28', task: 'Follow up on site visit feedback and floor selection', agent: 'Vikram Malhotra', priority: 'Site Visit' },
        { id: 3, client: 'Rohit Deshmukh', project: 'Kolte-Patil Tech Greens', dueDate: '2026-10-26', task: 'Send brochure and RERA registration documents', agent: 'Suresh Patil', priority: 'New' },
      ],
    },
    users: {
      title: 'Users & Agent Management',
      group: 'Administration',
      desc: 'Licensed broker credentials, sales agent access control, and organization privileges.',
      actionLabel: 'Add User',
      columns: [
        { key: 'name', title: 'User / Agent' },
        { key: 'email', title: 'Email' },
        { key: 'role', title: 'Role' },
        { key: 'agency', title: 'Branch / Organization' },
        { key: 'status', title: 'Status', render: (val) => <StatusBadge status={val} /> },
      ],
      data: [
        { id: 1, name: 'Vikram Malhotra', email: 'vikram.malhotra@estatehub.in', role: 'Senior Asset Broker / Admin', agency: 'EstateHub Hyderabad Metro', status: 'Active' },
        { id: 2, name: 'Pooja Hegde', email: 'pooja.hegde@estatehub.in', role: 'Managing Partner', agency: 'EstateHub Bengaluru Urban', status: 'Active' },
        { id: 3, name: 'Suresh Patil', email: 'suresh.patil@estatehub.in', role: 'Associate Broker', agency: 'EstateHub Pune Hub', status: 'Active' },
      ],
    },
    settings: {
      title: 'Platform System Settings',
      group: 'Administration',
      desc: 'Enterprise defaults, Indian RERA compliance formats, and currency notations.',
      actionLabel: 'Save Changes',
      columns: [
        { key: 'key', title: 'Configuration Parameter' },
        { key: 'value', title: 'Current Value' },
        { key: 'category', title: 'Domain' },
        { key: 'status', title: 'Status', render: (val) => <StatusBadge status={val} /> },
      ],
      data: [
        { id: 1, key: 'Base Currency & Numbering', value: 'Indian Rupee (INR) / Lakhs & Crores (en-IN)', category: 'Localization', status: 'Active' },
        { id: 2, key: 'Default Primary Micro-markets', value: 'Hyderabad, Bengaluru, Mumbai, Pune, Chennai', category: 'Inventory', status: 'Active' },
        { id: 3, key: 'RERA Document Validation', value: 'Enforced for all listed developer projects', category: 'Compliance', status: 'Verified' },
        { id: 4, key: 'Enterprise Topbar Theme', value: 'Bright Blue (#0788F9) & Navy (#0D2A45)', category: 'Theme', status: 'Active' },
      ],
    },
  };

  const current = configs[moduleType] || configs.inventory;

  const filteredData = current.data.filter((item) => {
    if (!search) return true;
    return Object.values(item).some(
      (val) => typeof val === 'string' && val.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="operations-module-page">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/admin' },
          { label: current.group },
          { label: current.title },
        ]}
      />

      <PageHeader
        title={current.title}
        description={current.desc}
        action={
          <Button variant="primary" size="md">
            {current.actionLabel}
          </Button>
        }
      />

      <div className="grid grid-cols-1 grid-cols-3-md gap-sm" style={{ marginBottom: '16px' }}>
        <SummaryCard
          label="Total Records"
          value={current.data.length}
          subtext="Active in operational database"
        />
        <SummaryCard
          label="Operational Status"
          value="Synchronized"
          badgeText="Live"
          badgeVariant="success"
        />
        <SummaryCard
          label="Regional Cluster"
          value="Pan-India Metro"
          subtext="Hyd, Blr, Mum, Pun, Che"
        />
      </div>

      <SearchToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={`Search ${current.title.toLowerCase()}...`}
      />

      <DataTable columns={current.columns} data={filteredData} rowKey="id" />
    </div>
  );
}
