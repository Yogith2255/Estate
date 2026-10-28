import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import PageHeader from '../../components/common/PageHeader';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { propertyTypes } from '../../data/mockCategories';
import { propertyService } from '../../services/propertyService';
import { projectService } from '../../services/projectService';
import './AddListingPage.css';

export default function AddListingPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    price: '',
    projectId: '',
    listingType: 'sale',
    propertyType: 'apartment',
    street: '',
    city: 'Hyderabad',
    state: 'Telangana',
    zipCode: '500032',
    beds: '3',
    baths: '3',
    sqft: '1850',
    description: '',
  });
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectLoadError, setProjectLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        const data = await projectService.getProjects();

        if (!cancelled) {
          setProjects(data);
        }
      } catch (err) {
        if (!cancelled) {
          setProjectLoadError('Unable to load projects. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setProjectsLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError('');

    try {
      const propertyData = {
        title: form.title.trim(),
        price: Number(form.price),
        projectId: form.projectId || null,
        listingType: form.listingType,
        propertyType: form.propertyType,
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zipCode: form.zipCode.trim(),
        beds: Number(form.beds),
        baths: Number(form.baths),
        sqft: Number(form.sqft),
        description: form.description.trim(),
      };

      const response = await propertyService.createProperty(propertyData);

      if (!response?.success || !response?.data?.property?._id) {
        throw new Error(
          response?.message || 'The property was not confirmed as saved.'
        );
      }

      setSuccess(true);
    } catch (err) {
      console.error('Failed to create property:', err);
      setError(
        err.message || 'Failed to publish the listing. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="add-listing-success">
        <div className="add-listing-success__box content-panel">
          <div className="add-listing-success__icon">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="add-listing-success__title">Listing Published Successfully</h2>
          <p className="add-listing-success__text">
            "{form.title || 'New Residence'}" has been added to the EstateHub database and assigned to your agency profile.
          </p>
          <div className="add-listing-success__actions">
            <Button variant="primary" size="md" onClick={() => navigate('/agent/listings')}>
              Return to Agent Dashboard
            </Button>
            <Button variant="secondary" size="md" onClick={() => setSuccess(false)}>
              Publish Another Listing
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-listing-page">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/admin' },
          { label: 'Agent Portal', to: '/agent/listings' },
          { label: 'Create Listing' },
        ]}
      />

      <PageHeader
        title="Create Property Listing"
        description="Add a new verified residential representation to your operational portfolio."
      />

      <form onSubmit={handleSubmit} className="add-listing-form">
        {error && (
          <div
            role="alert"
            style={{
              color: '#b42318',
              background: '#fef3f2',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}
        <Card>
          <Card.Header>
            <h3>1. Property Overview</h3>
          </Card.Header>
          <Card.Body className="add-listing-form__grid">
            <Input
              label="Listing Title"
              name="title"
              required
              placeholder="e.g. Prestige Boulevard Smart 3 BHK Residence"
              value={form.title}
              onChange={handleChange}
            />

            <div className="grid grid-cols-1 grid-cols-2-sm gap-md">
              <Select
                label="Transaction Type"
                name="listingType"
                value={form.listingType}
                onChange={handleChange}
                options={[
                  { value: 'sale', label: 'For Sale' },
                  { value: 'rent', label: 'For Rent' },
                ]}
              />

              <Select
                label="Property Category"
                name="propertyType"
                value={form.propertyType}
                onChange={handleChange}
                options={propertyTypes.filter((t) => t.id !== 'all')}
              />
            </div>

            <Input
              label="Price (in INR ₹)"
              name="price"
              type="number"
              required
              placeholder="e.g. 18500000"
              value={form.price}
              onChange={handleChange}
            />
            <div className="input-field">
              <label className="input-field__label" htmlFor="projectId">
                Associated Project
              </label>

              <select
                id="projectId"
                name="projectId"
                className="input-field__input"
                value={form.projectId}
                onChange={handleChange}
                disabled={projectsLoading}
              >
                <option value="">
                  {projectsLoading ? 'Loading projects...' : 'Select a project (optional)'}
                </option>

                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              {projectLoadError && (
                <p role="alert" style={{ color: '#b42318' }}>
                  {projectLoadError}
                </p>
              )}
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h3>2. Micro-Market & Address</h3>
          </Card.Header>
          <Card.Body className="add-listing-form__grid">
            <Input
              label="Street Address / Building"
              name="street"
              required
              placeholder="e.g. Financial District Outer Ring Rd"
              value={form.street}
              onChange={handleChange}
            />

            <div className="grid grid-cols-1 grid-cols-3-md gap-md">
              <Select
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                options={[
                  { value: 'Hyderabad', label: 'Hyderabad' },
                  { value: 'Bengaluru', label: 'Bengaluru' },
                  { value: 'Mumbai', label: 'Mumbai' },
                  { value: 'Pune', label: 'Pune' },
                  { value: 'Chennai', label: 'Chennai' },
                ]}
              />
              <Input
                label="State"
                name="state"
                value={form.state}
                onChange={handleChange}
              />
              <Input
                label="PIN Code"
                name="zipCode"
                value={form.zipCode}
                onChange={handleChange}
              />
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h3>3. Specifications</h3>
          </Card.Header>
          <Card.Body className="add-listing-form__grid">
            <div className="grid grid-cols-1 grid-cols-3-md gap-md">
              <Input
                label="Beds (BHK)"
                name="beds"
                type="number"
                value={form.beds}
                onChange={handleChange}
              />
              <Input
                label="Bathrooms"
                name="baths"
                type="number"
                value={form.baths}
                onChange={handleChange}
              />
              <Input
                label="Super Built-up Area (sq ft)"
                name="sqft"
                type="number"
                value={form.sqft}
                onChange={handleChange}
              />
            </div>

            <div className="input-field">
              <label className="input-field__label">Description</label>
              <textarea
                name="description"
                rows={3}
                className="input-field__input"
                style={{ height: 'auto', padding: '8px' }}
                placeholder="Highlight floor height, ventilation, amenities..."
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </Card.Body>
        </Card>

        <div className="add-listing-form__actions">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
          >
            Publish Listing
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => navigate('/agent/listings')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
