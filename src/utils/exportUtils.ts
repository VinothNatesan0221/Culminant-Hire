export const exportToGoogleSheets = async (data: any[], filename: string = 'export') => {
  try {
    // Create CSV content
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escape commas and quotes in CSV
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Open Google Sheets import page
    const googleSheetsUrl = 'https://sheets.google.com/create';
    window.open(googleSheetsUrl, '_blank');
    
    return true;
  } catch (error) {
    console.error('Export to Google Sheets failed:', error);
    throw new Error('Failed to export to Google Sheets');
  }
};

export const exportToExcel = (data: any[], filename: string = 'export') => {
  try {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    return true;
  } catch (error) {
    console.error('Export to Excel failed:', error);
    throw new Error('Failed to export to Excel');
  }
};

export const exportToCSV = (data: any[], filename: string = 'export') => {
  try {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    return true;
  } catch (error) {
    console.error('Export to CSV failed:', error);
    throw new Error('Failed to export to CSV');
  }
};