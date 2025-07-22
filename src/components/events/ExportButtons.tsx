
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface Event {
  id: string;
  title: string;
  community: string;
  type: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  datetime: string;
}

interface ExportButtonsProps {
  events: Event[];
}

export const ExportButtons = ({ events }: ExportButtonsProps) => {
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    
    // Header section with gradient-like effect
    doc.setFillColor(59, 130, 246); // Blue color
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('EventSync TocH', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Event Management Report', pageWidth / 2, 30, { align: 'center' });
    
    // Reset text color for body
    doc.setTextColor(33, 37, 41);
    
    // Report metadata
    let yPosition = 60;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
    doc.text(`Total Events: ${events.length}`, margin, yPosition + 10);
    
    // Status summary
    const statusCounts = events.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    yPosition += 30;
    doc.setFont('helvetica', 'bold');
    doc.text('Status Summary:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    
    Object.entries(statusCounts).forEach(([status, count], index) => {
      if (status === 'approved') {
        doc.setTextColor(34, 197, 94);
      } else if (status === 'rejected') {
        doc.setTextColor(239, 68, 68);
      } else {
        doc.setTextColor(234, 179, 8);
      }
      doc.text(`${status.toUpperCase()}: ${count}`, margin + (index * 60), yPosition + 15);
    });
    
    doc.setTextColor(33, 37, 41);
    yPosition += 40;
    
    // Events section
    events.forEach((event, index) => {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 30;
      }
      
      // Event card background
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, yPosition - 5, pageWidth - 2 * margin, 70, 3, 3, 'F');
      
      // Event number and title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(`${index + 1}.`, margin + 5, yPosition + 10);
      
      const titleLines = doc.splitTextToSize(event.title, pageWidth - 2 * margin - 20);
      doc.text(titleLines[0], margin + 15, yPosition + 10);
      
      // Status badge
      if (event.status === 'approved') {
        doc.setFillColor(34, 197, 94);
      } else if (event.status === 'rejected') {
        doc.setFillColor(239, 68, 68);
      } else {
        doc.setFillColor(234, 179, 8);
      }
      doc.roundedRect(pageWidth - margin - 60, yPosition, 55, 12, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(event.status.toUpperCase(), pageWidth - margin - 57, yPosition + 8);
      
      // Event details
      doc.setTextColor(33, 37, 41);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      yPosition += 25;
      doc.text(`Community: ${event.community}`, margin + 15, yPosition);
      doc.text(`Type: ${event.type}`, margin + 15, yPosition + 8);
      doc.text(`Date: ${new Date(event.datetime).toLocaleString()}`, margin + 15, yPosition + 16);
      
      if (event.description) {
        const descLines = doc.splitTextToSize(`Description: ${event.description}`, pageWidth - 2 * margin - 20);
        doc.text(descLines.slice(0, 2), margin + 15, yPosition + 24);
        yPosition += descLines.length > 2 ? 32 : 24;
      } else {
        yPosition += 16;
      }
      
      yPosition += 25;
    });
    
    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      doc.text('EventSync TocH - Event Management System', margin, pageHeight - 10);
    }
    
    doc.save('eventsync-report.pdf');
  };

  const exportToExcel = () => {
    const exportData = events.map(event => ({
      'Event Name': event.title,
      'Community': event.community,
      'Type': event.type,
      'Date & Time': new Date(event.datetime).toLocaleString(),
      'Status': event.status.toUpperCase(),
      'Description': event.description || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Events');
    
    XLSX.writeFile(wb, 'eventsync-report.xlsx');
  };

  return (
    <div className="flex gap-2">
      <Button onClick={exportToPDF} variant="outline">
        <Download className="w-4 h-4 mr-2" />
        Export PDF
      </Button>
      <Button onClick={exportToExcel} variant="outline">
        <Download className="w-4 h-4 mr-2" />
        Export Excel
      </Button>
    </div>
  );
};
