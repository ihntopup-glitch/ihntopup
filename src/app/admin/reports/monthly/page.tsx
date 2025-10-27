'use client';

import { useMemo, useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Order, User } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, DollarSign, Download, Users, CreditCard, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';


type MonthlySummary = {
  revenue: number;
  orders: number;
  newUsers: number;
};

export default function MonthlyReportsPage() {
  const firestore = useFirestore();
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const usersQuery = useMemoFirebase(() => (firestore ? query(collection(firestore, 'users')) : null), [firestore]);
  const allOrdersQuery = useMemoFirebase(() => (firestore ? query(collection(firestore, 'orders')) : null), [firestore]);

  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);
  const { data: allOrders, isLoading: isLoadingAllOrders } = useCollection<Order>(allOrdersQuery);

  const monthlyData = useMemo(() => {
    if (!allOrders || !users) return {};

    const dataByMonth: Record<string, MonthlySummary> = {};

    allOrders.forEach(order => {
      const orderDate = new Date(order.orderDate);
      const monthKey = `${orderDate.getFullYear()}-${(orderDate.getMonth() + 1).toString().padStart(2, '0')}`;

      if (!dataByMonth[monthKey]) {
        dataByMonth[monthKey] = { revenue: 0, orders: 0, newUsers: 0 };
      }
      
      dataByMonth[monthKey].orders += 1;
      if (order.status === 'Completed') {
        dataByMonth[monthKey].revenue += order.totalAmount;
      }
    });

    users.forEach(user => {
      let userCreationDate: Date | null = null;
       if (user.createdAt && typeof user.createdAt.toDate === 'function') {
        userCreationDate = user.createdAt.toDate();
      } else if (typeof user.createdAt === 'string') {
        userCreationDate = new Date(user.createdAt);
      }
      
      if (userCreationDate) {
        const monthKey = `${userCreationDate.getFullYear()}-${(userCreationDate.getMonth() + 1).toString().padStart(2, '0')}`;
        if (dataByMonth[monthKey]) {
          dataByMonth[monthKey].newUsers += 1;
        } else {
           dataByMonth[monthKey] = { revenue: 0, orders: 0, newUsers: 1 };
        }
      }
    });
    
    // Sort months chronologically
    const sortedMonths = Object.keys(dataByMonth).sort().reverse();
    const sortedData: Record<string, MonthlySummary> = {};
    for (const month of sortedMonths) {
        sortedData[month] = dataByMonth[month];
    }

    return sortedData;
  }, [allOrders, users]);

  const handleDownload = (monthKey: string, data: MonthlySummary) => {
    setIsDownloading(monthKey);
    
    const [year, monthNum] = monthKey.split('-');
    const monthName = new Date(Number(year), Number(monthNum) - 1).toLocaleString('default', { month: 'long' });
    const formattedDate = new Date().toLocaleDateString();

    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('IHN TOPUP', 14, 22);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${formattedDate}`, 150, 22);
    
    doc.setLineWidth(0.5);
    doc.line(14, 25, 200, 25);

    // Title
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(`Monthly Report - ${monthName} ${year}`, 105, 40, { align: 'center' });

    // Content
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, 60);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Revenue:`, 20, 70);
    doc.setFont('helvetica', 'bold');
    doc.text(`৳${data.revenue.toFixed(2)}`, 60, 70);

    doc.setFont('helvetica', 'normal');
    doc.text(`Total Orders:`, 20, 80);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.orders}`, 60, 80);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`New Users:`, 20, 90);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.newUsers}`, 60, 90);

    // Footer
    doc.setLineWidth(0.5);
    doc.line(14, 280, 200, 280);
    doc.setFontSize(10);
    doc.text('© IHN TOPUP - Confidential', 105, 285, { align: 'center' });


    doc.save(`Report-${monthName}-${year}.pdf`);
    setIsDownloading(null);
  };

  const isLoading = isLoadingUsers || isLoadingAllOrders;

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart className='h-6 w-6'/>
            Monthly Reports
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(monthlyData).map(([month, data]) => {
          const [year, monthNum] = month.split('-');
          const monthName = new Date(Number(year), Number(monthNum) - 1).toLocaleString('default', { month: 'long' });

          return (
            <Card key={month} id={`report-card-${month}`}>
              <CardHeader>
                <CardTitle>{monthName} {year}</CardTitle>
                <CardDescription>Summary for {monthName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center gap-4 text-sm p-3 rounded-md bg-blue-50 border border-blue-200">
                    <DollarSign className='h-5 w-5 text-blue-500' />
                    <p>Total Revenue: <span className='font-bold'>৳{data.revenue.toFixed(2)}</span></p>
                </div>
                 <div className="flex items-center gap-4 text-sm p-3 rounded-md bg-green-50 border border-green-200">
                    <CreditCard className='h-5 w-5 text-green-500' />
                    <p>Total Orders: <span className='font-bold'>{data.orders}</span></p>
                </div>
                 <div className="flex items-center gap-4 text-sm p-3 rounded-md bg-purple-50 border border-purple-200">
                    <Users className='h-5 w-5 text-purple-500' />
                    <p>New Users: <span className='font-bold'>{data.newUsers}</span></p>
                </div>
              </CardContent>
              <CardFooter>
                 <Button variant="outline" className="w-full" onClick={() => handleDownload(month, data)} disabled={isDownloading === month}>
                    {isDownloading === month ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    {isDownloading === month ? 'Downloading...' : 'Download Report'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
       {Object.keys(monthlyData).length === 0 && !isLoading && (
            <div className='text-center py-16'>
                <p className='text-lg text-muted-foreground'>No data available to generate reports.</p>
            </div>
        )}
    </>
  );
}
