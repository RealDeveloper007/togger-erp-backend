import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getDashboardMetrics() {
    const [
      totalProducts, lowStockCount, totalCustomers,
      pendingQuotations, acceptedQuotations, totalJobs,
      upcomingJobs, completedJobs, outstandingInvoices,
      revenueData, stockValuation, quotationSummaryRows, invoiceSummaryRows,
    ] = await Promise.all([
      this.dataSource.query(`SELECT COUNT(*) as count FROM products WHERE deleted_at IS NULL AND is_active = true`),
      this.dataSource.query(`
        SELECT COUNT(*) as count FROM products p
        LEFT JOIN (SELECT product_id, SUM(quantity_available) as avail FROM stock_balances GROUP BY product_id) sb ON sb.product_id = p.id
        WHERE p.deleted_at IS NULL AND p.is_active = true AND p.is_stockable = true
        AND COALESCE(sb.avail, 0) <= p.reorder_level
      `),
      this.dataSource.query(`SELECT COUNT(*) as count FROM customers WHERE deleted_at IS NULL AND is_active = true`),
      this.dataSource.query(`SELECT COUNT(*) as count FROM quotations WHERE status IN ('draft','open','sent','viewed') AND deleted_at IS NULL`),
      this.dataSource.query(`SELECT COUNT(*) as count FROM quotations WHERE status = 'accepted' AND deleted_at IS NULL`),
      this.dataSource.query(`SELECT COUNT(*) as count FROM jobs WHERE deleted_at IS NULL`),
      this.dataSource.query(`SELECT COUNT(*) as count FROM jobs WHERE status IN ('pending','scheduled') AND deleted_at IS NULL`),
      this.dataSource.query(`SELECT COUNT(*) as count FROM jobs WHERE status = 'completed' AND deleted_at IS NULL`),
      this.dataSource.query(`SELECT COALESCE(SUM(amount_outstanding), 0) as total FROM invoices WHERE status NOT IN ('paid','cancelled') AND deleted_at IS NULL`),
      this.dataSource.query(`
        SELECT DATE_TRUNC('month', invoice_date::date) as month,
               COALESCE(SUM(grand_total), 0) as revenue,
               COALESCE(SUM(amount_paid), 0) as collected
        FROM invoices WHERE deleted_at IS NULL AND status != 'cancelled'
        AND invoice_date >= NOW() - INTERVAL '12 months'
        GROUP BY 1 ORDER BY 1
      `),
      this.dataSource.query(`
        SELECT COALESCE(SUM(sb.quantity_on_hand * p.purchase_price), 0) as total_value
        FROM stock_balances sb
        JOIN products p ON p.id = sb.product_id
        WHERE p.deleted_at IS NULL
      `),
      this.dataSource.query(`
        SELECT COUNT(*)::int as total_count,
               COALESCE(SUM(grand_total), 0) as total_amount,
               COUNT(*) FILTER (WHERE status IN ('draft', 'open', 'sent', 'viewed'))::int as pending_count,
               COUNT(*) FILTER (WHERE status = 'accepted')::int as confirmed_count,
               COUNT(*) FILTER (WHERE status = 'rejected')::int as rejected_count
        FROM quotations WHERE deleted_at IS NULL
      `),
      this.dataSource.query(`
        SELECT COUNT(*)::int as total_count,
               COALESCE(SUM(grand_total), 0) as total_amount,
               COALESCE(SUM(amount_paid), 0) as received_amount,
               COALESCE(SUM(amount_outstanding), 0) as due_amount,
               COUNT(*) FILTER (WHERE status = 'paid')::int as fully_paid_count,
               COUNT(*) FILTER (WHERE status = 'partially_paid')::int as partially_paid_count,
               COUNT(*) FILTER (WHERE status NOT IN ('paid', 'partially_paid', 'cancelled') AND amount_paid = 0)::int as unpaid_count
        FROM invoices WHERE deleted_at IS NULL AND status <> 'cancelled'
      `),
    ]);

    return {
      totalProducts: parseInt(totalProducts[0]?.count || 0),
      lowStockProducts: parseInt(lowStockCount[0]?.count || 0),
      totalCustomers: parseInt(totalCustomers[0]?.count || 0),
      pendingQuotations: parseInt(pendingQuotations[0]?.count || 0),
      acceptedQuotations: parseInt(acceptedQuotations[0]?.count || 0),
      totalJobs: parseInt(totalJobs[0]?.count || 0),
      upcomingJobs: parseInt(upcomingJobs[0]?.count || 0),
      completedJobs: parseInt(completedJobs[0]?.count || 0),
      outstandingInvoicesTotal: parseFloat(outstandingInvoices[0]?.total || 0),
      stockValuation: parseFloat(stockValuation[0]?.total_value || 0),
      revenueByMonth: revenueData,
      quotationSummary: {
        totalCount: parseInt(quotationSummaryRows[0]?.total_count || 0),
        totalAmount: parseFloat(quotationSummaryRows[0]?.total_amount || 0),
        pendingCount: parseInt(quotationSummaryRows[0]?.pending_count || 0),
        confirmedCount: parseInt(quotationSummaryRows[0]?.confirmed_count || 0),
        rejectedCount: parseInt(quotationSummaryRows[0]?.rejected_count || 0),
      },
      invoiceSummary: {
        totalCount: parseInt(invoiceSummaryRows[0]?.total_count || 0),
        totalAmount: parseFloat(invoiceSummaryRows[0]?.total_amount || 0),
        receivedAmount: parseFloat(invoiceSummaryRows[0]?.received_amount || 0),
        dueAmount: parseFloat(invoiceSummaryRows[0]?.due_amount || 0),
        fullyPaidCount: parseInt(invoiceSummaryRows[0]?.fully_paid_count || 0),
        partiallyPaidCount: parseInt(invoiceSummaryRows[0]?.partially_paid_count || 0),
        unpaidCount: parseInt(invoiceSummaryRows[0]?.unpaid_count || 0),
      },
    };
  }

  async getJobProfitabilityReport(startDate?: string, endDate?: string) {
    let dateFilter = '';
    const params: any[] = [];
    if (startDate) { dateFilter += ` AND j.created_at >= $${params.length + 1}`; params.push(startDate); }
    if (endDate) { dateFilter += ` AND j.created_at <= $${params.length + 1}`; params.push(endDate); }

    return this.dataSource.query(`
      SELECT j.job_number, j.title, j.status,
             c.first_name || ' ' || COALESCE(c.last_name, '') as customer_name,
             j.estimated_total, j.actual_total,
             j.actual_materials_cost, j.actual_labour_cost,
             (j.estimated_total - j.actual_total) as profit_variance,
             CASE WHEN j.estimated_total > 0
                  THEN ROUND(((j.estimated_total - j.actual_total) / j.estimated_total * 100)::numeric, 2)
                  ELSE 0 END as profit_margin_pct
      FROM jobs j
      JOIN customers c ON c.id = j.customer_id
      WHERE j.deleted_at IS NULL ${dateFilter}
      ORDER BY j.created_at DESC
    `, params);
  }

  async getStockValuationReport() {
    return this.dataSource.query(`
      SELECT p.sku, p.name, p.model_number,
             b.name as brand,
             sl.name as location,
             sb.quantity_on_hand, sb.quantity_reserved, sb.quantity_available,
             p.purchase_price,
             (sb.quantity_on_hand * p.purchase_price) as total_value,
             p.reorder_level,
             CASE WHEN sb.quantity_available <= p.reorder_level THEN true ELSE false END as is_low_stock
      FROM stock_balances sb
      JOIN products p ON p.id = sb.product_id
      JOIN stock_locations sl ON sl.id = sb.location_id
      LEFT JOIN brands b ON b.id = p.brand_id
      WHERE p.deleted_at IS NULL AND p.is_active = true
      ORDER BY p.name ASC
    `);
  }

  async getRevenueReport(startDate?: string, endDate?: string) {
    let dateFilter = 'WHERE inv.deleted_at IS NULL AND inv.status != \'cancelled\'';
    const params: any[] = [];
    if (startDate) { dateFilter += ` AND inv.invoice_date >= $${params.length + 1}`; params.push(startDate); }
    if (endDate) { dateFilter += ` AND inv.invoice_date <= $${params.length + 1}`; params.push(endDate); }

    return this.dataSource.query(`
      SELECT inv.invoice_number, inv.invoice_date, inv.due_date,
             c.first_name || ' ' || COALESCE(c.last_name, c.company_name, '') as customer_name,
             inv.grand_total, inv.amount_paid, inv.amount_outstanding,
             inv.status, inv.vat_amount
      FROM invoices inv
      JOIN customers c ON c.id = inv.customer_id
      ${dateFilter}
      ORDER BY inv.invoice_date DESC
    `, params);
  }
}
