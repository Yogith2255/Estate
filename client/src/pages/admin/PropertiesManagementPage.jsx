import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Home } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import PageHeader from '../../components/common/PageHeader';
import SummaryCard from '../../components/common/SummaryCard';
import SearchToolbar from '../../components/common/SearchToolbar';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { propertyService } from '../../services/propertyService';
import { formatCurrency, formatSqFt } from '../../utils/formatters';

export default function PropertiesManagementPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');

  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      try {
        const data = await propertyService.getProperties();
        setProperties(data);
      } catch (err) {
        console.error('Failed to load properties', err);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, []);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.address.city.toLowerCase().includes(search.toLowerCase());

      const matchType = typeFilter === 'all' || p.listingType === typeFilter;
      const matchCity = cityFilter === 'all' || p.address.city === cityFilter;

      return matchSearch && matchType && matchCity;
    });
  }, [properties, search, typeFilter, cityFilter]);

  const columns = [
    {
      key: 'id',
      title: 'Listing ID',
      width: '100px',
      render: (val) => <span className="text-muted text-xs">{val}</span>,
    },
    {
      key: 'title',
      title: 'Property Title & Address',
      render: (val, row) => (
        <div>
          <div className="text-semibold text-xs">{val}</div>
          <span className="text-muted text-xs">{row.address.street}, {row.address.city}</span>
        </div>
      ),
    },
    {
      key: 'projectId',
      title: 'Associated Project',
      render: (val) => (
        <span className="text-xs">
          {val && typeof val === 'object' && val.projectName
            ? val.projectName
            : 'Not assigned'}
        </span>
      ),
    },
    {
      key: 'propertyType',
      title: 'Category',
    },
    {
      key: 'listingType',
      title: 'Type',
      render: (val) => (
        <span className="text-semibold text-xs">{val === 'sale' ? 'For Sale' : 'For Rent'}</span>
      ),
    },
    {
      key: 'price',
      title: 'Price',
      align: 'right',
      render: (val, row) => (
        <span className="text-semibold">
          {formatCurrency(val, true)}
          {row.listingType === 'rent' && <span className="text-muted text-xs">/mo</span>}
        </span>
      ),
    },
    {
      key: 'specs',
      title: 'Configuration',
      render: (val) => `${val.beds} BHK (${formatSqFt(val.sqft)})`,
    },
    {
      key: 'status',
      title: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'center',
      width: '70px',
      render: (_, row) => (
        <Link to={`/properties/${row.id}`} className="table-action-icon-btn" title="View Public Listing">
          <Eye size={14} />
        </Link>
      ),
    },
  ];

  return (
    <div className="properties-mgmt-page">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/admin' },
          { label: 'Property Management' },
          { label: 'Properties' },
        ]}
      />

      <PageHeader
        title="Property Listings Management"
        description="Active inventory records, pricing configurations, and portal availability."
        action={
          <Button as={Link} to="/agent/new-listing" variant="primary" size="md" icon={Plus}>
            New Property
          </Button>
        }
      />

      <div className="grid grid-cols-1 grid-cols-3-md gap-sm" style={{ marginBottom: '16px' }}>
        <SummaryCard
          label="Total Properties"
          value={properties.length}
          subtext="Verified in marketplace"
          icon={Home}
        />
        <SummaryCard
          label="For Sale"
          value={properties.filter((p) => p.listingType === 'sale').length}
          subtext="Freehold & developer units"
        />
        <SummaryCard
          label="For Rent"
          value={properties.filter((p) => p.listingType === 'rent').length}
          subtext="Corporate & family rentals"
        />
      </div>

      <SearchToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search title, city, or ID..."
        filters={
          <>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Transactions' },
                { value: 'sale', label: 'For Sale' },
                { value: 'rent', label: 'For Rent' },
              ]}
            />
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
          </>
        }
      />

      {loading ? (
        <LoadingSpinner message="Loading property listings from database..." />
      ) : (
        <DataTable columns={columns} data={filtered} rowKey="id" />
      )}
    </div>
  );
}
