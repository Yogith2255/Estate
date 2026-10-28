import React from 'react';
import './DataTable.css';

/**
 * Enterprise compact data table
 * @param {Object} props
 * @param {Array<{key: string, title: string, render?: Function, align?: 'left'|'center'|'right', width?: string}>} props.columns
 * @param {Array<Object>} props.data
 * @param {string} [props.rowKey]
 * @param {React.ReactNode} [props.emptyState]
 */
export default function DataTable({
  columns = [],
  data = [],
  rowKey = 'id',
  emptyState = null,
}) {
  if (!data || data.length === 0) {
    return (
      <div className="data-table-container">
        {emptyState || (
          <div className="data-table-empty">
            <p>No records found.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    textAlign: col.align || 'left',
                    width: col.width || 'auto',
                  }}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const key = row[rowKey] || index;

              return (
                <tr key={key}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{ textAlign: col.align || 'left' }}
                    >
                      {col.render ? col.render(row[col.key], row, index) : row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="data-table-footer">
        <span className="data-table-footer__count">
          Showing <strong>{data.length}</strong> record{data.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
